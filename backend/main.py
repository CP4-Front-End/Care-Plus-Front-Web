from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import random
from datetime import date
from gerar_missoes import gerar_missoes
from gerar_missoes import concluir_missao
from missoes import gerar_missoes_gerais
from storage import carregar_beneficios, carregar_usuarios, salvar_usuarios

app = FastAPI()

QUANTIDADE_BENEFICIOS_SESSAO = 6


def normalizar_texto(valor):
    return str(valor or "").strip().casefold()


def preparar_usuario(usuario):
    if not usuario:
        return usuario

    usuario.setdefault("trofeus", 0)
    usuario.setdefault("trofeusAcumulados", usuario.get("trofeus", 0))
    usuario.setdefault("beneficiosResgatados", [])
    usuario.setdefault("beneficiosDisponiveis", [])
    usuario.setdefault("missoesConcluidasHoje", 0)
    usuario.setdefault("streak", 0)
    usuario.setdefault("ultimoDiaStreak", "")

    return usuario


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
            "streak",
            "ultimoDiaStreak",
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
        dados["streak"] = 0
        dados["ultimoDiaStreak"] = ""

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

    if len(novas_missoes) == 0:
        novas_missoes = gerar_missoes_gerais(carteirinha)

    return {
        "status": "ok",
        "missoesGerais": novas_missoes
    }
