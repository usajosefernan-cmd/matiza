import sqlite3
import os

db_path = os.environ.get('SQLITE_DB_PATH', '/home/ubuntu/db/matiza/matiza.db')
print(f"Limpiando base de datos: {db_path}")

try:
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Eliminar registros de scraped_items y articles
    cur.execute(
        "DELETE FROM scraped_items WHERE metrics_json LIKE ? OR url LIKE ? OR id LIKE ?",
        ('%photo-1541872703-74c5e44368f9%', '%C6hM7s9oGZ3%', '%radar-instagram%')
    )
    scraped_del = cur.rowcount

    cur.execute(
        "DELETE FROM articles WHERE multimedia_url LIKE ? OR origin_url LIKE ? OR id LIKE ?",
        ('%photo-1541872703-74c5e44368f9%', '%C6hM7s9oGZ3%', '%radar-instagram%')
    )
    articles_del = cur.rowcount
    
    deleted_count = scraped_del + articles_del
    conn.commit()
    conn.close()
    print(f"✅ Se eliminaron {deleted_count} registros mockeados correctamente.")
except Exception as e:
    print(f"❌ Error al limpiar la base de datos: {e}")
