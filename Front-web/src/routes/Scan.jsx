import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiArrowLeft,
  FiCamera,
  FiCheck,
  FiClock,
  FiGift,
  FiShield,
  FiSkipForward,
  FiX,
  FiZap,
} from 'react-icons/fi'
import TopBar from '../components/TopBar.jsx'
import Bottomnav from '../components/Bottomnav.jsx'

const RECOMPENSAS_VISUAIS = [
  {
    tipo: 'escudo',
    titulo: 'Escudo de streak',
    descricao: 'Protecao visual para manter seu streak seguro por um dia.',
    destaque: '1 escudo',
  },
  {
    tipo: 'multiplicador',
    titulo: 'Multiplicador de missoes',
    descricao: 'Bonus visual de uma hora para turbinar suas missoes.',
    destaque: '2x por 1 hora',
  },
  {
    tipo: 'skip',
    titulo: 'Skip de missao',
    descricao: 'Passe visual para pular uma missao quando quiser.',
    destaque: '1 skip',
  },
]

function dataHoje() {
  const hoje = new Date()

  return [
    hoje.getFullYear(),
    String(hoje.getMonth() + 1).padStart(2, '0'),
    String(hoje.getDate()).padStart(2, '0'),
  ].join('-')
}

function chaveScanDiario() {
  const carteirinha = localStorage.getItem('carteirinha') || 'visitante'

  return `scanDiario:${carteirinha}:${dataHoje()}`
}

function carregarScanDiarioSalvo() {
  const estadoInicial = {
    scanFeito: false,
    mostrarRecompensa: false,
    caixaAberta: false,
    recompensa: null,
  }
  const scanSalvo = localStorage.getItem(chaveScanDiario())

  if (!scanSalvo) return estadoInicial

  try {
    const dados = JSON.parse(scanSalvo)

    return {
      scanFeito: Boolean(dados.scanFeito),
      mostrarRecompensa: Boolean(dados.scanFeito),
      caixaAberta: Boolean(dados.caixaAberta),
      recompensa: dados.recompensa || null,
    }
  } catch {
    localStorage.removeItem(chaveScanDiario())
    return estadoInicial
  }
}

function sortearRecompensa() {
  const recompensaTrofeus = {
    tipo: 'trofeus',
    titulo: 'Trofeus surpresa',
    descricao: 'Trofeus visuais recebidos na caixa surpresa de hoje.',
    destaque: `+${Math.floor(Math.random() * 11) + 20} trofeus`,
  }
  const recompensas = [recompensaTrofeus, ...RECOMPENSAS_VISUAIS]

  return recompensas[Math.floor(Math.random() * recompensas.length)]
}

function IconeRecompensa({ tipo, size = 34, color = '#1c9770' }) {
  if (tipo === 'escudo') return <FiShield size={size} color={color} />
  if (tipo === 'multiplicador') return <FiClock size={size} color={color} />
  if (tipo === 'skip') return <FiSkipForward size={size} color={color} />
  if (tipo === 'trofeus') return <FiZap size={size} color={color} />

  return <FiGift size={size} color={color} />
}

