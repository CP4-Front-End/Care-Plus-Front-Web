from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
from gerar_missoes import gerar_missoes
from gerar_missoes import concluir_missao
from missoes import gerar_missoes_gerais

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

    dados["trofeus"] = int(0)

    usuarios[carteirinha] = dados

    print(usuarios)


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

@app.get("/missoes/{carteirinha}")
def buscar_missoes(carteirinha: str):

    missoes = gerar_missoes(carteirinha)

    return missoes

@app.post("/concluir-missao")
def concluir(data: dict):

    concluir_missao(
        data["carteirinha"],
        data["idMissao"]
    )

    return {
        "status": "ok"
    }

@app.get("/missoes-gerais")
def buscar_missoes_gerais(carteirinha: str = None):

    return gerar_missoes_gerais(carteirinha)


@app.post("/concluir-missao-geral")
def concluir_missao_geral(data: dict):

    with open(
        "usuarios.json",
        "r",
        encoding="utf-8"
    ) as arquivo:

        usuarios = json.load(arquivo)

    carteirinha = data["carteirinha"]

    id_missao = data.get("idMissao")
    trofeus = data.get("trofeus", 0)

    missoes_gerais = usuarios[carteirinha].get("missoesGeraisAtivas", [])
    novas_missoes = []

    for missao in missoes_gerais:

        if missao["id"] == id_missao:

            trofeus = missao["trofeus"]

        else:

            novas_missoes.append(missao)

    usuarios[carteirinha]["trofeus"] += trofeus
    usuarios[carteirinha]["missoesGeraisAtivas"] = novas_missoes

    with open(
        "usuarios.json",
        "w",
        encoding="utf-8"
    ) as arquivo:

        json.dump(
            usuarios,
            arquivo,
            indent=4,
            ensure_ascii=False
        )

    return {
        "status": "ok"
    }
