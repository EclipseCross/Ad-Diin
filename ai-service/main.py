from fastapi import FastAPI
from pydantic import BaseModel, Field
import requests
import chromadb
from sentence_transformers import SentenceTransformer


# ==========================================================
# APP
# ==========================================================

app = FastAPI(
    title="Diin AI Service",
    version="1.0.0"
)


# ==========================================================
# CONFIG
# ==========================================================

OLLAMA_URL = "http://127.0.0.1:11434/api/chat"
MODEL = "qwen3:8b"

CHROMA_DIR = r"H:\Addin\Ad-Diin\ai-service\chroma_db"
COLLECTION_NAME = "diin_knowledge"


# ==========================================================
# SYSTEM PROMPT
# ==========================================================

SYSTEM_PROMPT = """
You are Diin AI, an Islamic educational assistant developed for the
Ad-Diin platform.

RULES:

1. Always answer in Bengali unless the user explicitly asks for another
language.

2. Use simple and clear Bengali.

3. For Islamic questions, prioritize the provided Quran/Hadith context.

4. NEVER invent Quran verses, Hadith, references, scholar opinions,
or quotations.

5. IMPORTANT:
Only use Quran/Hadith references that are present in the provided
knowledge context or that you are reasonably confident about.

6. If the provided context does not contain enough information,
say:
"এই বিষয়ে নির্ভরযোগ্য সূত্র যাচাই করা প্রয়োজন।"

7. Do not present uncertain information as certain.

8. If there are legitimate differences of scholarly opinion, mention
that differences exist.

9. For complicated matters such as marriage, divorce, inheritance,
finance or serious religious rulings, recommend consulting a qualified
and trustworthy Islamic scholar.

10. Do not pretend to be a human scholar.

11. Do not make up information.

12. Keep answers useful and reasonably concise.

13. Answer the user's actual question directly.

Identity:
Name: Diin AI
Platform: Ad-Diin
Role: Islamic educational assistant
"""


# ==========================================================
# REQUEST MODEL
# ==========================================================

class ChatRequest(BaseModel):
    message: str
    history: list = Field(default_factory=list)


# ==========================================================
# LOAD EMBEDDING MODEL
# ==========================================================

print("Loading embedding model...")

embedding_model = SentenceTransformer(
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
)

print("Embedding model loaded.")


# ==========================================================
# LOAD CHROMADB
# ==========================================================

print(f"Loading ChromaDB from: {CHROMA_DIR}")

chroma_client = chromadb.PersistentClient(
    path=CHROMA_DIR
)

collection = chroma_client.get_or_create_collection(
    name=COLLECTION_NAME
)

print(
    f"Knowledge collection loaded. Documents: {collection.count()}"
)


# ==========================================================
# ROOT
# ==========================================================

@app.get("/")
def root():

    return {
        "success": True,
        "message": "Ad-Diin AI Service is running",
        "model": MODEL,
        "knowledge_documents": collection.count()
    }


# ==========================================================
# HEALTH
# ==========================================================

@app.get("/health")
def health():

    try:

        response = requests.get(
            "http://127.0.0.1:11434/api/tags",
            timeout=5
        )

        return {
            "success": True,
            "ollama": response.status_code == 200,
            "models": response.json().get("models", []),
            "knowledge_documents": collection.count()
        }

    except Exception as e:

        return {
            "success": False,
            "ollama": False,
            "knowledge_documents": collection.count(),
            "error": str(e)
        }


# ==========================================================
# RAG SEARCH
# ==========================================================

def search_knowledge(question: str, limit: int = 5):

    try:

        # Create query embedding
        query_embedding = embedding_model.encode(
            question,
            normalize_embeddings=True
        ).tolist()

        # Search ChromaDB
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=min(limit, max(collection.count(), 1))
        )

        documents = results.get("documents", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]

        context_items = []
        sources = []

        for index, document in enumerate(documents):

            metadata = (
                metadatas[index]
                if index < len(metadatas)
                else {}
            )

            distance = (
                distances[index]
                if index < len(distances)
                else None
            )

            source = metadata.get("source", "")
            reference = metadata.get("reference", "")

            context_items.append(
                f"""
Source: {source}
Reference: {reference}
Text: {document}
"""
            )

            sources.append({
                "source": source,
                "reference": reference,
                "text": document,
                "distance": distance
            })

        return "\n".join(context_items), sources

    except Exception as e:

        print(f"RAG search error: {e}")

        return "", []


