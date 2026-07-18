import sqlite3
import os

db_path = os.environ.get('SQLITE_DB_PATH', '/home/ubuntu/db/matiza/matiza.db')
print(f"Limpiando artículos previos del post de Instagram en: {db_path}")

try:
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Obtener IDs a borrar
    cur.execute("SELECT id FROM articles WHERE origin_url = ? OR slug LIKE ?", ('https://www.instagram.com/p/C_q8-Iet79U/', 'contraste-de-datos-sobre-bulo-o-post-de-alarma-sobre-ayudas-%'))
    ids = [row[0] for row in cur.fetchall()]
    
    for aid in ids:
        cur.execute("DELETE FROM article_topics WHERE article_id = ?", (aid,))
        cur.execute("DELETE FROM article_tags WHERE article_id = ?", (aid,))
        cur.execute("DELETE FROM sources WHERE article_id = ?", (aid,))
        cur.execute("DELETE FROM social_posts WHERE article_id = ?", (aid,))
        
    cur.execute("DELETE FROM articles WHERE origin_url = ? OR slug LIKE ?", ('https://www.instagram.com/p/C_q8-Iet79U/', 'contraste-de-datos-sobre-bulo-o-post-de-alarma-sobre-ayudas-%'))
    print(f"✅ Se borraron {len(ids)} artículos y sus relaciones asociadas.")
    
    conn.commit()
    conn.close()
except Exception as e:
    print(f"❌ Error al limpiar base de datos: {e}")