const Scan = () => {
  const navigate = useNavigate()
  const points = 1500
  const [scanDiario, setScanDiario] = useState(carregarScanDiarioSalvo)
  const [modalAberto, setModalAberto] = useState(false)
  const { scanFeito, mostrarRecompensa, caixaAberta, recompensa } = scanDiario

  const handleScan = () => {
    if (scanFeito) return

    setScanDiario({
      scanFeito: true,
      mostrarRecompensa: false,
      caixaAberta: false,
      recompensa: null,
    })
    localStorage.setItem(
      chaveScanDiario(),
      JSON.stringify({
        scanFeito: true,
        caixaAberta: false,
        recompensa: null,
      })
    )

    setTimeout(() => {
      setScanDiario((estadoAtual) => ({
        ...estadoAtual,
        mostrarRecompensa: true,
      }))
    }, 1000)
  }

  const abrirCaixaSurpresa = () => {
    if (caixaAberta) {
      setModalAberto(true)
      return
    }

    const premio = sortearRecompensa()

    setScanDiario({
      scanFeito: true,
      mostrarRecompensa: true,
      caixaAberta: true,
      recompensa: premio,
    })
    setModalAberto(true)
    localStorage.setItem(
      chaveScanDiario(),
      JSON.stringify({
        scanFeito: true,
        caixaAberta: true,
        recompensa: premio,
      })
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <TopBar points={points} showPoints={true} />

      <main className="w-full px-4 lg:px-8 pt-4 pb-24">

        <section className="flex items-center gap-2 mb-4">
          <button
            className="bg-transparent border-0 p-0 text-[#6B7685] cursor-pointer"
            onClick={() => navigate('/inicial')}
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-[20px] text-[#1A202C]">Scan Diario</h1>
        </section>

        {!scanFeito && (
          <>
            <section className="mb-4">
              <div className="bg-gradient-primary shadow-brand-primary rounded-xl p-4 text-center">
                <div className="w-16 h-16 rounded-full bg-white/25 flex items-center justify-center mx-auto mb-3">
                  <FiCamera size={32} color="#fff" />
                </div>
                <h2 className="font-bold text-white text-[20px] mb-1">Realize seu Scan diario</h2>
                <p className="text-white opacity-75 text-[13px]">
                  Ganhe uma caixa surpresa ao completar o scan de hoje.
                </p>
              </div>
            </section>

            <section className="mb-4">
              <div className="bg-white rounded-xl border border-[#E4E7EB] shadow-brand-card p-3">
                <h2 className="font-bold text-[16px] text-[#1A202C] mb-3">Como funciona a caixa surpresa?</h2>
                <p className="text-[#6B7685] text-[14px]">
                  Todo dia ao entrar no app, voce pode realizar um Scan que identifica idade da pele, rugas, olheiras e outros indicadores. Ao realizar essa mini consulta voce ganha uma caixa surpresa podendo ganhar desde escudos e multiplicadores ate descontos e beneficios com nossas marcas parceiras.
                </p>
              </div>
            </section>

            <section>
              <button
                className="w-full rounded-xl py-3 font-bold text-[14px] text-white bg-gradient-primary shadow-brand-primary flex items-center justify-center gap-2 cursor-pointer"
                onClick={handleScan}
              >
                <FiCamera size={18} color="#fff" /> Realizar Scan
              </button>
            </section>
          </>
        )}

        {scanFeito && !mostrarRecompensa && (
          <section className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[rgba(28,151,112,0.1)] flex items-center justify-center mx-auto mb-3">
              <FiCamera size={32} color="#1c9770" />
            </div>
            <p className="font-bold text-[16px] text-[#1A202C] mb-1">Analisando...</p>
            <p className="text-[#6B7685] text-[14px]">Aguarde enquanto processamos seu scan.</p>
          </section>
        )}

        {mostrarRecompensa && (
          <>
            <section className="mb-4">
              <div className="bg-gradient-primary shadow-brand-primary rounded-xl p-4 text-center">
                <div className="w-16 h-16 rounded-full bg-white/25 flex items-center justify-center mx-auto mb-3">
                  <FiCheck size={32} color="#fff" />
                </div>
                <h2 className="font-bold text-white text-[20px] mb-1">Scan realizado!</h2>
                <p className="text-white opacity-75 text-[13px]">
                  Sua caixa surpresa diaria ja esta liberada.
                </p>
              </div>
            </section>

            <section className="mb-4">
              <div className="bg-white rounded-xl border border-[#E4E7EB] shadow-brand-card p-4 text-center">
                <div className="w-16 h-16 rounded-full bg-[rgba(28,151,112,0.1)] flex items-center justify-center mx-auto mb-3">
                  <FiGift size={32} color="#1c9770" />
                </div>
                <h2 className="font-bold text-[16px] text-[#1A202C] mb-1">Sua recompensa</h2>
                <p className="text-[#6B7685] text-[14px] mb-3">
                  A caixa surpresa pode liberar trofeus, escudos, multiplicadores ou um skip de missao. Por enquanto os premios sao apenas visuais.
                </p>
                <button
                  className={`rounded-xl py-2 px-4 font-bold text-[14px] text-white shadow-brand-primary inline-flex items-center gap-2 ${
                    caixaAberta
                      ? 'bg-[#93CB52] cursor-pointer'
                      : 'bg-[#1c9770] cursor-pointer'
                  }`}
                  onClick={abrirCaixaSurpresa}
                >
                  <FiGift size={16} color="#fff" />
                  {caixaAberta ? 'Ver prêmio de hoje' : 'Abrir caixa surpresa'}
                </button>
              </div>
            </section>

            <section>
              <button
                className="w-full rounded-xl py-3 font-bold text-[14px] text-[#1c9770] border border-[rgba(28,151,112,0.2)] bg-white cursor-pointer"
                onClick={() => navigate('/inicial')}
              >
                Voltar para o inicio
              </button>
            </section>
          </>
        )}

      </main>

      {modalAberto && recompensa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="relative w-full max-w-[360px] rounded-2xl bg-white p-5 text-center shadow-[0_18px_45px_rgba(26,32,44,0.18)]">
            <button
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-[#F4F6F8] text-[#6B7685] flex items-center justify-center"
              onClick={() => setModalAberto(false)}
            >
              <FiX size={18} />
            </button>

            <div className="w-20 h-20 rounded-full bg-[rgba(28,151,112,0.1)] flex items-center justify-center mx-auto mb-4">
              <IconeRecompensa tipo={recompensa.tipo} size={38} />
            </div>

            <p className="uppercase tracking-[1px] text-[#6B7685] text-[11px] font-bold mb-1">
              Caixa surpresa
            </p>
            <h2 className="font-bold text-[20px] text-[#1A202C] mb-2">
              {recompensa.titulo}
            </h2>
            <p className="inline-block rounded-full bg-[#1c9770] px-4 py-1.5 text-white text-[15px] font-bold mb-3">
              {recompensa.destaque}
            </p>
            <p className="text-[#6B7685] text-[14px] mb-5">
              {recompensa.descricao}
            </p>

            <button
              className="w-full rounded-xl py-3 font-bold text-[14px] text-white bg-gradient-primary shadow-brand-primary"
              onClick={() => setModalAberto(false)}
            >
              Guardar prêmio
            </button>
          </div>
        </div>
      )}

      <Bottomnav activePage="home" />
    </div>
  )
}

export default Scan
