import sys
import os
import asyncio
import uuid

# Set SelectorEventLoop on Windows to support psycopg async mode
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# Set up paths relative to this script
script_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(script_dir, ".."))
sys.path.append(backend_dir)

from dotenv import load_dotenv
dotenv_path = os.path.join(backend_dir, ".env")
load_dotenv(dotenv_path)

async def main():
    print("Starting document re-ingestion and persona repair script...")
    
    from database.prisma_client import db
    from services.rag_service import rag_service
    
    # 1. Connect to Prisma DB
    print("Connecting to database...")
    await db.connect()
    
    try:
        # 2. Clear all entries in the PGVectorStore table
        print("Clearing PGVectorStore 'knowledge_base' table...")
        try:
            await db.execute_raw('TRUNCATE TABLE "knowledge_base" CASCADE')
            print("Truncated table successfully.")
        except Exception as e:
            print(f"Table might not exist yet, it will be created on ingestion: {e}")
        
        # 3. Query all documents in DB
        docs = await db.document.find_many()
        print(f"Found {len(docs)} documents in database.")
        
        for d in docs:
            print(f"\nProcessing document {d.id}: {d.name}")
            
            # Resolve document path
            path = d.path
            resolved_path = None
            
            if path.startswith("http://") or path.startswith("https://"):
                resolved_path = path
                print(f"Loading document from remote URL: {resolved_path}")
            else:
                # Local file paths (e.g. "uploads/resume (1).pdf")
                # Make path relative to backend_dir
                resolved_path = os.path.join(backend_dir, path)
                print(f"Loading document from local path: {resolved_path}")
                if not os.path.exists(resolved_path):
                    print(f"WARNING: Local file not found: {resolved_path}")
                    # Try fallback to uploads/ if it is just a name
                    fallback = os.path.join(backend_dir, "uploads", os.path.basename(path))
                    if os.path.exists(fallback):
                        resolved_path = fallback
                        print(f"Found fallback at: {resolved_path}")
                    else:
                        print(f"ERROR: Cannot find local file for {d.name}. Skipping.")
                        continue
            
            try:
                # Ingest document
                chunks = await rag_service.ingest_document(resolved_path, document_id=d.id)
                print(f"Successfully re-ingested {chunks} chunks for {d.name}")
                
                # Mark as processed in database just in case
                await db.document.update(
                    where={"id": d.id},
                    data={"processed": True}
                )
            except Exception as e:
                print(f"Failed to ingest document {d.name}: {repr(e)}")
        
        # 4. Repair/Update Default Personas
        print("\nUpdating default persona descriptions to enable RAG integration...")
        
        personas_updates = {
            "Customer_Support": (
                "Route to this agent when users have product questions, account issues, "
                "troubleshooting requests, need general assistance, or ask about information "
                "in uploaded documents/knowledge base."
            ),
            "Technical_Support": (
                "Route to this agent when users ask about software bugs, APIs, code errors, "
                "debugging, deployment, integrations, technical configurations, or technical "
                "details in uploaded documents/knowledge base."
            ),
            "Sales_Assistant": (
                "Route to this agent when users ask about pricing, plans, features, "
                "subscriptions, product comparisons, purchasing decisions, or sales "
                "documents/material in the knowledge base."
            )
        }
        
        for name, new_desc in personas_updates.items():
            existing = await db.persona.find_unique(where={"name": name})
            if existing:
                await db.persona.update(
                    where={"name": name},
                    data={"description": new_desc}
                )
                print(f"Updated description for persona: {name}")
            else:
                print(f"WARNING: Persona {name} not found in database.")
                
        print("\nVerification of final vector store state:")
        try:
            res = await db.query_raw('SELECT COUNT(*)::integer as count FROM "knowledge_base"')
            final_count = res[0]["count"] if res else 0
            print(f"Final total chunks in PGVectorStore: {final_count}")
        except Exception as e:
            print(f"Could not verify count: {e}")
        
    except Exception as e:
        print(f"An error occurred during re-ingestion: {e}")
        import traceback
        traceback.print_exc()
    finally:
        print("Disconnecting from database...")
        await db.disconnect()
        print("Script complete!")

if __name__ == "__main__":
    asyncio.run(main())
