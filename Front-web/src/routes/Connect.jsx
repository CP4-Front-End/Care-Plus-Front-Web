import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiActivity,
  FiArrowLeft,
  FiArrowRight,
  FiAward,
  FiClock,
  FiDroplet,
  FiRefreshCw,
  FiSun,
  FiTrendingUp,
  FiWifi,
} from 'react-icons/fi'
import TopBar from '../components/TopBar.jsx'
import Bottomnav from '../components/Bottomnav.jsx'
import Flux from '../assets/img.png'
import FluxPC from '../assets/imgPC.png'
import { buscarMissoesConnect } from '../services/fiware.js'

const conquistasMockadas = [
  { id: 1, title: 'Mestre dos Passos', desc: 'De 10.000 passos em um dia.', icon: FiActivity },
  { id: 2, title: 'Caminhante', desc: 'Complete a meta de passos por 3 dias seguidos.', icon: FiTrendingUp },
  { id: 3, title: 'Rei das Garrafinhas', desc: 'Beba 3L de agua diarios por 3 dias.', icon: FiDroplet },
  { id: 4, title: 'Hidratado', desc: 'Registre todos os copos de agua do dia.', icon: FiAward },
]

function formatarValorMissao(missao) {
  if (missao.tipo === 'water') {
    return `${Number(missao.atual || 0).toLocaleString('pt-BR')}ml / ${Number(missao.meta || 0).toLocaleString('pt-BR')}ml`
  }

  if (missao.tipo === 'steps_per_minute' || missao.tipo === 'daily_steps_average') {
    return `${Number(missao.atual || 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} / ${Number(missao.meta || 0).toLocaleString('pt-BR')} passos/min`
  }

  return `${Number(missao.atual || 0).toLocaleString('pt-BR')} / ${Number(missao.meta || 0).toLocaleString('pt-BR')} passos`
}

function escolherIconeMissao(tipo) {
  if (tipo === 'water') return FiDroplet
  if (tipo === 'steps_per_minute' || tipo === 'daily_steps_average') return FiTrendingUp

  return FiActivity
}

