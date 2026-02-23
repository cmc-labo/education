import os
import httpx
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

DIFY_API_KEY = os.getenv("DIFY_API_KEY", "")
DIFY_API_URL = os.getenv("DIFY_API_URL", "https://api.dify.ai/v1")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/solve")
async def solve(file: UploadFile = File(...)):
    contents = await file.read()

    async with httpx.AsyncClient(timeout=60.0) as client:
        # Step 1: Upload file to Dify
        upload_res = await client.post(
            f"{DIFY_API_URL}/files/upload",
            headers={"Authorization": f"Bearer {DIFY_API_KEY}"},
            files={"file": (file.filename, contents, file.content_type)},
            data={"user": "study-buddy-user"},
        )
        if not upload_res.is_success:
            raise HTTPException(status_code=upload_res.status_code,
                                detail=f"ファイルアップロード失敗: {upload_res.text}")

        upload_file_id = upload_res.json()["id"]

        # Step 2: Send chat message with image
        chat_res = await client.post(
            f"{DIFY_API_URL}/chat-messages",
            headers={
                "Authorization": f"Bearer {DIFY_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "inputs": {},
                "query": "この問題を解いてください。まず簡潔に答えを示し、次にステップごとに解説してください。",
                "response_mode": "blocking",
                "user": "study-buddy-user",
                "files": [
                    {
                        "type": "image",
                        "transfer_method": "local_file",
                        "upload_file_id": upload_file_id,
                    }
                ],
            },
        )
        if not chat_res.is_success:
            raise HTTPException(status_code=chat_res.status_code,
                                detail=f"APIリクエスト失敗: {chat_res.text}")

        data = chat_res.json()
        return {
            "answer": data.get("answer", ""),
            "conversation_id": data.get("conversation_id", ""),
            "message_id": data.get("message_id", ""),
        }


class ChatRequest(BaseModel):
    query: str
    conversation_id: Optional[str] = None


@app.post("/api/chat")
async def chat(req: ChatRequest):
    body: dict = {
        "inputs": {},
        "query": req.query,
        "response_mode": "blocking",
        "user": "study-buddy-user",
    }
    if req.conversation_id:
        body["conversation_id"] = req.conversation_id

    async with httpx.AsyncClient(timeout=60.0) as client:
        res = await client.post(
            f"{DIFY_API_URL}/chat-messages",
            headers={
                "Authorization": f"Bearer {DIFY_API_KEY}",
                "Content-Type": "application/json",
            },
            json=body,
        )
        if not res.is_success:
            raise HTTPException(status_code=res.status_code,
                                detail=f"APIリクエスト失敗: {res.text}")

        data = res.json()
        return {
            "answer": data.get("answer", ""),
            "conversation_id": data.get("conversation_id", ""),
            "message_id": data.get("message_id", ""),
        }


# Static files (SPA) — must be mounted after API routes
frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.isdir(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")
