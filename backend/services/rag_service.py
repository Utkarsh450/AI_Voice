import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_openai import ChatOpenAI

class RAGService:
    def __init__(self):
        # We need to make sure the OPENAI_API_KEY is available
        self.persist_directory = os.path.join(os.path.dirname(os.path.dirname(__file__)), "vector_store")
        os.makedirs(self.persist_directory, exist_ok=True)
        
        self.embeddings = OpenAIEmbeddings(
            model="text-embedding-3-small"
        )
        
        self.vectorstore = Chroma(
            persist_directory=self.persist_directory,
            embedding_function=self.embeddings,
            collection_name="knowledge_base"
        )
        
        self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

    async def ingest_document(self, file_path: str):
        """Processes a PDF document and adds its contents to the vector store."""
        print(f"Ingesting document: {file_path}")
        
        # Load PDF
        loader = PyPDFLoader(file_path)
        docs = loader.load()
        
        # Split text into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            add_start_index=True,
        )
        splits = text_splitter.split_documents(docs)
        
        # Add to vector store
        self.vectorstore.add_documents(documents=splits)
        self.vectorstore.persist()
        print(f"Successfully added {len(splits)} chunks to vector store.")
        return len(splits)

    async def query_knowledge_base(self, query: str) -> str:
        """Retrieves relevant context from the vector store based on the query."""
        print(f"Querying knowledge base for: {query}")
        
        retriever = self.vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 3}
        )
        
        system_prompt = (
            "You are an expert assistant for a customer support AI agent. "
            "Use the following pieces of retrieved context to answer the question accurately. "
            "If you don't know the answer, say that you don't know. "
            "Keep the answer concise and relevant to the user's question.\n\n"
            "{context}"
        )
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{input}"),
        ])
        
        question_answer_chain = create_stuff_documents_chain(self.llm, prompt)
        rag_chain = create_retrieval_chain(retriever, question_answer_chain)
        
        response = await rag_chain.ainvoke({"input": query})
        
        return response["answer"]

rag_service = RAGService()
