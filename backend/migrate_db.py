import asyncio
from database.prisma_client import db

async def main():
    print("Connecting to DB...")
    await db.connect()
    print("Creating SystemSetting table...")
    await db.execute_raw('''
    CREATE TABLE IF NOT EXISTS "SystemSetting" (
        "id" SERIAL NOT NULL,
        "key" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "category" TEXT NOT NULL DEFAULT 'general',
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
    );
    ''')
    await db.execute_raw('''
    CREATE UNIQUE INDEX IF NOT EXISTS "SystemSetting_key_key" ON "SystemSetting"("key");
    ''')
    print("Table created successfully!")
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
