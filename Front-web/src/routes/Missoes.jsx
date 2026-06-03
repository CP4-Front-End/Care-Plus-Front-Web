import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiArrowRight, FiZap, FiTarget, FiTrendingUp, FiInfo } from 'react-icons/fi'
import TopBar from '../components/TopBar.jsx'
import Bottomnav from '../components/Bottomnav.jsx'
import ModalConfirmacao from '../components/ModalConfirmacao.jsx'
import { API_URL, buscarUsuarioLogado, redirecionarLogin } from '../services/sessao.js'


const Missoes = () => {

  const navigate = useNavigate()
  const [expandedDesafio, setExpandedDesafio] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const [missaoSelecionada, setMissaoSelecionada] = useState(null)
  const [tipoMissao, setTipoMissao] = useState("")


  const [streakDias, setStreakDias] = useState(0)



  const desafioAtual = {
    title: 'Beba 3 litros de água',
    progress: 20,
    atual: '600ml',
    meta: '3l',
  }

  const [missoesPersonalizadas, setMissoesPersonalizadas] = useState([])
  const [missoesGerais, setMissoesGerais] = useState([])
  const [missoesHoje, setMissoesHoje] = useState(0)



  const inicioMapa = Math.max(
    missoesHoje - 5,
    0
  )

  const mapaMissoes = Array.from(
    { length: 6 },
    (_, index) => {

      const numero = inicioMapa + index + 1

      return {
        id: numero,
        concluida: numero <= missoesHoje,
        desbloqueada: numero === missoesHoje + 1
      }
    }
  )





  async function carregarMissoesGerais(carteirinha) {

    const resposta = await fetch(
      `${API_URL}/missoes-gerais?carteirinha=${carteirinha}`
    )

    const dados = await resposta.json()

    setMissoesGerais(dados)
  }

  useEffect(() => {

    async function carregarMissoes() {

      const carteirinha = localStorage.getItem("carteirinha")

      if (!carteirinha) {
        redirecionarLogin(navigate)
        return
      }

      const resposta = await fetch(
        `${API_URL}/missoes/${carteirinha}`
      )

      const dados = await resposta.json()

      setMissoesPersonalizadas(dados)

      await carregarMissoesGerais(carteirinha)
      const usuario = await buscarUsuarioLogado(navigate)

      if (!usuario) return
    
      setStreakDias(usuario.streak || 0)


      setMissoesHoje(
        usuario.missoesConcluidasHoje || 0
      )
    }

    carregarMissoes()

  }, [navigate])

  function abrirModal(idMissao, tipo) {
    setMissaoSelecionada(idMissao)
    setTipoMissao(tipo)
    setModalAberto(true)
  }

  async function concluirMissaoGeral(idMissao) {

    const missaoConcluida = missoesGerais.find(m => m.id === idMissao)
    if (!missaoConcluida) return

    const carteirinha = localStorage.getItem("carteirinha")

    const resposta = await fetch(`${API_URL}/concluir-missao-geral`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ carteirinha, idMissao, trofeus: missaoConcluida.trofeus })
    })

    const dadosMissao = await resposta.json()

    if (!resposta.ok) return

    const usuario = await buscarUsuarioLogado(navigate)

    if (!usuario) return

    setStreakDias(usuario.streak || 0)

    localStorage.setItem("trofeus", usuario.trofeus)
    window.dispatchEvent(new Event("trofeusAtualizados"))
    setMissoesHoje(
      usuario.missoesConcluidasHoje || 0
    )

    const novasMissoes = dadosMissao.missoesGerais || missoesGerais.filter(m => m.id !== idMissao)
    setMissoesGerais(novasMissoes)
  }

  async function concluirMissao(idMissao) {

    try {

      const carteirinha = localStorage.getItem("carteirinha")

      const resposta = await fetch(
        `${API_URL}/concluir-missao`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ carteirinha, idMissao })
        }
      )

      if (!resposta.ok) {
        throw new Error("Erro ao concluir missão")
      }

      const dados = await resposta.json()
      setMissoesPersonalizadas(dados.missoes || [])

      const usuario = await buscarUsuarioLogado(navigate)

      if (!usuario) return

      setStreakDias(usuario.streak || 0)

      localStorage.setItem("trofeus", usuario.trofeus)
      window.dispatchEvent(new Event("trofeusAtualizados"))
      setMissoesHoje(
        usuario.missoesConcluidasHoje || 0
      )

    } catch (erro) {

      console.log(erro)
    }
  }

  const getCircleClass = (concluida, desbloqueada) => {
    if (concluida) return 'bg-[#1c9770] text-white border-2 border-transparent'
    if (desbloqueada) return 'bg-[rgba(28,151,112,0.15)] text-[#1c9770] border-2 border-[#1c9770]'
    return 'bg-[#E4E7EB] text-[#9BA3AE] border-2 border-transparent'
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <TopBar showPoints={true} />

      <main className="w-full px-4 lg:px-8 pt-4 pb-24">

        <section className="flex items-center gap-2 mb-4">
          <button
            className="bg-transparent border-0 p-0 text-[#6B7685] cursor-pointer"
            onClick={() => navigate('/inicial')}
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-[20px] text-[#1A202C]">Missões</h1>
        </section>

        <section>
          <div
            className="bg-white rounded-xl border border-[rgba(28,151,112,0.2)] p-4 text-center mb-4 cursor-pointer"
            onClick={() => navigate('/impulso')}
          >
            <div className="rounded-full flex items-center justify-center mx-auto mb-3 w-16 h-16 bg-[rgba(147,203,82,0.15)]">
              <FiTrendingUp size={28} color="#93CB52" />
            </div>
            <h2 className="font-bold text-[16px] text-[#1A202C] mb-1">Impulso+</h2>
            <p className="text-[#6B7685] text-[13px] mb-2">Esse é o Flux, seu amigo de streak</p>
            <span className="font-bold inline-block px-3 py-1 rounded-full bg-[rgba(28,151,112,0.1)] text-[#1c9770] text-[13px]">
              {streakDias} dias
            </span>
          </div>
        </section>

        <section className="mb-4 mt-4">
          <div className="bg-white rounded-xl border border-[#E4E7EB] p-3">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[12px] text-[#6B7685] font-medium">Desafio atual</span>
                <h2 className="font-bold text-[16px] text-[#1A202C] mt-1">{desafioAtual.title}</h2>
              </div>
              <span className="font-bold text-[13px] text-[#1c9770]">{desafioAtual.progress}%</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[12px] text-[#6B7685]">{desafioAtual.atual} / {desafioAtual.meta}</span>
            </div>
            <div className="rounded-full bg-[#E4E7EB] h-1.5 overflow-hidden">
              <div
                className="bg-[#1c9770] rounded-full h-1.5"
                style={{ width: `${desafioAtual.progress}%` }}
              />
            </div>
          </div>
        </section>

        <section className="mb-4">
          <div className="bg-white rounded-xl border border-[#E4E7EB] p-3">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-[16px] text-[#1A202C]">Mapa de missões</h2>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[rgba(28,151,112,0.1)]">
                <FiZap size={14} color="#1c9770" />
                <span className="font-bold text-[12px] text-[#1c9770]">{streakDias} dias de streak</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              {mapaMissoes.map(({ id, desbloqueada, concluida }) => (

                <div
                  key={id}
                  className="flex flex-col items-center justify-start gap-1 h-[58px]"
                >


                  <div
                    className={`rounded-full flex items-center justify-center font-bold w-10 h-10 text-[13px] ${getCircleClass(concluida, desbloqueada)}`}
                  >
                    {id}
                  </div>

                  <div
                    className={`w-0.5 h-4 ${id < mapaMissoes[mapaMissoes.length - 1].id
                        ? concluida
                          ? 'bg-[#1c9770]'
                          : 'bg-[#E4E7EB]'
                        : 'opacity-0'
                      }`}
                  />

                </div>
              ))}
            </div>

            <p className="text-[#6B7685] text-[12px] text-center mt-3">
              Acesse o app diariamente para liberar o Impulso+ e receber recompensas
            </p>
          </div>
        </section>

        <section className="mb-4">
          <h2 className="font-bold text-[16px] text-[#1A202C] mb-3">
            Missões Gerais
          </h2>
          <div className="flex flex-col gap-2">
            {missoesGerais.map((missao, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-[#E4E7EB] p-3 flex items-center gap-3"
              >
                <div className="rounded-xl flex items-center justify-center shrink-0 w-10 h-10 bg-[rgba(28,151,112,0.08)]">
                  <FiTarget size={18} color="#1c9770" />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] text-[#1A202C]">
                    {missao.missao}
                  </p>
                  <span className="text-[#1c9770] text-[12px] font-bold">
                    {missao.trofeus} troféus
                  </span>
                </div>
                <button
                  onClick={() => abrirModal(missao.id, "geral")}
                  className="rounded-full flex items-center justify-center shrink-0 w-[22px] h-[22px] border-2 bg-transparent border-[#CDD3DA]"
                >
                  <FiArrowRight size={10} color="#9BA3AE" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-4">
          <h2 className="font-bold text-[16px] text-[#1A202C] mb-3">Missões personalizadas</h2>
          <div className="flex flex-col gap-2">
            {missoesPersonalizadas.map((missao, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-[#E4E7EB] p-3 flex items-center gap-3"
              >
                <div className="rounded-xl flex items-center justify-center shrink-0 w-10 h-10 bg-[rgba(28,151,112,0.08)]">
                  <FiTarget size={18} color="#1c9770" />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] text-[#1A202C]">
                    {missao.titulo}
                  </p>
                  <span className="text-[#1c9770] text-[12px] font-bold">
                    {missao.trofeus} troféus
                  </span>
                </div>
                <button
                  onClick={() => abrirModal(missao.id, "personalizada")}
                  className="rounded-full flex items-center justify-center shrink-0 w-[22px] h-[22px] border-2 bg-transparent border-[#CDD3DA]"
                >
                  <FiArrowRight size={10} color="#9BA3AE" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-[16px] text-[#1A202C]">Desafio semanal</h2>
            <button
              className="bg-transparent border-0 p-0 flex items-center gap-1 cursor-pointer"
              onClick={() => setExpandedDesafio(!expandedDesafio)}
            >
              <FiInfo size={14} color="#1c9770" />
            </button>
          </div>

          {expandedDesafio && (
            <div className="rounded-xl p-3 mb-3 text-[13px] bg-[rgba(28,151,112,0.07)] border border-[rgba(28,151,112,0.2)] text-[#1A202C]">
              Os desafios semanais são lançados toda segunda-feira para o público do aplicativo.
              Quem completar o desafio mais rápido receberá uma caixa surpresa única.
            </div>
          )}

          <div
            className="rounded-xl p-3 flex items-center justify-between bg-gradient-primary shadow-brand-primary cursor-pointer"
            onClick={() => navigate('/ranking')}
          >
            <div>
              <p className="font-bold text-white text-[13px]">Ver Ranking Semanal</p>
              <p className="text-white opacity-75 text-[12px]">
                Você está no grupo dos 40% melhores
              </p>
            </div>
            <FiArrowRight size={20} color="#fff" />
          </div>
        </section>

      </main>

      <ModalConfirmacao
        aberto={modalAberto}
        titulo="Concluir missão?"
        descricao="Essa missão será marcada como concluída e substituída por outra."
        onClose={() => setModalAberto(false)}
        onConfirm={async () => {

          if (tipoMissao === "personalizada") {
            await concluirMissao(missaoSelecionada)
          }

          if (tipoMissao === "geral") {
            await concluirMissaoGeral(missaoSelecionada)
          }

          setModalAberto(false)
        }}
      />

      <Bottomnav activePage="home" />
    </div>
  )
}

export default Missoes
