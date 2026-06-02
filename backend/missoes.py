import json
import random

def gerar_missoes_gerais(carteirinha=None):

    if carteirinha:
        with open(
            "usuarios.json",
            "r",
            encoding="utf-8"
        ) as arquivo:

            usuarios = json.load(arquivo)

        usuario = usuarios.get(carteirinha)

        if not usuario:
            return []

        if "missoesGeraisAtivas" in usuario and usuario["missoesGeraisAtivas"]:
            return usuario["missoesGeraisAtivas"]

    with open(
        "missoesGerais.json",
        "r",
        encoding="utf-8"
    ) as arquivo:

        missoes = json.load(arquivo)

    missoes_sorteadas = random.sample(
        missoes,
        min(3, len(missoes))
    )

    for index, missao in enumerate(missoes_sorteadas):

        missao["id"] = index + 1

    if carteirinha:
        usuario["missoesGeraisAtivas"] = missoes_sorteadas

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

    return missoes_sorteadas
