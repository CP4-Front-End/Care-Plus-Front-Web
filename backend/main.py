from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import os
import random
import socket
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from datetime import date
from gerar_missoes import gerar_missoes
from gerar_missoes import concluir_missao
from missoes import gerar_missoes_gerais
from progresso import preparar_progresso_usuario, registrar_missao_concluida
from storage import carregar_beneficios, carregar_usuarios, salvar_usuarios

app = FastAPI()

QUANTIDADE_BENEFICIOS_SESSAO = 6
FIWARE_URL = os.getenv("FIWARE_URL", "http://34.95.202.198").rstrip("/")
FIWARE_SERVICE = os.getenv("FIWARE_SERVICE", "smart")
FIWARE_SERVICEPATH = os.getenv("FIWARE_SERVICEPATH", "/")
FIWARE_PEDOMETER_ENTITY_ID = os.getenv(
    "FIWARE_PEDOMETER_ENTITY_ID",
    "urn:ngsi-ld:Pedometer:001"
)
FIWARE_PEDOMETER_DEVICE_ID = os.getenv("FIWARE_PEDOMETER_DEVICE_ID", "step001")
FIWARE_TIMEOUT = float(os.getenv("FIWARE_TIMEOUT", "5"))
COPO_AGUA_ML = 220
MISSOES_CONNECT = [
    {
        "id": "passos",
        "titulo": "Dar 5 passos com a pulseira",
        "tipo": "steps",
        "meta": 5,
        "unidade": "passos",
        "trofeus": 20,
    },
    {
        "id": "agua",
        "titulo": "Beber 2 copos de agua",
        "tipo": "water",
        "meta": COPO_AGUA_ML * 2,
        "unidade": "ml",
        "trofeus": 20,
    },
    {
        "id": "media-passos",
        "titulo": "Manter media de 2 passos/min",
        "tipo": "steps_per_minute",
        "meta": 2,
        "unidade": "passos/min",
        "trofeus": 15,
    },
]


def normalizar_texto(valor):
    return str(valor or "").strip().casefold()


def preparar_usuario(usuario):
    if not usuario:
        return usuario

    usuario.setdefault("trofeus", 0)
    usuario.setdefault("trofeusAcumulados", usuario.get("trofeus", 0))
    usuario.setdefault("beneficiosResgatados", [])
    usuario.setdefault("beneficiosDisponiveis", [])
    preparar_progresso_usuario(usuario)

    return usuario


def extrair_valor_fiware(entidade, atributo, padrao=None):
    dado = entidade.get(atributo, padrao)

    if isinstance(dado, dict):
        return dado.get("value", padrao)

    return dado


def extrair_timeinstant_fiware(entidade, atributo):
    dado = entidade.get(atributo)

    if not isinstance(dado, dict):
        return ""

    metadata = dado.get("metadata") or {}
    timeinstant = metadata.get("TimeInstant") or {}

    return timeinstant.get("value", "")


def converter_int(valor, padrao=0):
    try:
        return int(valor)
    except (TypeError, ValueError):
        return padrao


def converter_float(valor, padrao=0):
    try:
        return float(valor)
    except (TypeError, ValueError):
        return padrao


def buscar_entidade_pedometro():
    url = f"{FIWARE_URL}:1026/v2/entities/{FIWARE_PEDOMETER_ENTITY_ID}"
    requisicao = Request(
        url,
        headers={
            "fiware-service": FIWARE_SERVICE,
            "fiware-servicepath": FIWARE_SERVICEPATH,
            "Accept": "application/json",
        },
        method="GET",
    )

    try:
        with urlopen(requisicao, timeout=FIWARE_TIMEOUT) as resposta:
            return json.loads(resposta.read().decode("utf-8"))
    except HTTPError as erro:
        detalhe = erro.read().decode("utf-8", errors="replace")
        raise HTTPException(
            status_code=erro.code,
            detail=detalhe or "Nao foi possivel consultar o Orion."
        ) from erro
    except (TimeoutError, socket.timeout, URLError) as erro:
        raise HTTPException(
            status_code=504,
            detail="FIWARE indisponivel ou sem resposta no momento."
        ) from erro


def normalizar_entidade_pedometro(entidade):
    return {
        "status": "online",
        "deviceId": FIWARE_PEDOMETER_DEVICE_ID,
        "entityId": entidade.get("id", FIWARE_PEDOMETER_ENTITY_ID),
        "type": entidade.get("type", "Pedometer"),
        "steps": converter_int(extrair_valor_fiware(entidade, "steps")),
        "stepsPerMinute": converter_float(
            extrair_valor_fiware(entidade, "steps_per_minute")
        ),
        "buttonEvent": extrair_valor_fiware(entidade, "button_event", ""),
        "buttonEventAt": extrair_timeinstant_fiware(entidade, "button_event"),
        "nfcId": extrair_valor_fiware(entidade, "nfcId", ""),
        "error": "",
    }


