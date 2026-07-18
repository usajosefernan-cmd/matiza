import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = path.resolve('data/matiza.db');
const db = new DatabaseSync(dbPath);

console.log('--- VERIFICACIÓN DE TRANSACCIONES REALES ---');
try {
  // Forzar checkpoint de SQLite WAL para volcar las escrituras al archivo principal
  db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
  console.log('✓ Checkpoint WAL ejecutado con éxito.');

  // Contar registros por plataforma en scraped_items
  const counts = db.prepare("SELECT platform, count(*) as total FROM scraped_items GROUP BY platform").all();
  console.log('Registros totales por plataforma en la DB unificada:');
  counts.forEach(c => {
    console.log(`- Plataforma: ${c.platform} | Total: ${c.total}`);
  });

  // Mostrar los 3 claims más recientes de TikTok
  console.log('\nÚltimos 3 claims capturados de TikTok:');
  const tiktoks = db.prepare("SELECT id, text, virality_score, created_at FROM scraped_items WHERE platform = 'TikTok' ORDER BY created_at DESC LIMIT 3").all();
  tiktoks.forEach((t, idx) => {
    console.log(`[${idx+1}] ID: ${t.id} | Virality: ${t.virality_score}`);
    console.log(`    Texto: "${t.text.substring(0, 100)}..."`);
  });

} catch (err) {
  console.error('Error:', err.message);
} finally {
  db.close();
}