const Connect = () => {
  const navigate = useNavigate()
  const [pedometro, setPedometro] = useState(null)
  const [luminaria, setLuminaria] = useState({
    label: 'Apagada',
    hex: '#9BA3AE',
    nivel: 0,
    fonte: 'passos',
  })
  const [missoesConnect, setMissoesConnect] = useState([])
  const [aguaMl, setAguaMl] = useState(0)
  const [copoAguaMl, setCopoAguaMl] = useState(220)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [atualizadoEm, setAtualizadoEm] = useState(null)

  const carregarConnect = useCallback(async (mostrarLoading = false) => {
    if (mostrarLoading) setCarregando(true)

    try {
      const carteirinha = localStorage.getItem('carteirinha')
      if (!carteirinha) return

      const dados = await buscarMissoesConnect(carteirinha)
      setPedometro(dados.pedometro || null)
      setLuminaria(dados.luminaria || {
        label: 'Apagada',
        hex: '#9BA3AE',
        nivel: 0,
        fonte: 'passos',
      })
      setMissoesConnect(dados.missoes || [])
      setAguaMl(dados.aguaMl || 0)
      setCopoAguaMl(dados.copoAguaMl || 220)
      setErro(dados.pedometro?.error || '')
      setAtualizadoEm(new Date())

      if (dados.usuario) {
        localStorage.setItem('trofeus', dados.usuario.trofeus || 0)

        if ((dados.novasConclusoes || []).length > 0) {
          window.dispatchEvent(new Event('trofeusAtualizados'))
        }
      }
    } catch (error) {
      setErro(error.message)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    const carregamentoInicial = window.setTimeout(() => {
      carregarConnect(true)
    }, 0)

    const intervalo = window.setInterval(() => {
      carregarConnect(false)
    }, 10000)

    return () => {
      window.clearTimeout(carregamentoInicial)
      window.clearInterval(intervalo)
    }
  }, [carregarConnect])

  const missoesPrincipais = useMemo(() => {
    const principais = missoesConnect.filter((missao) => (
      missao.tipo === 'steps' || missao.tipo === 'water'
    ))

    return principais.length > 0 ? principais.slice(0, 2) : missoesConnect.slice(0, 2)
  }, [missoesConnect])

  const passosHoje = pedometro?.steps ?? 0
  const mediaDiaria = pedometro?.dailyStepsAverage ?? 0
  const statusPedometro = erro ? 'offline' : pedometro?.status || 'aguardando'
  const resetLabel = luminaria.resetEm?.label || missoesConnect.find((missao) => missao.resetEm?.label)?.resetEm?.label || ''
  const textoAtualizacao = atualizadoEm
    ? atualizadoEm.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    : 'aguardando'

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <TopBar showPoints={true} />

      <div className="relative w-full">
        <img src={Flux} alt="" className="w-full block lg:hidden" />
        <img src={FluxPC} alt="" className="w-full hidden lg:block" />

        <section className="flex items-center gap-2 mb-4 absolute bottom-[63%] md:bottom-[79%] lg:bottom-[87%] left-4 lg:left-8 z-10">
          <button
            className="bg-transparent border-0 p-0 text-white cursor-pointer"
            onClick={() => navigate('/inicial')}
            type="button"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-[20px] text-white">Connect+</h1>
        </section>
      </div>

      <main className="w-full px-4 lg:px-8 pt-4 pb-24">
        <section className="mb-4">
          <div className="bg-white rounded-md border border-[#E4E7EB] shadow-brand-card p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-md bg-[rgba(28,151,112,0.1)] flex items-center justify-center">
                  <FiWifi size={24} color="#1c9770" />
                </div>
                <div>
                  <p className="text-[#6B7685] text-[11px] uppercase font-bold tracking-[1px]">
                    Pulseira e luminaria
                  </p>
                  <h2 className="font-bold text-[#1A202C] text-[18px]">step001 em tempo real</h2>
                  <p className="text-[#6B7685] text-[12px]">Atualizado {textoAtualizacao}</p>
                </div>
              </div>
              <button
                type="button"
                className="flex items-center justify-center gap-1.5 text-[13px] text-[#1c9770] bg-white border border-[rgba(28,151,112,0.2)] rounded-md px-3 py-2 cursor-pointer disabled:opacity-70"
                onClick={() => carregarConnect(true)}
                disabled={carregando}
              >
                <FiRefreshCw
                  size={13}
                  color="#1c9770"
                  className={carregando ? 'animate-spin' : ''}
                />
                Atualizar
              </button>
            </div>

            {erro && (
              <div className="mb-3 rounded-md border border-[#F6AD55]/40 bg-[#F6AD55]/10 px-3 py-2">
                <p className="text-[#6B7685] text-[12px]">
                  Nao foi possivel ler o FIWARE agora. {erro}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-md border border-[#E4E7EB] bg-[#F8FAFB] p-3">
                <p className="text-[#6B7685] text-[12px] mb-1">Status da pulseira</p>
                <p className="font-bold text-[18px] text-[#1A202C] capitalize">{statusPedometro}</p>
                <p className="text-[#6B7685] text-[12px] mt-1">{pedometro?.deviceId || 'step001'}</p>
              </div>

              <div className="rounded-md border border-[#E4E7EB] bg-[#F8FAFB] p-3">
                <p className="text-[#6B7685] text-[12px] mb-1">Passos hoje</p>
                <p className="font-bold text-[24px] text-[#1A202C] leading-none">
                  {carregando && !pedometro ? 'Carregando...' : passosHoje.toLocaleString('pt-BR')}
                </p>
                <p className="text-[#6B7685] text-[12px] mt-1">
                  Media {mediaDiaria.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} passos/min
                </p>
              </div>

              <div className="rounded-md border border-[#E4E7EB] bg-[#F8FAFB] p-3">
                <p className="text-[#6B7685] text-[12px] mb-1">Agua confirmada</p>
                <p className="font-bold text-[24px] text-[#1A202C] leading-none">
                  {aguaMl.toLocaleString('pt-BR')}ml
                </p>
                <p className="text-[#6B7685] text-[12px] mt-1">{copoAguaMl}ml por toque</p>
              </div>

              <div className="rounded-md border border-[#E4E7EB] bg-[#F8FAFB] p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full"
                    style={{
                      color: luminaria.hex,
                      backgroundColor: `${luminaria.hex}18`,
                      boxShadow: luminaria.nivel > 0 ? `0 0 16px ${luminaria.hex}70` : 'none',
                    }}
                  >
                    <FiSun size={15} />
                  </span>
                  <p className="text-[#6B7685] text-[12px]">Luminaria</p>
                </div>
                <p className="font-bold text-[18px] text-[#1A202C]">{luminaria.label}</p>
                <p className="text-[#6B7685] text-[12px] mt-1">
                  {resetLabel ? `Reseta em ${resetLabel}` : 'Reset diario aguardando'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="font-bold text-[16px] text-[#1A202C]">Missoes Connect+</h2>
            {resetLabel && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(28,151,112,0.1)] px-3 py-1 text-[12px] font-bold text-[#1c9770]">
                <FiClock size={13} />
                Reseta em {resetLabel}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {missoesPrincipais.map((missao) => {
              const Icon = escolherIconeMissao(missao.tipo)

              return (
                <div
                  key={missao.id}
                  className={`bg-white rounded-md border shadow-brand-card p-3 ${
                    missao.concluida
                      ? 'border-[rgba(28,151,112,0.35)] bg-[rgba(28,151,112,0.03)]'
                      : 'border-[#E4E7EB]'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-md flex items-center justify-center shrink-0 ${
                      missao.concluida ? 'bg-[#1c9770]' : 'bg-[rgba(28,151,112,0.1)]'
                    }`}>
                      <Icon size={22} color={missao.concluida ? '#fff' : '#1c9770'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-bold text-[14px] text-[#1A202C] leading-snug">
                          {missao.titulo}
                        </p>
                        <span className="text-[#1c9770] text-[12px] font-bold shrink-0">
                          {missao.trofeus} trofeus
                        </span>
                      </div>
                      <p className="text-[#6B7685] text-[12px] mt-1">
                        {formatarValorMissao(missao)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-full bg-[#E4E7EB] h-2 overflow-hidden">
                    <div
                      className={`rounded-full h-2 ${missao.concluida ? 'bg-[#93CB52]' : 'bg-[#1c9770]'}`}
                      style={{ width: `${missao.progresso}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 mt-2">
                    <span className="font-bold text-[#1c9770] text-[12px]">
                      {missao.progresso}%
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      missao.concluida
                        ? 'bg-[rgba(147,203,82,0.18)] text-[#167a5a]'
                        : 'bg-[#F0F2F5] text-[#6B7685]'
                    }`}>
                      {missao.concluida ? 'Concluida' : 'Em progresso'}
                    </span>
                  </div>

                  {missao.concluida && missao.resetEm?.label && (
                    <p className="text-[#1c9770] text-[12px] font-bold mt-2">
                      Reseta em {missao.resetEm.label}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        <section className="mb-4">
          <h2 className="font-bold text-[16px] text-[#1A202C] mb-3">Conquistas</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {conquistasMockadas.map(({ id, title, desc, icon: Icon }) => (
              <div
                key={id}
                className="bg-white rounded-md border border-[#E4E7EB] shadow-brand-card p-3 flex items-center gap-3 opacity-70"
              >
                <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0 bg-[rgba(28,151,112,0.08)]">
                  <Icon size={18} color="#1c9770" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[14px] text-[#1A202C]">{title}</p>
                  <p className="text-[#6B7685] text-[12px]">{desc}</p>
                </div>
                <span className="rounded-full bg-[#E4E7EB] text-[#6B7685] px-2 py-0.5 text-[11px] font-medium">
                  Bloqueada
                </span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="rounded-md p-3 border border-[rgba(28,151,112,0.2)] bg-[rgba(28,151,112,0.07)] flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-[12px] text-[#1c9770]">Em breve</p>
              <p className="text-[#6B7685] text-[12px]">
                Novas leituras da pulseira a caminho: frequencia cardiaca, sono e muito mais.
              </p>
            </div>
            <FiArrowRight size={16} color="#1c9770" />
          </div>
        </section>
      </main>

      <Bottomnav activePage="home" />
    </div>
  )
}

export default Connect
