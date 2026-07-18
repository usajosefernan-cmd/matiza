export const prerender = false;
import { spawn } from 'node:child_process';
import path from 'node:path';
import { loadEnv } from '../../../scripts/matiza-engine/config.js';

loadEnv();

export async function POST({ request }) {
  let job = '';
  try {
    const data = await request.json();
    job = data.job || '';
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: 'Cuerpo de petición inválido.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const validJobs = [
    'cron', 'radar', 'ai', 'sync', 'build', 
    'ai-triage', 'ai-evidence', 'ai-write', 'ai-social',
    'ai-phase-00', 'ai-phase-01', 'ai-phase-02', 'ai-phase-03', 'ai-phase-04', 'ai-phase-05',
    'ai-phase-06', 'ai-phase-07', 'ai-phase-08', 'ai-phase-09', 'ai-phase-10', 'ai-phase-11'
  ];
  if (!validJobs.includes(job)) {
    return new Response(JSON.stringify({ success: false, error: 'Trabajo no válido.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let child = null;
  let isClosed = false;

  // Crear canal de stream para enviar stdout/stderr en tiempo real
  const stream = new ReadableStream({
    async start(controller) {
      const send = (dataObj) => {
        if (isClosed) return;
        try {
          controller.enqueue(new TextEncoder().encode(JSON.stringify(dataObj) + '\n'));
        } catch (e) {
          isClosed = true;
        }
      };

      const safeClose = () => {
        if (isClosed) return;
        isClosed = true;
        try {
          controller.close();
        } catch (e) {}
      };

      send({ status: 'info', message: ` [INICIO] Iniciando ejecución manual del trabajo: ${job.toUpperCase()}` });
      
      // Mostrar proveedor de IA / Clave
      const hasApiKey = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
      send({ 
        status: 'info', 
        message: `🤖 [PROVEEDOR IA] ${hasApiKey ? 'Motor Gemini API Activo (gemini-2.5-flash)' : 'Base de datos estática local de España (Modo Sin Conexión)'}` 
      });

      let cmd = 'node';
      let args = [];

      if (job === 'cron') {
        args = ['scripts/hermes-cron.js'];
      } else if (job === 'radar') {
        args = ['scripts/radar-cron.js'];
      } else if (job === 'ai') {
        args = ['scripts/ai-pipeline.js'];
      } else if (job === 'ai-triage') {
        args = ['scripts/ai-pipeline.js', '--phase=triage'];
      } else if (job === 'ai-evidence') {
        args = ['scripts/ai-pipeline.js', '--phase=evidence'];
      } else if (job === 'ai-write') {
        args = ['scripts/ai-pipeline.js', '--phase=write'];
      } else if (job === 'ai-social') {
        args = ['scripts/ai-pipeline.js', '--phase=social'];
      } else if (job.startsWith('ai-phase-')) {
        const phaseNum = job.replace('ai-phase-', '');
        args = ['scripts/ai-pipeline.js', `--phase=${phaseNum}`];
      } else if (job === 'sync') {
        args = ['scripts/sync.js'];
      } else if (job === 'build') {
        cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
        args = ['run', 'build'];
      }

      send({ status: 'info', message: `💻 [COMANDO] Exec: ${cmd} ${args.join(' ')}` });

      try {
        child = spawn(cmd, args, { env: process.env, shell: true });

        child.stdout.on('data', (data) => {
          if (isClosed) return;
          const lines = data.toString().split('\n');
          for (const line of lines) {
            if (line.trim()) {
              send({ status: 'info', message: line.replace(/\r/g, '') });
            }
          }
        });

        child.stderr.on('data', (data) => {
          if (isClosed) return;
          const lines = data.toString().split('\n');
          for (const line of lines) {
            if (line.trim()) {
              send({ status: 'warn', message: `[STDERR] ${line.replace(/\r/g, '')}` });
            }
          }
        });

        child.on('close', (code) => {
          send({ status: 'info', message: `[PROCESO] Finalizado con código: ${code}` });
          if (code === 0) {
            send({ status: 'success', message: `🎉 [ÉXITO] El proceso ha finalizado correctamente (código de salida 0).` });
          } else {
            send({ status: 'error', message: ` [FALLO] El proceso terminó con el código de salida ${code}.` });
          }
          safeClose();
        });

        child.on('error', (err) => {
          send({ status: 'error', message: ` [ERROR EJECUCIÓN] No se pudo lanzar el subproceso: ${err.message}` });
          safeClose();
        });

      } catch (err) {
        send({ status: 'error', message: ` [ERROR FATAL] ${err.message}` });
        safeClose();
      }
    },
    cancel(reason) {
      isClosed = true;
      if (child && !child.killed) {
        try {
          child.kill();
        } catch (e) {}
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