# ==========================================================
# CHAT
# ==========================================================

@app.post("/chat")
def chat(request: ChatRequest):

    try:

        # --------------------------------------------------
        # Search knowledge base
        # --------------------------------------------------

        context, sources = search_knowledge(
            request.message,
            limit=5
        )


        # --------------------------------------------------
        # Build RAG prompt
        # --------------------------------------------------

        rag_prompt = f"""
নিচে Ad-Diin-এর যাচাইকৃত knowledge base থেকে প্রাসঙ্গিক তথ্য দেওয়া হলো।

================ KNOWLEDGE CONTEXT ================

{context}

================ END CONTEXT ================

ব্যবহারকারীর প্রশ্ন:

{request.message}

উপরের knowledge context ব্যবহার করে উত্তর দাও।

যদি context-এ প্রশ্নের উত্তর থাকে, সেটিকে অগ্রাধিকার দাও।

যদি context যথেষ্ট না হয়, কোনো তথ্য বানিয়ে বলবে না।

প্রয়োজন হলে বলবে:
"এই বিষয়ে নির্ভরযোগ্য সূত্র যাচাই করা প্রয়োজন।"

উত্তর বাংলায় দাও।
"""


        # --------------------------------------------------
        # Messages
        # --------------------------------------------------

        messages = [
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            }
        ]


        # --------------------------------------------------
        # History
        # --------------------------------------------------

        for item in request.history:

            if not isinstance(item, dict):
                continue

            sender = item.get("sender")
            text = item.get("text", "")

            if not text:
                continue

            if sender == "user":

                messages.append({
                    "role": "user",
                    "content": text
                })

            elif sender == "bot":

                messages.append({
                    "role": "assistant",
                    "content": text
                })


        # --------------------------------------------------
        # Current question
        # --------------------------------------------------

        messages.append({
            "role": "user",
            "content": rag_prompt
        })


        # --------------------------------------------------
        # Ollama payload
        # --------------------------------------------------

        payload = {
            "model": MODEL,
            "messages": messages,
            "stream": False
        }


        # --------------------------------------------------
        # Call Ollama
        # --------------------------------------------------

        response = requests.post(
            OLLAMA_URL,
            json=payload,
            timeout=120
        )

        response.raise_for_status()

        data = response.json()


        # --------------------------------------------------
        # Validate response
        # --------------------------------------------------

        if "message" not in data:

            return {
                "success": False,
                "response": "AI থেকে সঠিক উত্তর পাওয়া যায়নি।",
                "sources": []
            }


        answer = data["message"].get(
            "content",
            ""
        ).strip()


        if not answer:

            return {
                "success": False,
                "response": "AI কোনো উত্তর দেয়নি।",
                "sources": []
            }


        # --------------------------------------------------
        # Return response + sources
        # --------------------------------------------------

        return {
            "success": True,
            "response": answer,
            "sources": sources
        }


    # ======================================================
    # ERRORS
    # ======================================================

    except requests.exceptions.Timeout:

        return {
            "success": False,
            "response": "AI service-এর উত্তর পেতে বেশি সময় লাগছে।",
            "sources": []
        }


    except requests.exceptions.ConnectionError:

        return {
            "success": False,
            "response": "Ollama-এর সাথে সংযোগ করা যাচ্ছে না। Ollama চালু আছে কিনা দেখুন।",
            "sources": []
        }


    except requests.exceptions.HTTPError as e:

        return {
            "success": False,
            "response": "Ollama থেকে HTTP error এসেছে।",
            "sources": [],
            "error": str(e)
        }


    except Exception as e:

        print(f"Chat error: {e}")

        return {
            "success": False,
            "response": "দুঃখিত, AI service-এর সাথে সংযোগ করতে সমস্যা হয়েছে।",
            "sources": [],
            "error": str(e)
        }