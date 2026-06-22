import os
from openai import AsyncOpenAI

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma


class RAGService:
    def __init__(self):
        self.client = AsyncOpenAI()

        self.persist_directory = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            "vector_store",
        )

        os.makedirs(
            self.persist_directory,
            exist_ok=True,
        )

        self.vectorstore = Chroma(
            persist_directory=self.persist_directory,
            collection_name="knowledge_base",
        )

    async def ingest_document(
        self,
        file_path: str,
        document_id: int = None,
    ) -> int:
        """
        Load PDF -> Split -> Embed -> Store in Chroma
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

        texts = [
            doc.page_content
            for doc in splits
        ]

        embeddings_response = (
            await self.client.embeddings.create(
                model="text-embedding-3-small",
                input=texts,
            )
        )

        embeddings = [
            item.embedding
            for item in embeddings_response.data
        ]

        import uuid
        ids = [
            f"doc_{document_id}_{uuid.uuid4()}" if document_id is not None else f"doc_{uuid.uuid4()}"
            for _ in range(len(splits))
        ]

        metadatas = []
        for doc in splits:
            meta = {**(doc.metadata or {})}
            if document_id is not None:
                meta["document_id"] = document_id
            metadatas.append(meta)

        self.vectorstore._collection.add(
            ids=ids,
            documents=texts,
            embeddings=embeddings,
            metadatas=metadatas,
        )

        self.vectorstore.persist()

        print(
            f"Added {len(splits)} chunks."
        )

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
        from langchain_core.documents import Document

        print(f"Querying vector store for search: {query}")

        query_embedding = (
            await self.client.embeddings.create(
                model="text-embedding-3-small",
                input=query,
            )
        )

        embedding = (
            query_embedding
            .data[0]
            .embedding
        )

        results = (
            self.vectorstore._collection.query(
                query_embeddings=[embedding],
                n_results=n_results,
            )
        )

        documents = []
        if results and "documents" in results and results["documents"]:
            docs_list = results["documents"][0]
            metadatas_list = results["metadatas"][0] if "metadatas" in results and results["metadatas"] else [{}] * len(docs_list)
            ids_list = results["ids"][0] if "ids" in results and results["ids"] else [""] * len(docs_list)

            for doc_text, meta, doc_id in zip(docs_list, metadatas_list, ids_list):
                documents.append(
                    Document(
                        page_content=doc_text,
                        metadata={**(meta or {}), "id": doc_id}
                    )
                )

        print(f"Retrieved {len(documents)} chunks from vector store.")
        return documents

    async def query_knowledge_base(
        self,
        query: str,
    ) -> str:
        """
        Retrieve context and answer using GPT-4o-mini
        """

        print(
            f"Query: {query}"
        )

        query_embedding = (
            await self.client.embeddings.create(
                model="text-embedding-3-small",
                input=query,
            )
        )

        embedding = (
            query_embedding
            .data[0]
            .embedding
        )

        results = (
            self.vectorstore._collection.query(
                query_embeddings=[embedding],
                n_results=3,
            )
        )

        docs = (
            results["documents"][0]
            if results["documents"]
            else []
        )

        context = "\n\n".join(docs)

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




rag_service = RAGService()