def pedometro_offline(detalhe):
    return {
        "status": "offline",
        "deviceId": FIWARE_PEDOMETER_DEVICE_ID,
        "entityId": FIWARE_PEDOMETER_ENTITY_ID,
        "type": "Pedometer",
        "steps": 0,
        "stepsPerMinute": 0,
        "buttonEvent": "",
        "buttonEventAt": "",
        "nfcId": "",
        "error": detalhe,
    }


def preparar_connect_usuario(usuario):
    if not usuario:
        return usuario

    preparar_usuario(usuario)
    hoje = str(date.today())

    if usuario.get("connectDia") != hoje:
        usuario["connectDia"] = hoje
        usuario["connectWaterMl"] = 0
        usuario["connectUltimoEventoAgua"] = ""
        usuario["connectMissoesConcluidas"] = []

    usuario.setdefault("connectWaterMl", 0)
    usuario.setdefault("connectUltimoEventoAgua", "")
    usuario.setdefault("connectMissoesConcluidas", [])

    return usuario


def calcular_missoes_connect(usuario, pedometro):
    concluidas = set(usuario.get("connectMissoesConcluidas", []))
    valores = {
        "steps": pedometro.get("steps", 0),
        "water": usuario.get("connectWaterMl", 0),
        "steps_per_minute": pedometro.get("stepsPerMinute", 0),
    }
    novas_conclusoes = []
    missoes = []

    for missao in MISSOES_CONNECT:
        atual = valores.get(missao["tipo"], 0)
        progresso = min(100, round((atual / missao["meta"]) * 100))
        concluida = missao["id"] in concluidas or atual >= missao["meta"]

        if concluida and missao["id"] not in concluidas:
            usuario["trofeus"] += missao["trofeus"]
            usuario["trofeusAcumulados"] += missao["trofeus"]
            usuario["connectMissoesConcluidas"].append(missao["id"])
            registrar_missao_concluida(usuario)
            novas_conclusoes.append(missao)

        missoes.append({
            **missao,
            "atual": atual,
            "progresso": progresso,
            "concluida": concluida,
        })

    return missoes, novas_conclusoes


def garantir_beneficios_sessao(
    usuario,
    quantidade=QUANTIDADE_BENEFICIOS_SESSAO,
    renovar=False
):
    usuario = preparar_usuario(usuario)

    if not usuario:
        return []

    quantidade = max(0, quantidade)
    beneficios_atuais = [] if renovar else list(usuario.get("beneficiosDisponiveis", []))

    if len(beneficios_atuais) >= quantidade:
        usuario["beneficiosDisponiveis"] = beneficios_atuais
        return beneficios_atuais[:quantidade]

    beneficios = carregar_beneficios()
    ids_resgatados = {
        beneficio.get("id")
        for beneficio in usuario.get("beneficiosResgatados", [])
    }
    ids_atuais = {
        beneficio.get("id")
        for beneficio in beneficios_atuais
    }
    candidatos = [
        beneficio
        for beneficio in beneficios
        if beneficio.get("id") not in ids_resgatados
        and beneficio.get("id") not in ids_atuais
    ]

    faltam = quantidade - len(beneficios_atuais)
    beneficios_atuais.extend(
        random.sample(candidatos, min(faltam, len(candidatos)))
    )
    usuario["beneficiosDisponiveis"] = beneficios_atuais

    return beneficios_atuais[:quantidade]


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


@app.get("/fiware/pedometer/step001")
def buscar_pedometro_step001():
    try:
        entidade = buscar_entidade_pedometro()
    except HTTPException as erro:
        return pedometro_offline(erro.detail)

    return normalizar_entidade_pedometro(entidade)


@app.get("/fiware/missoes-connect/{carteirinha}")
def buscar_missoes_connect(carteirinha: str):
    usuarios = carregar_usuarios()
    usuario = usuarios.get(carteirinha)

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario nao encontrado")

    preparar_connect_usuario(usuario)

    try:
        pedometro = normalizar_entidade_pedometro(buscar_entidade_pedometro())
    except HTTPException as erro:
        pedometro = pedometro_offline(erro.detail)

    if (
        pedometro["buttonEvent"] == "agua_confirmada"
        and pedometro["buttonEventAt"]
        and pedometro["buttonEventAt"] != usuario.get("connectUltimoEventoAgua")
    ):
        usuario["connectWaterMl"] += COPO_AGUA_ML
        usuario["connectUltimoEventoAgua"] = pedometro["buttonEventAt"]

    missoes, novas_conclusoes = calcular_missoes_connect(usuario, pedometro)
    salvar_usuarios(usuarios)

    return {
        "pedometro": pedometro,
        "aguaMl": usuario.get("connectWaterMl", 0),
        "copoAguaMl": COPO_AGUA_ML,
        "missoes": missoes,
        "novasConclusoes": novas_conclusoes,
        "usuario": usuario,
    }


