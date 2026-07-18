export const prerender = false;
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { getDatabase, closeDatabase } from '../../lib/db.js';

export async function POST({ request }) {
  let url = '';
  let text = '';

  let bodyText = '';
  try {
    bodyText = await request.text();
    const data = JSON.parse(bodyText || '{}');
    url = data.url || '';
    text = data.text || '';
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: `Cuerpo de petición inválido. Error: ${err.message}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!url || url.trim().length < 5) {
    return new Response(JSON.stringify({ success: false, error: 'Por favor, introduce una URL de post o vídeo válida.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let isClosed = false;

  // Crear canal de stream
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
          closeDatabase();
        } catch (e) {}
        try {
          controller.close();
        } catch (e) {}
      };

      try {
        send({ status: 'info', message: '[CONEXIÓN] Conexión establecida con la web de Matiza.' });
        
        const jobId = `job-web-${Date.now().toString().slice(-6)}`;
        send({ status: 'info', message: `[COLA] Creando orden de verificación con ID: ${jobId}` });

        const db = getDatabase();
        db.prepare(`
          INSERT INTO verification_jobs (id, job_type, input_type, input_url, input_text, priority, status, progress_phase, progress_percent, created_at, updated_at)
          VALUES (?, 'user_verification', 'both', ?, ?, 'high', 'queued', 'En cola esperando motor local', 0, datetime('now'), datetime('now'))
        `).run(jobId, url, text);

        send({ 
          status: 'queued', 
          jobId: jobId, 
          message: 'Trabajo encolado correctamente en el ordenador local de Antigravity. Iniciando monitorización de progreso...' 
        });
        
        safeClose();
      } catch (err) {
        send({ status: 'error', message: `[ERROR COLA] No se pudo encolar: ${err.message}` });
        safeClose();
      }
    },
    cancel(reason) {
      isClosed = true;
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  });
}
