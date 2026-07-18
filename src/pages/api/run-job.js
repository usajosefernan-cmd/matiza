export const prerender = false;
import { spawn } from 'node:child_process';
import path from 'node:path';

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

  const validJobs = ['cron', 'radar', 'maintenance', 'build'];
  
  // Mapear ejecuciones en caliente de fases viejas al runner local determinista
  if (job.startsWith('ai-phase-') || job.startsWith('ai-')) {
    job = 'cron'; // Reclamar trabajo en cola local
  }

  if (!validJobs.includes(job)) {
    return new Response(JSON.stringify({ success: false, error: 'Trabajo no válido.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let child = null;
  let isClosed = false;

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

      send({ status: 'info', message: `🚀 [INICIO] Ejecutando comando local de Antigravity: ${job.toUpperCase()}` });
      send({ status: 'info', message: `🤖 [MOTOR] Inferencia nativa offline por el Agente de Antigravity` });

      let cmd = 'node';
      let args = [];

      if (job === 'cron') {
        args = ['scripts/antigravity-runner.js', '--claim'];
      } else if (job === 'radar') {
        args = ['scripts/antigravity-radar.js'];
      } else if (job === 'maintenance') {
        args = ['scripts/antigravity-maintenance.js'];
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
            send({ status: 'success', message: `🎉 [ÉXITO] El proceso ha finalizado correctamente.` });
          } else {
            send({ status: 'error', message: `❌ [FALLO] El proceso terminó con código de error ${code}.` });
          }
          safeClose();
        });

        child.on('error', (err) => {
          send({ status: 'error', message: `❌ [ERROR] No se pudo lanzar el subproceso: ${err.message}` });
          safeClose();
        });

      } catch (err) {
        send({ status: 'error', message: `❌ [ERROR FATAL] ${err.message}` });
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
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
