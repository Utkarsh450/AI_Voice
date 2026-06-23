import psycopg
import os
import dotenv

dotenv.load_dotenv(".env")
conn = psycopg.connect(os.getenv("DATABASE_URL"))
cur = conn.cursor()
cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name='knowledge_base';")
print(cur.fetchall())
