import { useNavigate } from 'react-router-dom'
import { FiShield, FiCheck, FiX } from 'react-icons/fi'
import TopBar from '../components/TopBar.jsx'

const LGPD = () => {
  const navigate = useNavigate()

  const dataCollected = [
    'Passos, distância e calorias',
    'Horas de sono',
    'Hidratação',
    'BPM e dados do smartwatch',
    'Informações do Scan diário (pele e sinais faciais)',
  ]

  const dataUsage = [
    'Criar missões e desafios personalizados',
    'Liberar pontos, troféus e recompensas',
    'Gerar recomendações personalizadas',
    'Oferecer suporte no Mind+',
    'Melhorar sua experiência no app',
  ]

  const userControls = [
    'Permitir dados de atividade',
    'Permitir dados de sono',
    'Permitir BPM/smartwatch',
    'Participar do ranking (opt-in)',
    'Receber notificações',
    'Revogar tudo a qualquer momento',
  ]

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <TopBar showPoints={false} />

      <main className="w-full px-4 lg:px-8 pt-4 pb-10">

        
        <section className="text-center mb-4">
          <div className="inline-flex items-center justify-center rounded-full w-16 h-16 bg-[rgba(28,151,112,0.1)] mb-3">
            <FiShield size={32} color="#1c9770" />
          </div>
          <h1 className="font-bold text-[22px] text-[#1A202C] mb-1">
            Termo de Consentimento
          </h1>
          <p className="text-[#6B7685] text-[14px]">
            Na Care Plus levamos a sério o tratamento de dados dos nossos usuários.
          </p>
        </section>

        
        <section className="rounded-xl p-3 mb-3 bg-[rgba(28,151,112,0.07)] border border-[rgba(28,151,112,0.2)]">
          <p className="text-[14px] text-[#1A202C] leading-[1.6]">
            Para personalizar missões, acompanhar seu progresso e liberar recompensas,
            precisamos acessar algumas informações de saúde. Tudo é tratado com
            segurança, transparência e apenas para fins de bem-estar.
          </p>
        </section>

      
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">

          
          <section className="bg-white rounded-xl p-3 border border-[#E4E7EB]">
            <h2 className="font-bold text-[15px] text-[#1A202C] mb-3">O que coletamos</h2>
            <div className="flex flex-col gap-2">
              {dataCollected.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex items-center justify-center rounded-full w-[22px] h-[22px] bg-[rgba(28,151,112,0.1)] shrink-0">
                    <FiCheck size={12} color="#1c9770" />
                  </div>
                  <span className="text-[13px] text-[#4A5568]">{item}</span>
                </div>
              ))}
            </div>
          </section>

          
          <section className="bg-white rounded-xl p-3 border border-[#E4E7EB]">
            <h2 className="font-bold text-[15px] text-[#1A202C] mb-3">Para que usamos</h2>
            <div className="flex flex-col gap-2">
              {dataUsage.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex items-center justify-center rounded-full w-[22px] h-[22px] bg-[rgba(147,203,82,0.15)] shrink-0">
                    <FiCheck size={12} color="#93CB52" />
                  </div>
                  <span className="text-[13px] text-[#4A5568]">{item}</span>
                </div>
              ))}
            </div>
          </section>

          
          <section className="bg-white rounded-xl p-3 border border-[#E4E7EB]">
            <h2 className="font-bold text-[15px] text-[#1A202C] mb-3">Você decide</h2>
            <div className="flex flex-col gap-2">
              {userControls.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex items-center justify-center rounded-full w-[22px] h-[22px] bg-[rgba(122,209,195,0.2)] shrink-0">
                    <FiCheck size={12} color="#7AD1C3" />
                  </div>
                  <span className="text-[13px] text-[#4A5568]">{item}</span>
                </div>
              ))}
            </div>
          </section>

        </div>

        
        <section className="text-center mb-4">
          <span className="inline-block px-3 py-1 rounded-full font-medium text-[13px] bg-[rgba(28,151,112,0.1)] text-[#1c9770]">
            Seus dados estão protegidos pela LGPD
          </span>
        </section>

        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:max-w-lg lg:mx-auto">
          <button
            className="w-full font-bold rounded-xl py-3 flex items-center justify-center gap-2 text-[15px] text-[#6B7685] bg-white border-2 border-[#E4E7EB] cursor-pointer"
            onClick={() => navigate('/')}
          >
            <FiX size={18} /> Discordo
          </button>
          <button
            className="w-full font-bold rounded-xl py-3 flex items-center justify-center gap-2 text-[15px] text-white bg-[#1c9770] shadow-[0_4px_12px_rgba(28,151,112,0.3)] cursor-pointer"
            onClick={() => navigate('/Onboarding')}
          >
            <FiCheck size={18} /> Concordo
          </button>
        </div>

      </main>
    </div>
  )
}

export default LGPD