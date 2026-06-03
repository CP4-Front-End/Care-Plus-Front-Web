from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import random
from datetime import date
from gerar_missoes import gerar_missoes
from gerar_missoes import concluir_missao
from missoes import gerar_missoes_gerais

app = FastAPI()

USUARIOS_ARQUIVO = "usuarios.json"
BENEFICIOS_ARQUIVO = "beneficios.json"


def carregar_usuarios():
    with open(USUARIOS_ARQUIVO, "r", encoding="utf-8") as arquivo:
        return json.load(arquivo)


def salvar_usuarios(usuarios):
    with open(USUARIOS_ARQUIVO, "w", encoding="utf-8") as arquivo:
        json.dump(usuarios, arquivo, indent=4, ensure_ascii=False)


def carregar_beneficios():
    with open(BENEFICIOS_ARQUIVO, "r", encoding="utf-8") as arquivo:
        return json.load(arquivo)


def preparar_usuario(usuario):
    if not usuario:
        return usuario

    usuario.setdefault("trofeus", 0)
    usuario.setdefault("trofeusAcumulados", usuario.get("trofeus", 0))
    usuario.setdefault("beneficiosResgatados", [])

    return usuario

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

    usuarios = carregar_usuarios()

    carteirinha = dados["carteirinha"]

    dados["trofeus"] = int(0)
    dados["trofeusAcumulados"] = int(0)
    dados["beneficiosResgatados"] = []
    dados["missoesConcluidasHoje"] = 0
    dados["streak"] = 0
    dados["ultimoDiaStreak"] = ""



    usuarios[carteirinha] = dados

    print(usuarios)


    salvar_usuarios(usuarios)

    return {
        "status": "ok",
        "mensagem": "Usuário salvo"
    }   

@app.get("/usuario/{carteirinha}")
def buscar_usuario(carteirinha: str):

    usuarios = carregar_usuarios()

    usuario = preparar_usuario(usuarios.get(carteirinha))

    return usuario

@app.get("/beneficios")
def buscar_beneficios():

    return carregar_beneficios()

@app.get("/beneficios-sorteados")
def buscar_beneficios_sorteados(quantidade: int = 3):

    beneficios = carregar_beneficios()
    quantidade = max(0, min(quantidade, len(beneficios)))

    return random.sample(beneficios, quantidade)

@app.post("/resgatar-beneficio")
def resgatar_beneficio(data: dict):

    usuarios = carregar_usuarios()
    beneficios = carregar_beneficios()

    carteirinha = data.get("carteirinha")
    id_beneficio = data.get("idBeneficio")

    usuario = preparar_usuario(usuarios.get(carteirinha))

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    beneficio = next(
        (item for item in beneficios if item["id"] == id_beneficio),
        None
    )

    if not beneficio:
        raise HTTPException(status_code=404, detail="Benefício não encontrado")

    beneficios_resgatados = usuario.setdefault("beneficiosResgatados", [])
    ja_resgatado = any(
        item["id"] == id_beneficio
        for item in beneficios_resgatados
    )

    if ja_resgatado:
        raise HTTPException(status_code=400, detail="Benefício já resgatado")

    if usuario.get("trofeus", 0) < beneficio["custoTrofeus"]:
        raise HTTPException(status_code=400, detail="Troféus insuficientes")

    usuario["trofeus"] -= beneficio["custoTrofeus"]
    beneficios_resgatados.append(beneficio)
    salvar_usuarios(usuarios)

    return {
        "status": "ok",
        "usuario": usuario,
        "beneficio": beneficio
    }

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

    usuarios = carregar_usuarios()

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

    usuario = preparar_usuario(usuarios[carteirinha])
    usuario["trofeus"] += trofeus
    usuario["trofeusAcumulados"] += trofeus
    usuario["missoesConcluidasHoje"] += 1
    hoje = str(date.today())

    if (
        usuario["missoesConcluidasHoje"] >= 3
        and usuario.get("ultimoDiaStreak") != hoje
    ):

        usuario["streak"] += 1
        usuario["ultimoDiaStreak"] = hoje

    usuario["missoesGeraisAtivas"] = novas_missoes

    salvar_usuarios(usuarios)

    return {
        "status": "ok"
    }
