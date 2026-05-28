import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiArrowRight, FiLock } from 'react-icons/fi'
import TopBar from '../components/TopBar.jsx'
import BottomNav from '../components/Bottomnav.jsx'

const Beneficios = () => {
  const navigate = useNavigate()
  const points = 1500
  const categoria = 'Bronze'
  const proximaCategoria = 'Prata'

  const beneficiosAtivos = [
    { id: 1, title: '5 corridas com 10% de desconto', parceiro: 'Uber', ativo: true },
  ]

  const beneficiosDisponiveis = [
    { id: 1, title: 'Ganhe 1% de cashback no roxinho', parceiro: 'Nubank', bloqueado: false },
    { id: 2, title: 'Ganhe 3% de desconto em qualquer compra', parceiro: 'Amazon', bloqueado: false },
    { id: 3, title: 'Desconto R$3 na próxima corrida', parceiro: 'Uber', bloqueado: false },
    { id: 4, title: 'Ganhe até 10% de desconto na primeira sessão', parceiro: 'Mattos Filho', bloqueado: true },
    { id: 5, title: 'Receba até 2GB de armazenamento', parceiro: 'Google Cloud', bloqueado: true },
    { id: 6, title: 'Receba aplicativos exclusivos', parceiro: 'Meta', bloqueado: true },
  ]

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
          <h1 className="font-bold text-[20px] text-[#1A202C]">Benefícios</h1>
        </section>

        <section className="mb-4">
          <div className="bg-gradient-primary shadow-brand-primary rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white opacity-75 text-[13px] mb-1">Sua categoria</p>
                <h2 className="font-bold text-white text-[24px] mb-1">{categoria}</h2>
                <p className="text-white opacity-75 text-[12px]">
                  Próxima categoria: {proximaCategoria}
                </p>
              </div>
              <div className="bg-white/25 rounded-xl px-3 py-2">
                <span className="font-bold text-white text-[14px]">
                  {points.toLocaleString('pt-BR')} pts
                </span>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between mb-1">
                <span className="text-white opacity-75 text-[12px]">Progresso para Prata</span>
                <span className="text-white font-bold text-[12px]">60%</span>
              </div>
              <div className="rounded-full bg-white/25 h-1.5 overflow-hidden">
                <div className="bg-white rounded-full h-1.5 w-[60%]" />
              </div>
            </div>
          </div>
        </section>

        <section className="mb-4">
          <h2 className="font-bold text-[16px] text-[#1A202C] mb-3">Benefícios ativos</h2>
          <div className="flex flex-col gap-2">
            {beneficiosAtivos.map(({ id, title, parceiro, ativo }) => (
              <div key={id} className="bg-white rounded-xl border border-[#E4E7EB] shadow-brand-card p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[rgba(28,151,112,0.1)]">
                  <FiArrowRight size={18} color="#1c9770" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[14px] text-[#1A202C]">{title}</p>
                  <p className="text-[#6B7685] text-[12px]">{parceiro}</p>
                </div>
                {ativo && (
                  <span className="rounded-full text-[11px] text-white bg-[#1c9770] px-2 py-0.5 font-medium">Ativo</span>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-[16px] text-[#1A202C]">Disponíveis no nível {categoria}</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {beneficiosDisponiveis.map(({ id, title, parceiro, bloqueado }) => (
              <div key={id} className={`bg-white rounded-xl border border-[#E4E7EB] shadow-brand-card p-3 ${bloqueado ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[14px] text-[#1A202C]">{parceiro}</span>
                  {bloqueado && <FiLock size={14} color="#9BA3AE" />}
                </div>
                <p className="text-[#6B7685] text-[12px]">{title}</p>
                {bloqueado && (
                  <p className="text-[#1c9770] text-[12px] font-medium mt-1">
                    Complete missões para desbloquear
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      <BottomNav activePage="home" />
    </div>
  )
}

export default Beneficios
