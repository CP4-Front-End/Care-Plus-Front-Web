from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

# libera acesso do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"mensagem": "Backend funcionando"}

@app.post("/cadastro")
def cadastro(dados: dict):

    with open("usuarios.json", "r", encoding='utf-8') as arquivo:
        usuarios = json.load(arquivo)

    carteirinha = dados["carteirinha"]

    usuarios[carteirinha] = dados

    with open("usuarios.json", "w", encoding='utf-8') as arquivo:
        json.dump(usuarios, arquivo, indent=4, ensure_ascii=False)

    return {
        "status": "ok",
        "mensagem": "Usuário salvo"
    }   

@app.get("/usuario/{carteirinha}")
def buscar_usuario(carteirinha: str):

    with open("usuarios.json", "r", encoding="utf-8") as arquivo:
        usuarios = json.load(arquivo)

    usuario = usuarios.get(carteirinha)

    return usuario