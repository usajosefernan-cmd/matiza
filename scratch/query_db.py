import sqlite3
import os

db_path = os.environ.get('SQLITE_DB_PATH', '/home/ubuntu/workspace/projects/matiza/data/matiza.db')
print(f"Conectando a {db_path}...")

conn = sqlite3.connect(db_path)
cur = conn.cursor()
cur.execute("SELECT id, slug, title, verdict, status FROM articles WHERE status = 'borrador' ORDER BY created_at DESC LIMIT 3")
rows = cur.fetchall()

print(f"Borradores en cola de moderación:")
for row in rows:
    print(f"ID: {row[0]}, SLUG: {row[1]}, TITLE: {row[2][:50]}, VERDICT: {row[3]}, STATUS: {row[4]}")

conn.close()
