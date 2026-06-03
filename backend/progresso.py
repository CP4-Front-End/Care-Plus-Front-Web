from datetime import date


def preparar_progresso_usuario(usuario):
    if not usuario:
        return usuario

    hoje = str(date.today())

    usuario.setdefault("missoesConcluidasHoje", 0)
    usuario.setdefault("ultimoDiaMissoes", hoje)

    if usuario.get("ultimoDiaMissoes") != hoje:
        usuario["missoesConcluidasHoje"] = 0
        usuario["ultimoDiaMissoes"] = hoje

    usuario.setdefault("streak", 0)
    usuario.setdefault("ultimoDiaStreak", "")
    usuario.setdefault("streakDiasAcendidos", [])

    ultimo_dia_streak = usuario.get("ultimoDiaStreak")

    if (
        ultimo_dia_streak
        and ultimo_dia_streak not in usuario["streakDiasAcendidos"]
    ):
        usuario["streakDiasAcendidos"].append(ultimo_dia_streak)

    return usuario


def registrar_missao_concluida(usuario):
    preparar_progresso_usuario(usuario)

    usuario["missoesConcluidasHoje"] += 1
    hoje = str(date.today())

    if (
        usuario["missoesConcluidasHoje"] >= 3
        and usuario.get("ultimoDiaStreak") != hoje
    ):
        usuario["streak"] += 1
        usuario["ultimoDiaStreak"] = hoje

        if hoje not in usuario["streakDiasAcendidos"]:
            usuario["streakDiasAcendidos"].append(hoje)
