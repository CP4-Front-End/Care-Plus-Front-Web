import { useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { FiArrowLeft, FiAward } from 'react-icons/fi'
import TopBar from '../components/TopBar.jsx'
import Bottomnav from '../components/Bottomnav.jsx'
import { buscarUsuarioLogado } from '../services/sessao.js'
import { buscarMissoesConnect } from '../services/fiware.js'

const USUARIOS_SIMULADOS = [
  { id: 'maria', nome: 'Maria', pontos: 1200 },
  { id: 'emiliano', nome: 'Emiliano', pontos: 1120 },
  { id: 'artur', nome: 'Artur', pontos: 980 },
  { id: 'giovanna', nome: 'Giovanna', pontos: 860 },
  { id: 'matheus', nome: 'Matheus', pontos: 730 },
]

const CATEGORIAS = [
  { nome: 'Bronze', minimo: 0 },
  { nome: 'Prata', minimo: 500 },
  { nome: 'Ouro', minimo: 1500 },
]

function nivelPorTrofeus(trofeusAcumulados) {
  return [...CATEGORIAS]
    .reverse()
    .find((categoria) => trofeusAcumulados >= categoria.minimo)?.nome || 'Bronze'
}

const Ranking = () => {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function carregarUsuario() {
      try {
        const carteirinha = localStorage.getItem('carteirinha')

        if (carteirinha) {
          try {
            const dadosConnect = await buscarMissoesConnect(carteirinha)

            if (dadosConnect.usuario) {
              localStorage.setItem('trofeus', dadosConnect.usuario.trofeus || 0)

              if ((dadosConnect.novasConclusoes || []).length > 0) {
                window.dispatchEvent(new Event('trofeusAtualizados'))
              }
            }
          } catch {
            // O ranking usa o progresso salvo quando o FIWARE nao responde.
          }
        }

        const dados = await buscarUsuarioLogado(navigate)

        if (!dados) return

        setUsuario(dados)
      } finally {
        setCarregando(false)
      }
    }

    carregarUsuario()
  }, [navigate])

  const trofeusHistoricos = usuario?.trofeusAcumulados ?? usuario?.trofeus ?? 0
  const nomeUsuario = usuario?.nome || localStorage.getItem('nome') || 'Você'
  const nivelUsuario = nivelPorTrofeus(trofeusHistoricos)

  const rankingData = useMemo(() => {
    const usuarioLogado = {
      id: 'usuario-logado',
      nome: nomeUsuario,
      pontos: trofeusHistoricos,
      atual: true,
    }

    return [usuarioLogado, ...USUARIOS_SIMULADOS]
      .sort((a, b) => b.pontos - a.pontos)
      .map((item, index) => ({
        ...item,
        posicao: index + 1,
      }))
  }, [nomeUsuario, trofeusHistoricos])

  const usuarioNoRanking = rankingData.find((item) => item.atual)
  const podium = rankingData.slice(0, 3)

  const getMedalClass = (position) => {
    if (position === 1) return 'ranking-gold'
    if (position === 2) return 'ranking-silver'
    if (position === 3) return 'ranking-bronze'
    return 'bg-[rgba(28,151,112,0.1)] text-[#1c9770]'
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <TopBar showPoints={true} />

      <main className="w-full px-4 lg:px-8 pt-4 pb-24">

        <section className="flex items-center gap-2 mb-4">
          <button
            className="bg-transparent border-0 p-0 text-[#6B7685] cursor-pointer"
            onClick={() => navigate('/missoes')}
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-[20px] text-[#1A202C]">Ranking de Troféus</h1>
        </section>

        <section className="mb-4">
          <div className="rounded-xl p-4 text-center bg-gradient-primary shadow-brand-primary">
            <div className="w-16 h-16 rounded-full bg-white/25 flex items-center justify-center mx-auto mb-3">
              <FiAward size={32} color="#fff" />
            </div>
            <h2 className="font-bold text-white text-[20px] mb-1">
              {carregando
                ? 'Carregando seu ranking...'
                : `Você está em ${usuarioNoRanking?.posicao || 1}° lugar!`}
            </h2>
            <p className="text-white opacity-75 text-[13px] mb-2">
              Nivel {nivelUsuario} baseado no total histórico ganho
            </p>
            <span className="font-bold inline-block px-3 py-1 rounded-full bg-white text-[#1c9770] text-[14px]">
              {trofeusHistoricos.toLocaleString('pt-BR')} troféus históricos
            </span>
          </div>
        </section>

        <section className="mb-4">
          <h2 className="font-bold text-[16px] text-[#1A202C] mb-3">Pódio</h2>
          <div className="grid grid-cols-3 gap-3 justify-center">
            {podium.map(({ id, nome, pontos, atual, posicao }) => (
              <div
                key={id}
                className={`rounded-xl p-3 text-center border ${atual ? 'ranking-item-highlight' : 'bg-white border-[#E4E7EB]'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-[14px] ${getMedalClass(posicao)}`}>
                  {posicao}
                </div>
                <p className="font-bold text-[14px] text-[#1A202C] truncate">{nome}</p>
                <p className="text-[#1c9770] font-bold text-[12px]">
                  {pontos.toLocaleString('pt-BR')} pts
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-4">
          <h2 className="font-bold text-[16px] text-[#1A202C] mb-3">Classificação</h2>
          <div className="flex flex-col gap-2">
            {rankingData.map(({ id, nome, pontos, atual, posicao }) => (
              <div
                key={id}
                className={`rounded-xl p-3 flex items-center gap-3 border ${atual ? 'ranking-item-highlight' : 'bg-white border-[#E4E7EB]'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] shrink-0 ${getMedalClass(posicao)}`}>
                  {posicao}
                </div>
                <p className={`font-medium text-[14px] flex-1 min-w-0 truncate ${atual ? 'text-[#1c9770]' : 'text-[#1A202C]'}`}>
                  {nome} {atual && '(você)'}
                </p>
                <span className={`font-bold text-[14px] ${atual ? 'text-[#1c9770]' : 'text-[#6B7685]'}`}>
                  {pontos.toLocaleString('pt-BR')} troféus
                </span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <button
            className="w-full rounded-xl py-3 font-bold text-[14px] border-2 border-[#E4E7EB] bg-white text-[#6B7685] cursor-pointer"
            onClick={() => navigate('/inicial')}
          >
            Sair do ranking
          </button>
        </section>

      </main>

      <Bottomnav activePage="home" />
    </div>
  )
}

export default Ranking
