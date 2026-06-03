import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiArrowRight, FiZap, FiTarget, FiStar,
  FiHeart, FiWifi, FiFileText, FiUser, FiGift
} from 'react-icons/fi'
import { FaFire, FaTrophy } from 'react-icons/fa'
import TopBar from '../components/TopBar.jsx'
import Bottomnav from '../components/Bottomnav.jsx'
import ModalConfirmacao from '../components/ModalConfirmacao.jsx'
import mockupMobile from '../assets/mucupe.png'
import mockupDesktop from '../assets/mucupePC.png'
import flux from '../assets/flux.png'
import { API_URL, buscarUsuarioLogado, carregarBeneficiosDaSessao } from '../services/sessao.js'

const DIAS_SEMANA_CALENDARIO = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const DIAS_FLUX_SEMANA = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']

function formatarDataCalendario(ano, mes, dia) {
  return `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

const Inicial = () => {
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [beneficios, setBeneficios] = useState([])
  const [beneficiosResgatados, setBeneficiosResgatados] = useState([])
  const [streakDias, setStreakDias] = useState(0)
  const [streakDiasAcendidos, setStreakDiasAcendidos] = useState([])
  const [menuComFundo, setMenuComFundo] = useState(false)
  const [resgatandoBeneficioId, setResgatandoBeneficioId] = useState(null)
  const [modalBeneficio, setModalBeneficio] = useState({
    aberto: false,
    titulo: '',
    descricao: '',
  })

  useEffect(() => {
    async function carregarUsuario() {
      const dados = await buscarUsuarioLogado(navigate)

      if (!dados) return

      setNome(dados.nome)
      setBeneficiosResgatados(dados.beneficiosResgatados || [])
      setStreakDias(dados.streak || 0)
      setStreakDiasAcendidos(dados.streakDiasAcendidos || [])
    }

    carregarUsuario()
  }, [navigate])

  useEffect(() => {
    async function carregarBeneficiosSorteados() {
      const carteirinha = localStorage.getItem('carteirinha')

      try {
        if (!carteirinha) return

        const dados = await carregarBeneficiosDaSessao(carteirinha, 6)
        setBeneficios(dados.slice(0, 3))
      } catch {
        setBeneficios([])
      }
    }

    carregarBeneficiosSorteados()
  }, [])

  useEffect(() => {
    function atualizarFundoMenu() {
      setMenuComFundo(window.scrollY > 8)
    }

    atualizarFundoMenu()
    window.addEventListener('scroll', atualizarFundoMenu, { passive: true })

    return () => {
      window.removeEventListener('scroll', atualizarFundoMenu)
    }
  }, [])

  const missoesAtivas = [
    { id: 1, title: 'Beber 3 litros de água', progress: 60, icon: FiZap },
    { id: 2, title: 'Andar 3km no dia', progress: 30, icon: FiTarget },
    { id: 3, title: '30min de bike', progress: 0, icon: FiStar },
  ]

  const quickMenuItems = [
    { id: 'missoes', label: 'Missões', icon: FiTarget, path: '/missoes', iconColor: '#1c9770', bgColor: 'bg-[rgba(28,151,112,0.1)]' },
    { id: 'mind', label: 'Mind+', icon: FiHeart, path: '/mind', iconColor: '#7AD180', bgColor: 'bg-[rgba(122,209,128,0.15)]' },
    { id: 'connect', label: 'Connect+', icon: FiWifi, path: '/connect', iconColor: '#7AD1C3', bgColor: 'bg-[rgba(122,209,195,0.15)]' },
    { id: 'noticias', label: 'Notícias', icon: FiFileText, path: '/noticias', iconColor: '#93CB52', bgColor: 'bg-[rgba(147,203,82,0.15)]' },
    { id: 'perfil', label: 'Perfil', icon: FiUser, path: '/perfil', iconColor: '#1c9770', bgColor: 'bg-[rgba(28,151,112,0.1)]' },
  ]

  const dataCalendario = new Date()
  const anoCalendario = dataCalendario.getFullYear()
  const mesCalendario = dataCalendario.getMonth()
  const diaHoje = dataCalendario.getDate()
  const primeiroDiaMes = new Date(anoCalendario, mesCalendario, 1).getDay()
  const diasNoMes = new Date(anoCalendario, mesCalendario + 1, 0).getDate()
  const nomeMes = dataCalendario.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })
  const datasComFogo = new Set(streakDiasAcendidos)
  const indiceDiaAtual = dataCalendario.getDay() === 0
    ? 6
    : dataCalendario.getDay() - 1
  const diasProtegidos = Math.min(streakDias, 7)
  const diasCalendario = [
    ...Array.from({ length: primeiroDiaMes }, () => null),
    ...Array.from({ length: diasNoMes }, (_, index) => {
      const dia = index + 1

      return {
        dia,
        data: formatarDataCalendario(anoCalendario, mesCalendario, dia),
      }
    }),
  ]

  function abrirModalBeneficio(titulo, descricao) {
    setModalBeneficio({
      aberto: true,
      titulo,
      descricao,
    })
  }

  function fecharModalBeneficio() {
    setModalBeneficio({
      aberto: false,
      titulo: '',
      descricao: '',
    })
  }

  async function resgatarBeneficio(beneficio) {
    const carteirinha = localStorage.getItem('carteirinha')

    if (!carteirinha) {
      abrirModalBeneficio(
        'Carteirinha necessária',
        'Entre com sua carteirinha para resgatar benefícios.'
      )
      return
    }

    setResgatandoBeneficioId(beneficio.id)

    try {
      const resposta = await fetch(`${API_URL}/resgatar-beneficio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carteirinha,
          idBeneficio: beneficio.id,
        }),
      })

      const dados = await resposta.json()

      if (!resposta.ok) {
        throw new Error(dados.detail || 'Não foi possível resgatar este benefício.')
      }

      setBeneficiosResgatados(dados.usuario.beneficiosResgatados || [])
      localStorage.setItem('trofeus', dados.usuario.trofeus)
      window.dispatchEvent(new Event('trofeusAtualizados'))
      abrirModalBeneficio(
        'Benefício resgatado',
        `${beneficio.titulo} foi resgatado com sucesso.`
      )
    } catch (erro) {
      abrirModalBeneficio('Resgate não realizado', erro.message)
    } finally {
      setResgatandoBeneficioId(null)
    }
  }

  return (
    
    <div className="min-h-screen bg-[#F4F6F8]">
      <TopBar showPoints={true} />
      
      <section
        className={`sticky top-0 z-40 px-4 p-3 transition-all duration-300 ${
          menuComFundo
            ? 'bg-white/70 backdrop-blur-xl border-b border-white/60 shadow-[0_8px_24px_rgba(26,32,44,0.08)]'
            : 'bg-transparent border-b border-transparent shadow-none'
        }`}
      >
          <div className="grid grid-cols-5 gap-3 justify-center">
            {quickMenuItems.map(({ id, label, icon: Icon, path, iconColor, bgColor }) => (
              <div
                key={id}
                className="flex flex-col items-center gap-2 cursor-pointer"
                onClick={() => navigate(path)}
              >
                <div className={`w-12 h-12 rounded-md flex items-center justify-center ${bgColor}`}>
                  <Icon size={40} color={iconColor} />
                </div>
                <span className="text-[#6B7685] text-[12px] font-medium text-center">{label}</span>
              </div>
            ))}
          </div>
        </section>
    
      <div className="relative px-4 lg:px-8 " >
        <img src={mockupMobile} alt="" className=" block lg:hidden rounded-md" />
        <img src={mockupDesktop} alt="" className="hidden lg:block rounded-md " />

        <div className="absolute bottom-[10%] left-4 lg:left-8 z-10 mb-2">
          <p className="text-white text-sm md:text-[23px] leading-none mb-1 mx-4 lg:mx-9">Olá,</p>
          <h1 className="font-bold text-[20px] md:text-[29px] lg:text-[32px] mx-3 text-white leading-none lg:mx-8">{nome}!</h1>
          <p className="text-white text-[15px] md:text-[21px] lg:text-[25px] mx-3 mt-1 leading-tight lg:mx-8">
            Continue sua jornada de bem-estar hoje.
          </p>
        </div>
      </div>

      <main className="w-full px-4 lg:px-8 pt-4 pb-24">

        <section className="mb-4">
          <div
            className="relative overflow-hidden rounded-md border border-[rgba(28,151,112,0.18)] bg-white shadow-brand-card p-4 lg:p-8 text-center lg:text-left cursor-pointer"
            onClick={() => navigate('/impulso')}
          >
            <div className="absolute inset-x-0 top-0 h-24 lg:h-full lg:w-[42%] bg-[linear-gradient(180deg,rgba(28,151,112,0.12),rgba(28,151,112,0))] lg:bg-[linear-gradient(90deg,rgba(28,151,112,0.14),rgba(28,151,112,0))]" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[240px_minmax(260px,1fr)_320px] xl:grid-cols-[300px_minmax(320px,1fr)_360px] items-center gap-5 lg:gap-8 xl:gap-10">
              <div className="flex items-center justify-center gap-4 lg:flex-col lg:items-center">
                <div className="shrink-0 flex flex-col items-center">
                  <div className="mb-2 lg:mb-4">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(28,151,112,0.1)] px-3 py-1 lg:px-4 lg:py-1.5 text-[#1c9770] text-[12px] lg:text-[13px] font-bold">
                    
                    Flux ativo
                  </span>
                  </div>

                  <div className="mx-auto w-20 h-20 lg:w-56 lg:h-56 xl:w-64 xl:h-64 rounded-full bg-[rgba(28,151,112,0.08)] border border-[rgba(28,151,112,0.14)] flex items-center justify-center">
                    <img
                      src={flux}
                      alt="Flux"
                      className="w-18 h-18 lg:w-48 lg:h-48 xl:w-56 xl:h-56 object-contain"
                    />
                  </div>
                </div>

                <div className="lg:hidden min-w-0 text-left p-4">
                  <div className="flex items-baseline pt-6 gap-2 mb-1">
                    <h2 className="text-[#1c9770] text-[42px] leading-none font-bold">
                      {streakDias}
                    </h2>
                    <p className="uppercase tracking-[0.8px] text-[#1A202C] text-[11px] font-bold">
                      dias consecutivos
                    </p>
                  </div>
                  <p className="text-[#6B7685] text-[12px] leading-snug">
                    Não deixe o Flux apagar hoje!
                  </p>
                </div>
              </div>

              <div className="hidden lg:flex flex-col items-center lg:items-start lg:max-w-xl lg:mx-auto">
                <h2 className="text-[#1c9770] text-[48px] lg:text-[76px] xl:text-[88px] leading-none font-bold">
                  {streakDias}
                </h2>
                <p className="uppercase tracking-[1.4px] text-[#1A202C] text-[12px] lg:text-[14px] font-bold mb-2 lg:mb-3">
                  dias consecutivos
                </p>
                <p className="text-[#6B7685] text-[13px] lg:text-[16px] mb-3 lg:mb-6 lg:max-w-xl">
                  Não deixe o Flux apagar hoje!
                </p>
              </div>

              <div className="w-full flex justify-center md:hidden">
                <div className="flex justify-center gap-2">
                  {DIAS_FLUX_SEMANA.map((dia, index) => {
                    const ativo = streakDias > 0 &&
                      index <= indiceDiaAtual &&
                      index > indiceDiaAtual - diasProtegidos

                    return (
                      <span
                        key={`${dia}-${index}`}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold ${ativo
                          ? 'bg-[#1c9770] text-white shadow-brand-primary'
                          : 'bg-[#F0F2F5] text-[#9BA3AE]'
                          }`}
                      >
                        {dia}
                      </span>
                    )
                  })}
                </div>
              </div>

              <div className="hidden md:block w-full rounded-md border border-[#E4E7EB] bg-[#F8FAFB] p-3 lg:p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-[#6B7685] text-[11px] uppercase font-bold tracking-[1px]">
                      Calendario do fogo
                    </p>
                    <h3 className="text-[#1A202C] text-[14px] lg:text-[16px] font-bold capitalize">
                      {nomeMes}
                    </h3>
                  </div>
                  <span className="w-9 h-9 rounded-full bg-[rgba(28,151,112,0.1)] text-[#1c9770] flex items-center justify-center">
                    <FaFire size={15} />
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-1.5 mb-1.5">
                  {DIAS_SEMANA_CALENDARIO.map((dia, index) => (
                    <span
                      key={`${dia}-${index}`}
                      className="text-center text-[11px] font-bold text-[#9BA3AE]"
                    >
                      {dia}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1.5">
                  {diasCalendario.map((diaCalendario, index) => {
                    if (!diaCalendario) {
                      return <span key={`vazio-${index}`} className="h-8 lg:h-9" />
                    }

                    const fogoAceso = datasComFogo.has(diaCalendario.data)
                    const hoje = diaCalendario.dia === diaHoje

                    return (
                      <span
                        key={diaCalendario.data}
                        className={`h-8 lg:h-9 rounded-lg flex items-center justify-center text-[12px] lg:text-[13px] font-bold border ${fogoAceso
                          ? 'bg-[#1c9770] border-[#1c9770] text-white shadow-brand-primary'
                          : hoje
                            ? 'bg-white border-[rgba(28,151,112,0.35)] text-[#1c9770]'
                            : 'bg-white border-[#E4E7EB] text-[#6B7685]'
                          }`}
                      >
                        {fogoAceso ? <FaFire size={12} /> : diaCalendario.dia}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        

        <section className="mb-4">
          <div
            className="rounded-md p-3 flex items-center justify-between bg-gradient-primary shadow-brand-primary cursor-pointer"
            onClick={() => navigate('/scan')}
          >
            <div>
              <p className="font-bold text-white text-[14px]">Scan Diário</p>
              <p className="text-white opacity-75 text-[12px]">
                Realize o scan e ganhe uma caixa surpresa
              </p>
            </div>
            <div className="w-11 h-11 flex items-center justify-center rounded-md bg-white/25">
              <FiArrowRight size={20} color="#fff" />
            </div>
          </div>
        </section>

        <section className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-[16px] text-[#1A202C]">Missões ativas</h2>
            <button
              className="flex items-center gap-1 text-[13px] text-[#1c9770] bg-transparent border-0 p-0 cursor-pointer"
              onClick={() => navigate('/missoes')}
            >
              Ver mais <FiArrowRight size={13} color="#1c9770" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {missoesAtivas.map(({ id, title, progress, icon: Icon }) => (
              <div
                key={id}
                className="bg-white rounded-md p-3 flex items-center gap-3 border border-[#E4E7EB] shadow-brand-card"
              >
                <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0 bg-[rgba(28,151,112,0.1)]">
                  <Icon size={18} color="#1c9770" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[14px] text-[#1A202C] mb-1">{title}</p>
                  <div className="rounded-full bg-[#E4E7EB] h-1.5 overflow-hidden">
                    <div
                      className={`rounded-full h-1.5 ${progress === 100 ? 'bg-[#93CB52]' : 'bg-[#1c9770]'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <span className="font-bold text-[#1c9770] shrink-0 text-[12px]">{progress}%</span>
              </div>
            ))}
          </div>

        </section>

        <section className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-[16px] text-[#1A202C]">Benefícios</h2>
            <button
              className="flex items-center gap-1 text-[13px] text-[#1c9770] bg-transparent border-0 p-0 cursor-pointer"
              onClick={() => navigate('/beneficios')}
            >
              Ver todos <FiArrowRight size={13} color="#1c9770" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {beneficios.map(({ id, titulo, parceiro, custoTrofeus }) => {
              const resgatado = beneficiosResgatados.some((beneficio) => beneficio.id === id)
              const resgatando = resgatandoBeneficioId === id

              return (
                <button
                  key={id}
                  className={`text-left bg-white rounded-md p-3 border border-[#E4E7EB] shadow-brand-card ${
                    resgatado || resgatando ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  disabled={resgatado || resgatando}
                  onClick={() => resgatarBeneficio({ id, titulo, parceiro, custoTrofeus })}
                >
                  <div className="w-9 h-9 rounded-md mb-2 bg-[rgba(28,151,112,0.1)] flex items-center justify-center">
                    <FiGift size={17} color="#1c9770" />
                  </div>
                  <p className="text-[#6B7685] text-[12px] mb-1">{parceiro}</p>
                  <p className="font-bold text-[14px] text-[#1A202C] mb-1">{titulo}</p>
                  <p className="font-bold text-[#1c9770] text-[12px] flex items-center gap-1">
                    <FaTrophy size={12} />
                    {custoTrofeus.toLocaleString('pt-BR')} troféus
                  </p>
                  <p className="text-[#6B7685] text-[12px] mt-2">
                    {resgatado && 'Resgatado'}
                    {!resgatado && resgatando && 'Resgatando...'}
                    {!resgatado && !resgatando && 'Clique para resgatar'}
                  </p>
                </button>
              )
            })}
          </div>
        </section>

        <section className="mb-4">
          <div
            className="rounded-md p-3 flex items-center justify-between bg-gradient-accent1 shadow-brand-primary cursor-pointer"
            onClick={() => navigate('/mind')}
          >
            <div>
              <p className="font-bold text-white text-[14px]">Mind+</p>
              <p className="text-white opacity-75 text-[12px]">
                Apoio psicológico a qualquer hora e lugar
              </p>
            </div>
            <div className="w-11 h-11 flex items-center justify-center rounded-md bg-white/25">
              <FiHeart size={20} color="#fff" />
            </div>
          </div>
        </section>

        <section className="mb-4">
          <div
            className="rounded-md p-3 flex items-center justify-between bg-gradient-accent2 shadow-brand-primary cursor-pointer"
            onClick={() => navigate('/connect')}
          >
            <div>
              <p className="font-bold text-white text-[14px]">Connect+</p>
              <p className="text-white opacity-75 text-[12px]">
                Sono, batimentos e metas num só lugar
              </p>
            </div>
            <div className="w-11 h-11 flex items-center justify-center rounded-md bg-white/25">
              <FiWifi size={20} color="#fff" />
            </div>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-[16px] text-[#1A202C]">Notícias</h2>
            <button
              className="flex items-center gap-1 text-[13px] text-[#1c9770] bg-transparent border-0 p-0 cursor-pointer"
              onClick={() => navigate('/noticias')}
            >
              Ver mais <FiArrowRight size={13} color="#1c9770" />
            </button>
          </div>

          <div
            className="bg-white rounded-md p-3 border border-[#E4E7EB] shadow-brand-card cursor-pointer"
            onClick={() => navigate('/noticias')}
          >
            <p className="font-bold text-[14px] text-[#1A202C] mb-1">
              Saúde mental: afastamentos dobram em dez anos e chegam a 440 mil
            </p>
            <p className="text-[#6B7685] text-[12px] mb-2">
              Em 2014, quase 203 mil brasileiros foram afastados do trabalho em razão de episódios depressivos e transtornos de ansiedade.
            </p>
            <span className="text-[#1c9770] font-bold text-[12px]">Ver matéria completa</span>
          </div>
        </section>

      </main>

      <ModalConfirmacao
        aberto={modalBeneficio.aberto}
        titulo={modalBeneficio.titulo}
        descricao={modalBeneficio.descricao}
        textoCancelar="Entendi"
        mostrarConfirmar={false}
        onClose={fecharModalBeneficio}
      />

      <Bottomnav activePage="home" />
    </div>
  )
}

export default Inicial
