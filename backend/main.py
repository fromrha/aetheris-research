from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from docling.document_converter import DocumentConverter
import chromadb
from chromadb.utils import embedding_functions
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Docling
converter = DocumentConverter()

# Initialize ChromaDB
client = chromadb.PersistentClient(path="./chroma_db")
# Using local Ollama for embeddings
ollama_ef = embedding_functions.OllamaEmbeddingFunction(
    url="http://localhost:11434/api/embeddings",
    model_name="nomic-embed-text",
)
collection = client.get_or_create_collection(name="research_papers", embedding_function=ollama_ef)

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    # Save file temporarily
    file_path = f"temp_{file.filename}"
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
    
    # Parse with Docling
    result = converter.convert(file_path)
    markdown_content = result.document.export_to_markdown()
    
    # Simple chunking (can be improved with Docling structure)
    chunks = markdown_content.split("\n\n")
    
    # Store in ChromaDB
    ids = [f"{file.filename}_{i}" for i in range(len(chunks))]
    metadatas = [{"source": file.filename} for _ in chunks]
    collection.add(documents=chunks, ids=ids, metadatas=metadatas)
    
    # Clean up
    os.remove(file_path)
    
    return {"status": "success", "message": f"Processed {len(chunks)} chunks from {file.filename}"}

@app.get("/search")
async def search(query: str, n_results: int = 5):
    results = collection.query(query_texts=[query], n_results=n_results)
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
