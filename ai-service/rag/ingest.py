import json
from pathlib import Path

import chromadb
from sentence_transformers import SentenceTransformer


# -----------------------------
# Paths
# -----------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

KNOWLEDGE_FILE = Path(__file__).resolve().parent / "knowledge" / "quran.json"
CHROMA_DIR = BASE_DIR / "chroma_db"


# -----------------------------
# Load embedding model
# -----------------------------

print("Loading embedding model...")

embedding_model = SentenceTransformer(
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
)

print("Embedding model loaded.")


# -----------------------------
# Load knowledge
# -----------------------------

print(f"Loading knowledge from: {KNOWLEDGE_FILE}")

with open(KNOWLEDGE_FILE, "r", encoding="utf-8") as f:
    documents = json.load(f)

print(f"Loaded {len(documents)} documents.")


# -----------------------------
# Create ChromaDB
# -----------------------------

client = chromadb.PersistentClient(
    path=str(CHROMA_DIR)
)

collection = client.get_or_create_collection(
    name="diin_knowledge"
)


# -----------------------------
# Prepare data
# -----------------------------

ids = []
texts = []
metadatas = []

for item in documents:

    ids.append(item["id"])

    texts.append(item["text"])

    metadatas.append({
        "source": item.get("source", ""),
        "reference": item.get("reference", "")
    })


# -----------------------------
# Create embeddings
# -----------------------------

print("Creating embeddings...")

embeddings = embedding_model.encode(
    texts,
    normalize_embeddings=True
).tolist()

print("Embeddings created.")


# -----------------------------
# Store in ChromaDB
# -----------------------------

print("Saving to ChromaDB...")

collection.upsert(
    ids=ids,
    documents=texts,
    metadatas=metadatas,
    embeddings=embeddings
)


# -----------------------------
# Done
# -----------------------------

print()
print("================================")
print("Knowledge base created!")
print("================================")
print(f"Documents stored: {collection.count()}")
print(f"Database location: {CHROMA_DIR}")