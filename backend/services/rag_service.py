import os
import asyncio
from openai import AsyncOpenAI

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

class RAGService:
    def __init__(self):
        self.client = AsyncOpenAI()
        self.vectorstore = None
        self._lock = asyncio.Lock()

    async def _get_vectorstore(self):
        async with self._lock:
            if self.vectorstore is not None:
                return self.vectorstore
                
            db_url = os.getenv("DATABASE_URL")
            if not db_url:
                raise ValueError("DATABASE_URL not found in environment!")
                
            # Convert connection string for psycopg3 (required by langchain-postgres)
            connection = db_url.replace("postgresql://", "postgresql+psycopg://")
            
            from langchain_postgres import PGEngine, PGVectorStore
            from langchain_openai import OpenAIEmbeddings
            
            embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
            engine = PGEngine.from_connection_string(connection)
            
            # Ensure the pgvector table exists (dimension is 1536 for text-embedding-3-small)
            try:
                await engine.ainit_vectorstore_table(
                    table_name="knowledge_base",
                    vector_size=1536
                )
            except Exception as e:
                # If table already exists, ignore the error
                if "already exists" in str(e).lower() or "42P07" in str(e):
                    pass
                else:
                    raise e
            
            self.vectorstore = await PGVectorStore.create(
                engine=engine,
                table_name="knowledge_base",
                embedding_service=embeddings
            )
            return self.vectorstore

    async def ingest_document(
        self,
        file_path: str,
        document_id: int = None,
    ) -> int:
        """
        Load PDF -> Split -> Embed -> Store in PostgreSQL using pgvector
        """
        print(f"Ingesting document: {file_path} (ID: {document_id})")

        loader = PyPDFLoader(file_path)
        docs = loader.load()

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            add_start_index=True,
        )

        splits = splitter.split_documents(docs)

        import uuid
        from langchain_core.documents import Document
        
        langchain_docs = []
        for doc in splits:
            meta = {**(doc.metadata or {})}
            if document_id is not None:
                meta["document_id"] = document_id
            
            doc_uuid = str(uuid.uuid4())
            
            langchain_docs.append(
                Document(
                    page_content=doc.page_content,
                    metadata=meta,
                    id=doc_uuid
                )
            )

        vectorstore = await self._get_vectorstore()
        await vectorstore.aadd_documents(langchain_docs)

        print(f"Successfully added {len(splits)} chunks to PGVectorStore.")
        return len(splits)

    async def search(
        self,
        query: str,
        n_results: int = 3,
    ) -> list:
        """
        Retrieve relevant document chunks for the given query.
        Returns a list of LangChain Document objects.
        """
        print(f"Querying vector store for search: {query}")
        vectorstore = await self._get_vectorstore()
        results = await vectorstore.asimilarity_search(query, k=n_results)
        print(f"Retrieved {len(results)} chunks from vector store.")
        return results

    async def query_knowledge_base(
        self,
        query: str,
    ) -> str:
        """
        Retrieve context and answer using GPT-4o-mini
        """
        print(f"Query knowledge base: {query}")
        
        docs = await self.search(query, n_results=3)
        context = "\n\n".join([doc.page_content for doc in docs])

        system_prompt = f"""
You are an expert assistant for a customer support AI agent.

Use ONLY the context below.

If the answer is not present,
say:

"I don't know based on the uploaded documents."

Context:
{context}
"""

        response = (
            await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt,
                    },
                    {
                        "role": "user",
                        "content": query,
                    },
                ],
                temperature=0,
            )
        )

        return (
            response
            .choices[0]
            .message
            .content
        )

    async def delete_document(self, document_id: int) -> bool:
        """
        Delete all vector chunks associated with a document_id from PostgreSQL.
        """
        print(f"Deleting vector chunks for document ID: {document_id}")
        try:
            if not hasattr(self, 'engine'):
                db_url = os.getenv("DATABASE_URL")
                connection = db_url.replace("postgresql://", "postgresql+psycopg://")
                from sqlalchemy.ext.asyncio import create_async_engine
                self.engine = create_async_engine(connection, pool_size=5, max_overflow=10)
            
            from sqlalchemy import text
            
            async with self.engine.begin() as conn:
                # langchain-postgres stores metadata in the 'cmetadata' JSONB column.
                # We cast the JSON extracted value to an integer for exact matching.
                query = text("DELETE FROM knowledge_base WHERE (langchain_metadata->>'document_id')::int = :doc_id")
                await conn.execute(query, {"doc_id": document_id})
                
            print(f"Successfully deleted vectors for document ID: {document_id}")
            return True
        except Exception as e:
            print(f"Error deleting document vectors: {e}")
            return False

rag_service = RAGService()