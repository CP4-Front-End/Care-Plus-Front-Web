import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiCamera, FiGift, FiCheck } from 'react-icons/fi'
import TopBar from '../components/TopBar.jsx'
import BottomNav from '../components/Bottomnav.jsx'

const Scan = () => {
  const navigate = useNavigate()
  const points = 1500
  const [scanFeito, setScanFeito] = useState(false)
  const [mostrarRecompensa, setMostrarRecompensa] = useState(false)

  const handleScan = () => {
    setScanFeito(true)
    setTimeout(() => setMostrarRecompensa(true), 1000)
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
          <h1 className="font-bold text-[20px] text-[#1A202C]">Scan Diário</h1>
        </section>

        {!scanFeito && (
          <>
            <section className="mb-4">
              <div className="bg-gradient-primary shadow-brand-primary rounded-xl p-4 text-center">
                <div className="w-16 h-16 rounded-full bg-white/25 flex items-center justify-center mx-auto mb-3">
                  <FiCamera size={32} color="#fff" />
                </div>
                <h2 className="font-bold text-white text-[20px] mb-1">Realize seu Scan diário</h2>
                <p className="text-white opacity-75 text-[13px]">
                  Ganhe uma caixa surpresa ao completar o scan de hoje.
                </p>
              </div>
            </section>

            <section className="mb-4">
              <div className="bg-white rounded-xl border border-[#E4E7EB] shadow-brand-card p-3">
                <h2 className="font-bold text-[16px] text-[#1A202C] mb-3">Como funciona a caixa surpresa?</h2>
                <p className="text-[#6B7685] text-[14px]">
                  Todo dia ao entrar no app, você pode realizar um Scan que identifica idade da pele, rugas, olheiras e outros indicadores. Ao realizar essa mini consulta você ganha uma caixa surpresa podendo ganhar desde escudos e multiplicadores até descontos e benefícios com nossas marcas parceiras.
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
                  Continue completando missões para trocar em benefícios.
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
                  A caixa surpresa pode te dar desde multiplicadores de troféus, escudos, personalizações até cupons de desconto e benefícios em nossas empresas parceiras.
                </p>
                <button
                  className="rounded-xl py-2 px-4 font-bold text-[14px] text-white bg-[#1c9770] shadow-brand-primary inline-flex items-center gap-2 cursor-pointer"
                  onClick={() => {}}
                >
                  <FiGift size={16} color="#fff" /> Abrir caixa surpresa
                </button>
              </div>
            </section>

            <section>
              <button
                className="w-full rounded-xl py-3 font-bold text-[14px] text-[#1c9770] border border-[rgba(28,151,112,0.2)] bg-white cursor-pointer"
                onClick={() => navigate('/inicial')}
              >
                Voltar para o início
              </button>
            </section>
          </>
        )}

      </main>

      <BottomNav activePage="home" />
    </div>
  )
}

export default Scan
