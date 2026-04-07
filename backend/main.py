from fastapi import FastAPI, UploadFile, File, Form
from ultralytics import YOLO
from PIL import Image
import numpy as np
from collections import Counter
import io
import base64
import firebase_admin
from firebase_admin import credentials, firestore
import os
import json
import datetime

# ===== FIREBASE =====
firebase_key = json.loads(os.environ["FIREBASE_KEY"])

if not firebase_admin._apps:
    cred = credentials.Certificate(firebase_key)
    firebase_admin.initialize_app(cred)

db = firestore.client()

# ===== APP =====
app = FastAPI()
model = YOLO("curuit_board.pt")

@app.get("/")
def home():
    return {"message": "API running"}

# ===== LOGIN =====
@app.post("/login")
async def login(username: str = Form(...), password: str = Form(...)):
    doc = db.collection("users").document(username).get()
    if doc.exists and doc.to_dict()["password"] == password:
        return {"status": "ok"}
    return {"status": "fail"}

# ===== REGISTER =====
@app.post("/register")
async def register(username: str = Form(...), password: str = Form(...)):
    db.collection("users").document(username).set({
        "password": password
    })
    return {"status": "created"}

# ===== PREDICT =====
@app.post("/predict")
async def predict(file: UploadFile = File(...), user: str = Form(...)):
    image_bytes = await file.read()
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    results = model.predict(np.array(img), conf=0.25)

    boxes = results[0].boxes
    names = model.names

    labels = []
    if boxes is not None:
        for cls in boxes.cls.cpu().numpy():
            labels.append(names[int(cls)])

    count = Counter(labels)

    # draw image
    plotted = results[0].plot()
    img_io = io.BytesIO()
    Image.fromarray(plotted).save(img_io, format="PNG")
    img_io.seek(0)

    encoded = base64.b64encode(img_io.read()).decode()

    # save firebase
    db.collection("history").add({
        "user": user,
        "result": dict(count),
        "time": datetime.datetime.now().isoformat()
    })

    return {
        "total": len(labels),
        "details": dict(count),
        "image": encoded
    }
