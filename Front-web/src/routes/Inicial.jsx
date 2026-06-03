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

const Inicial = () => {
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [beneficios, setBeneficios] = useState([])
  const [beneficiosResgatados, setBeneficiosResgatados] = useState([])
  const [streakDias, setStreakDias] = useState(0)
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

  const indiceDiaAtual = new Date().getDay() === 0
    ? 6
    : new Date().getDay() - 1
  const diasFlux = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
  const diasProtegidos = Math.min(streakDias, 7)

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

      <div className="relative p-4 lg:p-8 " >
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
            className="relative overflow-hidden rounded-xl border border-[rgba(28,151,112,0.18)] bg-white shadow-brand-card p-4 text-center cursor-pointer"
            onClick={() => navigate('/impulso')}
          >
            <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(28,151,112,0.12),rgba(28,151,112,0))]" />

            <div className="relative z-10 flex justify-center mb-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(28,151,112,0.1)] px-3 py-1 text-[#1c9770] text-[12px] font-bold">
                <FaFire size={13} />
                Flux ativo
              </span>
            </div>

            <div className="relative z-10 mx-auto mb-2 w-24 h-24 rounded-full bg-[rgba(28,151,112,0.08)] border border-[rgba(28,151,112,0.14)] flex items-center justify-center">
              <img
                src={flux}
                alt="Flux"
                className="w-20 h-20 object-contain"
              />
            </div>

            <p className="relative z-10 uppercase tracking-[1.8px] text-[#6B7685] text-[11px] font-bold mb-1">
              Streak protegido pelo Flux
            </p>
            <h2 className="relative z-10 text-[#1c9770] text-[48px] leading-none font-bold">
              {streakDias}
            </h2>
            <p className="relative z-10 uppercase tracking-[1.4px] text-[#1A202C] text-[12px] font-bold mb-2">
              dias consecutivos
            </p>
            <p className="relative z-10 text-[#6B7685] text-[13px] mb-3">
              Chama no auge. Nao deixe o Flux apagar hoje!
            </p>

            <div className="relative z-10 flex justify-center gap-2">
              {diasFlux.map((dia, index) => {
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
        </section>

        <section className="mb-4">
          <div className="grid grid-cols-5 gap-3 justify-center">
            {quickMenuItems.map(({ id, label, icon: Icon, path, iconColor, bgColor }) => (
              <div
                key={id}
                className="flex flex-col items-center gap-2 cursor-pointer"
                onClick={() => navigate(path)}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgColor}`}>
                  <Icon size={30} color={iconColor} />
                </div>
                <span className="text-[#6B7685] text-[12px] font-medium text-center">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-4">
          <div
            className="rounded-xl p-3 flex items-center justify-between bg-gradient-primary shadow-brand-primary cursor-pointer"
            onClick={() => navigate('/scan')}
          >
            <div>
              <p className="font-bold text-white text-[14px]">Scan Diário</p>
              <p className="text-white opacity-75 text-[12px]">
                Realize o scan e ganhe uma caixa surpresa
              </p>
            </div>
            <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/25">
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
                className="bg-white rounded-xl p-3 flex items-center gap-3 border border-[#E4E7EB] shadow-brand-card"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[rgba(28,151,112,0.1)]">
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
                  className={`text-left bg-white rounded-xl p-3 border border-[#E4E7EB] shadow-brand-card ${
                    resgatado || resgatando ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  disabled={resgatado || resgatando}
                  onClick={() => resgatarBeneficio({ id, titulo, parceiro, custoTrofeus })}
                >
                  <div className="w-9 h-9 rounded-xl mb-2 bg-[rgba(28,151,112,0.1)] flex items-center justify-center">
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
            className="rounded-xl p-3 flex items-center justify-between bg-gradient-accent1 shadow-brand-primary cursor-pointer"
            onClick={() => navigate('/mind')}
          >
            <div>
              <p className="font-bold text-white text-[14px]">Mind+</p>
              <p className="text-white opacity-75 text-[12px]">
                Apoio psicológico a qualquer hora e lugar
              </p>
            </div>
            <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/25">
              <FiHeart size={20} color="#fff" />
            </div>
          </div>
        </section>

        <section className="mb-4">
          <div
            className="rounded-xl p-3 flex items-center justify-between bg-gradient-accent2 shadow-brand-primary cursor-pointer"
            onClick={() => navigate('/connect')}
          >
            <div>
              <p className="font-bold text-white text-[14px]">Connect+</p>
              <p className="text-white opacity-75 text-[12px]">
                Sono, batimentos e metas num só lugar
              </p>
            </div>
            <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/25">
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
            className="bg-white rounded-xl p-3 border border-[#E4E7EB] shadow-brand-card cursor-pointer"
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
