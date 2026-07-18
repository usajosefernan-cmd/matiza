import sqlite3
import os

db_path = os.environ.get('SQLITE_DB_PATH', '/home/ubuntu/db/matiza/matiza.db')
print(f"Reseteando status en base de datos: {db_path}")

try:
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute(
        "UPDATE scraped_items SET status = ? WHERE id = ?",
        ('triage_completado', 'radar-instagram-aHR0cHM6Ly93d3cuaW5zdGFncmFtLmNv')
    )
    print(f"✅ Se actualizaron {cur.rowcount} registros correctamente a 'triage_completado'.")
    conn.commit()
    conn.close()
except Exception as e:
    print(f"❌ Error al resetear el status: {e}")
