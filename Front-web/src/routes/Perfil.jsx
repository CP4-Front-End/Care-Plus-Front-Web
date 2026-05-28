import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiArrowRight, FiUser, FiAward } from 'react-icons/fi'
import TopBar from '../components/TopBar.jsx'
import BottomNav from '../components/Bottomnav.jsx'

const Perfil = () => {
  const [nome, setNome] = useState('')
  const navigate = useNavigate()
  const points = 1500
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    async function carregarUsuario() {

      const carteirinha =
        localStorage.getItem("carteirinha")

      const resposta = await fetch(
        `http://127.0.0.1:8000/usuario/${carteirinha}`
      )

      const dados = await resposta.json()

      setNome(dados.nome)
    }

    carregarUsuario()


    const saved = localStorage.getItem('boostcare_user')
    if (saved) setUserData(JSON.parse(saved))
  }, [])

  const missoesDiarias = [
    { dia: 'Seg', quantidade: 7 },
    { dia: 'Ter', quantidade: 5 },
    { dia: 'Qua', quantidade: 9 },
    { dia: 'Qui', quantidade: 4 },
    { dia: 'Sex', quantidade: 8 },
  ]

  const maxMissoes = Math.max(...missoesDiarias.map(d => d.quantidade))

  const trofeus = [
    { id: 1, title: 'Campeão do Ronco', desc: 'Tenha 8 horas de sono seguidas por 3 dias.', conquistado: true },
    { id: 2, title: 'Rei das Garrafinhas', desc: 'Beba 3L de água diários por 3 dias.', conquistado: true },
    { id: 3, title: 'O Poderoso Pratão', desc: 'Tenha 3 refeições coloridas na semana.', conquistado: true },
    { id: 4, title: 'Mestre dos Passos', desc: 'Dê 10.000 passos diários contados pela pulseira.', conquistado: false },
    { id: 5, title: 'Day Off', desc: 'Tenha ao menos 1 dia de descanso por semana.', conquistado: false },
    { id: 6, title: 'ChecKing', desc: 'Faça ao menos 1 checking diário por 1 mês.', conquistado: false },
  ]

  const nivelLabel = (campo, valor) => {
    const map = {
      nivelAtividade: {
        sedentario: 'Sedentário',
        leve: 'Levemente ativo',
        moderado: 'Moderadamente ativo',
        ativo: 'Ativo',
        muito_ativo: 'Muito ativo',
      },
      qualidadeSono: {
        muito_ruim: 'Muito ruim',
        ruim: 'Ruim',
        regular: 'Regular',
        boa: 'Boa',
        excelente: 'Excelente',
      },
      nivelEnergia: {
        muito_baixo: 'Muito baixo',
        baixo: 'Baixo',
        moderado: 'Moderado',
        bom: 'Bom',
        excelente: 'Excelente',
      },
    }
    return map[campo]?.[valor] || '-'
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
          <h1 className="font-bold text-[20px] text-[#1A202C]">Perfil</h1>
        </section>

        <section className="mb-4">
          <div className="bg-white rounded-xl border border-[#E4E7EB] shadow-brand-card p-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[rgba(28,151,112,0.1)] flex items-center justify-center shrink-0">
              <FiUser size={24} color="#1c9770" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-[16px] text-[#1A202C]">{nome}</h2>
              <span className="inline-block rounded-full bg-[#1c9770] text-white px-2 py-0.5 text-[11px] font-medium">Bronze</span>
            </div>
            <div className="bg-[rgba(28,151,112,0.1)] rounded-xl px-3 py-2">
              <span className="font-bold text-[#1c9770] text-[14px]">{points.toLocaleString('pt-BR')} pts</span>
            </div>
          </div>
        </section>

        <section className="mb-4">
          <h2 className="font-bold text-[16px] text-[#1A202C] mb-3">Missões diárias</h2>
          <div className="bg-white rounded-xl border border-[#E4E7EB] shadow-brand-card p-3">
            <div className="flex justify-between items-end gap-2">
              {missoesDiarias.map(({ dia, quantidade }) => (
                <div key={dia} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-[#1c9770] font-bold text-[12px]">{quantidade}</span>
                  <div
                    className="w-full rounded bg-[#1c9770]"
                    style={{ height: `${(quantidade / maxMissoes) * 60}px` }}
                  />
                  <span className="text-[#6B7685] text-[12px]">{dia}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-[16px] text-[#1A202C]">Troféus</h2>
            <button
              className="bg-transparent border-0 p-0 text-[#1c9770] flex items-center gap-1 text-[14px] cursor-pointer"
              onClick={() => { }}
            >
              Ver todos <FiArrowRight size={13} color="#1c9770" />
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {trofeus.map(({ id, title, desc, conquistado }) => (
              <div
                key={id}
                className={`bg-white rounded-xl border border-[#E4E7EB] shadow-brand-card p-3 text-center ${!conquistado ? 'opacity-50' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${conquistado ? 'bg-[#1c9770]' : 'bg-[rgba(28,151,112,0.1)]'}`}>
                  <FiAward size={18} color={conquistado ? '#fff' : '#1c9770'} />
                </div>
                <p className="font-bold text-[12px] text-[#1A202C] mb-1">{title}</p>
                <p className="text-[#6B7685] text-[12px]">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-[16px] text-[#1A202C]">Informações pessoais</h2>
            <button
              className="bg-transparent border-0 p-0 text-[#1c9770] text-[14px] cursor-pointer"
              onClick={() => navigate('/cadastro')}
            >
              Alterar
            </button>
          </div>
          <div className="bg-white rounded-xl border border-[#E4E7EB] shadow-brand-card p-3">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[#6B7685] text-[14px]">Peso</span>
                <span className="font-bold text-[14px] text-[#1A202C]">
                  {userData?.peso ? `${userData.peso} kg` : '-'}
                </span>
              </div>
              <hr className="border-[#E4E7EB] m-0" />
              <div className="flex justify-between items-center">
                <span className="text-[#6B7685] text-[14px]">Altura</span>
                <span className="font-bold text-[14px] text-[#1A202C]">
                  {userData?.altura ? `${userData.altura} cm` : '-'}
                </span>
              </div>
              <hr className="border-[#E4E7EB] m-0" />
              <div className="flex justify-between items-center">
                <span className="text-[#6B7685] text-[14px]">Nível de atividade</span>
                <span className="font-bold text-[14px] text-[#1A202C]">
                  {nivelLabel('nivelAtividade', userData?.nivelAtividade)}
                </span>
              </div>
              <hr className="border-[#E4E7EB] m-0" />
              <div className="flex justify-between items-center">
                <span className="text-[#6B7685] text-[14px]">Qualidade do sono</span>
                <span className="font-bold text-[14px] text-[#1A202C]">
                  {nivelLabel('qualidadeSono', userData?.qualidadeSono)}
                </span>
              </div>
              <hr className="border-[#E4E7EB] m-0" />
              <div className="flex justify-between items-center">
                <span className="text-[#6B7685] text-[14px]">Nível de energia</span>
                <span className="font-bold text-[14px] text-[#1A202C]">
                  {nivelLabel('nivelEnergia', userData?.nivelEnergia)}
                </span>
              </div>
            </div>
          </div>
        </section>

      </main>

      <BottomNav activePage="home" />
    </div>
  )
}

export default Perfil
