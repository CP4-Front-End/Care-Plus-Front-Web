import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiArrowRight, FiWifi, FiActivity, FiDroplet } from 'react-icons/fi'
import TopBar from '../components/TopBar.jsx'
import Bottomnav from '../components/Bottomnav.jsx'
import Flux from '../assets/img.png'
import FluxPC from '../assets/imgPC.png'

const Connect = () => {
  const navigate = useNavigate()
  const points = 1500

  const metaPassos = 10000
  const passosAtual = 6340
  const progressoPassos = Math.round((passosAtual / metaPassos) * 100)

  const metaAgua = 3000
  const aguaAtual = 1800
  const progressoAgua = Math.round((aguaAtual / metaAgua) * 100)

  const conquistasPassos = [
    { id: 1, title: 'Mestre dos Passos', desc: 'Dê 10.000 passos em um dia.', concluida: false },
    { id: 2, title: 'Caminhante', desc: 'Dê 5.000 passos por 3 dias seguidos.', concluida: true },
  ]

  const conquistasAgua = [
    { id: 1, title: 'Rei das Garrafinhas', desc: 'Beba 3L de água diários por 3 dias.', concluida: false },
    { id: 2, title: 'Hidratado', desc: 'Beba pelo menos 2L em um dia.', concluida: true },
  ]

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <TopBar points={points} showPoints={true} />

          
          <div className='relative w-full'>
            <img src={Flux} alt="" className='w-full block lg:hidden'/>
            <img src={FluxPC} alt="" className='w-full hidden lg:block'/>
            
                    <section className="flex items-center gap-2 mb-4 absolute bottom-[63%] md:bottom-[79%] lg:bottom-[87%] left-4 lg:left-8 z-10">
            <button
              className="bg-transparent border-0 p-0 text-[white] cursor-pointer "
              onClick={() => navigate('/inicial')}
            >
              <FiArrowLeft size={20} />
            </button>
            <h1 className="font-bold text-[20px] text-[white]">Connect+</h1>
                    </section>
          </div>
      <main className="w-full px-4 lg:px-8 pt-4 pb-24">

        <section className="mb-4">
          <div className="bg-gradient-accent2 shadow-brand-primary rounded-xl p-4 text-center">
            <div className="w-16 h-16 rounded-full bg-white/25 flex items-center justify-center mx-auto mb-3">
              <FiWifi size={32} color="#fff" />
            </div>
            <h2 className="font-bold text-white text-[20px] mb-1">Pulseira Conectada</h2>
            <p className="text-white opacity-75 text-[13px]">
              Acompanhe seus passos e hidratação em tempo real.
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

          <section>
            <h2 className="font-bold text-[16px] text-[#1A202C] mb-3">Passos de hoje</h2>
            <div className="bg-white rounded-xl border border-[#E4E7EB] shadow-brand-card p-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-[rgba(28,151,112,0.1)]">
                  <FiActivity size={22} color="#1c9770" />
                </div>
                <div className="flex-1">
                  <p className="text-[#6B7685] text-[12px]">Passos registrados</p>
                  <h3 className="font-bold text-[24px] text-[#1A202C]">
                    {passosAtual.toLocaleString('pt-BR')}
                    <span className="text-[#6B7685] text-[14px] font-medium"> / {metaPassos.toLocaleString('pt-BR')}</span>
                  </h3>
                </div>
                <span className="font-bold text-[#1c9770] text-[14px]">{progressoPassos}%</span>
              </div>
              <div className="rounded-full bg-[#E4E7EB] h-2 overflow-hidden">
                <div
                  className="bg-[#1c9770] rounded-full h-2"
                  style={{ width: `${progressoPassos}%` }}
                />
              </div>
              <p className="text-[#6B7685] text-[12px] mt-2">
                Faltam {(metaPassos - passosAtual).toLocaleString('pt-BR')} passos para sua meta diária.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-bold text-[16px] text-[#1A202C] mb-3">Hidratação de hoje</h2>
            <div className="bg-white rounded-xl border border-[#E4E7EB] shadow-brand-card p-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-[rgba(122,209,195,0.15)]">
                  <FiDroplet size={22} color="#7AD1C3" />
                </div>
                <div className="flex-1">
                  <p className="text-[#6B7685] text-[12px]">Água consumida</p>
                  <h3 className="font-bold text-[24px] text-[#1A202C]">
                    {aguaAtual}ml
                    <span className="text-[#6B7685] text-[14px] font-medium"> / {metaAgua}ml</span>
                  </h3>
                </div>
                <span className="font-bold text-[#1c9770] text-[14px]">{progressoAgua}%</span>
              </div>
              <div className="rounded-full bg-[#E4E7EB] h-2 overflow-hidden">
                <div
                  className="bg-[#7AD1C3] rounded-full h-2"
                  style={{ width: `${progressoAgua}%` }}
                />
              </div>
              <p className="text-[#6B7685] text-[12px] mt-2">
                Faltam {metaAgua - aguaAtual}ml para atingir sua meta diária.
              </p>
            </div>
          </section>

        </div>

        <section className="mb-4">
          <h2 className="font-bold text-[16px] text-[#1A202C] mb-3">Conquistas</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {[...conquistasPassos, ...conquistasAgua].map(({ id, title, desc, concluida }) => (
              <div
                key={`${title}-${id}`}
                className={`bg-white rounded-xl border shadow-brand-card p-3 flex items-center gap-3 ${concluida ? 'ranking-item-highlight' : 'border-[#E4E7EB]'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${concluida ? 'bg-[#1c9770]' : 'bg-[rgba(28,151,112,0.1)]'}`}>
                  <FiActivity size={18} color={concluida ? '#fff' : '#1c9770'} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[14px] text-[#1A202C]">{title}</p>
                  <p className="text-[#6B7685] text-[12px]">{desc}</p>
                </div>
                {concluida
                  ? <span className="rounded-full bg-[#1c9770] text-white px-2 py-0.5 text-[11px] font-medium">Concluída</span>
                  : <span className="rounded-full bg-[#E4E7EB] text-[#6B7685] px-2 py-0.5 text-[11px] font-medium">Pendente</span>
                }
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="rounded-xl p-3 border border-[rgba(28,151,112,0.2)] bg-[rgba(28,151,112,0.07)] flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-[12px] text-[#1c9770]">Em breve</p>
              <p className="text-[#6B7685] text-[12px]">
                Novas leituras da pulseira a caminho: frequência cardíaca, sono e muito mais.
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