@app.post("/cadastro")
def cadastro(dados: dict):
    usuarios = carregar_usuarios()

    carteirinha = str(dados["carteirinha"]).strip()
    dados["carteirinha"] = carteirinha
    usuario_existente = preparar_usuario(usuarios.get(carteirinha))

    if usuario_existente:
        campos_de_progresso = [
            "trofeus",
            "trofeusAcumulados",
            "beneficiosResgatados",
            "beneficiosDisponiveis",
            "missoesConcluidasHoje",
            "ultimoDiaMissoes",
            "streak",
            "ultimoDiaStreak",
            "streakDiasAcendidos",
            "missoesAtivas",
            "missoesGeraisAtivas",
        ]

        for campo in campos_de_progresso:
            if campo in usuario_existente:
                dados[campo] = usuario_existente[campo]
    else:
        dados["trofeus"] = int(0)
        dados["trofeusAcumulados"] = int(0)
        dados["beneficiosResgatados"] = []
        dados["beneficiosDisponiveis"] = []
        dados["missoesConcluidasHoje"] = 0
        preparar_progresso_usuario(dados)
        dados["streak"] = 0
        dados["ultimoDiaStreak"] = ""
        dados["streakDiasAcendidos"] = []

        garantir_beneficios_sessao(
            dados,
            QUANTIDADE_BENEFICIOS_SESSAO,
            renovar=True
        )

    usuarios[carteirinha] = dados
    salvar_usuarios(usuarios)

    return {
        "status": "ok",
        "mensagem": "Usuario salvo",
        "usuario": dados
    }


@app.post("/login")
def login(dados: dict):
    usuarios = carregar_usuarios()
    carteirinha = str(dados.get("carteirinha", "")).strip()
    nome = dados.get("nome", "")

    usuario = preparar_usuario(usuarios.get(carteirinha))

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario nao encontrado")

    if normalizar_texto(usuario.get("nome")) != normalizar_texto(nome):
        raise HTTPException(status_code=401, detail="Nome ou carteirinha invalidos")

    garantir_beneficios_sessao(
        usuario,
        QUANTIDADE_BENEFICIOS_SESSAO,
        renovar=True
    )
    salvar_usuarios(usuarios)

    return {
        "status": "ok",
        "usuario": usuario
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
def buscar_beneficios_sorteados(
    quantidade: int = 3,
    carteirinha: str = None,
    renovar: bool = False
):
    if carteirinha:
        usuarios = carregar_usuarios()
        usuario = preparar_usuario(usuarios.get(carteirinha))

        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario nao encontrado")

        beneficios_sessao = garantir_beneficios_sessao(
            usuario,
            quantidade,
            renovar
        )
        salvar_usuarios(usuarios)

        return beneficios_sessao

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
        raise HTTPException(status_code=404, detail="Usuario nao encontrado")

    beneficio = next(
        (item for item in beneficios if item["id"] == id_beneficio),
        None
    )

    if not beneficio:
        raise HTTPException(status_code=404, detail="Beneficio nao encontrado")

    beneficios_resgatados = usuario.setdefault("beneficiosResgatados", [])
    ja_resgatado = any(
        item["id"] == id_beneficio
        for item in beneficios_resgatados
    )

    if ja_resgatado:
        raise HTTPException(status_code=400, detail="Beneficio ja resgatado")

    if usuario.get("trofeus", 0) < beneficio["custoTrofeus"]:
        raise HTTPException(status_code=400, detail="Trofeus insuficientes")

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
    missoes = concluir_missao(
        data["carteirinha"],
        data["idMissao"]
    )

    return {
        "status": "ok",
        "missoes": missoes
    }


@app.get("/missoes-gerais")
def buscar_missoes_gerais(carteirinha: str = None):
    return gerar_missoes_gerais(carteirinha)


@app.post("/concluir-missao-geral")
def concluir_missao_geral(data: dict):
    usuarios = carregar_usuarios()

    carteirinha = data["carteirinha"]
    usuario = preparar_usuario(usuarios.get(carteirinha))

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario nao encontrado")

    id_missao = data.get("idMissao")
    trofeus = data.get("trofeus", 0)

    missoes_gerais = usuario.get("missoesGeraisAtivas", [])
    novas_missoes = []

    for missao in missoes_gerais:
        if missao["id"] == id_missao:
            trofeus = missao["trofeus"]
        else:
            novas_missoes.append(missao)

    usuario["trofeus"] += trofeus
    usuario["trofeusAcumulados"] += trofeus
    registrar_missao_concluida(usuario)

    usuario["missoesGeraisAtivas"] = novas_missoes

    salvar_usuarios(usuarios)

    if len(novas_missoes) == 0:
        novas_missoes = gerar_missoes_gerais(carteirinha)

    return {
        "status": "ok",
        "missoesGerais": novas_missoes
    }
