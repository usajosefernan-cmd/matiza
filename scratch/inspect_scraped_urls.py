import sqlite3
import os

db_path = os.environ.get('SQLITE_DB_PATH', '/home/ubuntu/db/matiza/matiza.db')
print(f"Conectando a {db_path}...")

conn = sqlite3.connect(db_path)
cur = conn.cursor()

print("--- URLS DE INSTAGRAM ---")
cur.execute("SELECT id, url, author_public_name FROM scraped_items WHERE platform = 'Instagram' LIMIT 15")
for row in cur.fetchall():
    print(f"ID: {row[0]}\nURL: {repr(row[1])}\nAUTOR: {repr(row[2])}\n")

print("--- URLS DE TIKTOK ---")
cur.execute("SELECT id, url, author_public_name FROM scraped_items WHERE platform = 'TikTok' LIMIT 15")
for row in cur.fetchall():
    print(f"ID: {row[0]}\nURL: {repr(row[1])}\nAUTOR: {repr(row[2])}\n")

print("--- URLS DE X ---")
cur.execute("SELECT id, url, author_public_name FROM scraped_items WHERE platform = 'X' LIMIT 15")
for row in cur.fetchall():
    print(f"ID: {row[0]}\nURL: {repr(row[1])}\nAUTOR: {repr(row[2])}\n")

conn.close()
