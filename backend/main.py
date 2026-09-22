from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv(".env")

from backend.services.label_extractor import extract_label_fields
from backend.services.verifier import verify_label

app = FastAPI(title="AI Alcohol Label Verifier")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://ai-alcohol-label-verifier-1.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "application": "AI Alcohol Label Verifier",
        "status": "running"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/upload-label")
async def upload_label(file: UploadFile = File(...)):
    if file.content_type not in [
        "image/jpeg",
        "image/png",
        "image/webp"
    ]:
        raise HTTPException(
            status_code=400,
            detail="Please upload a JPG, PNG, or WebP image."
        )

    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty."
        )

    try:
        extracted_fields = extract_label_fields(
            image_bytes=contents,
            content_type=file.content_type
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Label extraction failed: {str(exc)}"
        )

    return {
        "status": "success",
        "filename": file.filename,
        "extracted_fields": extracted_fields
    }


@app.post("/verify")
async def verify(application_data: dict, extracted_fields: dict):
    return verify_label(
        application_data=application_data,
        extracted_fields=extracted_fields
    )