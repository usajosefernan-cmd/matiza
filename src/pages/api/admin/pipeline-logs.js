import fs from 'node:fs';
import path from 'node:path';

export const prerender = false;

export async function GET() {
  const logFile = path.join(process.cwd(), 'data/logs/pipeline.log');
  if (!fs.existsSync(logFile)) {
    return new Response(JSON.stringify({ logs: ['> Sin registros de actividad del motor Hermes todavía.'] }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const content = fs.readFileSync(logFile, 'utf8');
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    // Tomar las últimas 150 líneas para evitar sobrecargar el DOM
    const lastLines = lines.slice(-150);
    return new Response(JSON.stringify({ logs: lastLines }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
