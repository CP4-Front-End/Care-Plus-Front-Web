import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowRight, FiArrowLeft, FiUser, FiActivity } from 'react-icons/fi'
import TopBar from '../components/TopBar.jsx'



const Cadastro = () => {
  const navigate = useNavigate()
  const [nome, setNome] = useState('')

  const [formData, setFormData] = useState({
    nome: '',
    carteirinha: '',
    peso: '',
    altura: '',

    atividadeFisica: '',
    tempoSentado: '',
    distanciaDia: '',
    agua: '',
    sono: '',
    celular: '',
    pausas: '',
    cafeina: '',
    arLivre: '',
    refeicoes: '',
  })

  const [step, setStep] = useState(1)

  const perguntas = [
    {
      field: "atividadeFisica",
      pergunta: "Quantos dias por semana você pratica atividade física?",
      opcoes: [
        { value: "0", label: "0 dias" },
        { value: "1_2", label: "1 a 2 dias" },
        { value: "3_4", label: "3 a 4 dias" },
        { value: "5_7", label: "5 a 7 dias" },
      ]
    },

    {
      field: "tempoSentado",
      pergunta: "Quantos minutos você passa sentado por dia?",
      opcoes: [
        { value: "menos_2h", label: "Menos de 2h" },
        { value: "2_5h", label: "2 a 5h" },
        { value: "5_8h", label: "5 a 8h" },
        { value: "mais_8h", label: "Mais de 8h" },
      ]
    },

    {
      field: "distanciaDia",
      pergunta: "Qual a distância média que você percorre por dia?",
      opcoes: [
        { value: "menos_1", label: "Menos de 1km" },
        { value: "1_3", label: "1 a 3km" },
        { value: "3_6", label: "3 a 6km" },
        { value: "mais_6", label: "Mais de 6km" },
      ]
    },

    {
      field: "agua",
      pergunta: "Quantos litros de água você bebe por dia?",
      opcoes: [
        { value: "menos_1", label: "Menos de 1L" },
        { value: "1_2", label: "1 a 2L" },
        { value: "2_3", label: "2 a 3L" },
        { value: "mais_3", label: "Mais de 3L" },
      ]
    },

    {
      field: "sono",
      pergunta: "Quantas horas você dorme por noite?",
      opcoes: [
        { value: "menos_5", label: "Menos de 5h" },
        { value: "5_7", label: "5 a 7h" },
        { value: "7_9", label: "7 a 9h" },
        { value: "mais_9", label: "Mais de 9h" },
      ]
    },

    {
      field: "celular",
      pergunta: "Quantas horas por dia você passa no celular?",
      opcoes: [
        { value: "menos_2", label: "Menos de 2h" },
        { value: "2_5", label: "2 a 5h" },
        { value: "5_8", label: "5 a 8h" },
        { value: "mais_8", label: "Mais de 8h" },
      ]
    },

    {
      field: "pausas",
      pergunta: "Quantas pausas você faz durante o dia?",
      opcoes: [
        { value: "0", label: "Nenhuma" },
        { value: "1_3", label: "1 a 3 pausas" },
        { value: "4_6", label: "4 a 6 pausas" },
        { value: "mais_6", label: "Mais de 6 pausas" },
      ]
    },

    {
      field: "cafeina",
      pergunta: "Quantos copos de cafeína você consome por dia?",
      opcoes: [
        { value: "0", label: "Nenhum" },
        { value: "1_2", label: "1 a 2 copos" },
        { value: "3_5", label: "3 a 5 copos" },
        { value: "mais_5", label: "Mais de 5 copos" },
      ]
    },

    {
      field: "arLivre",
      pergunta: "Quantos minutos por dia você passa ao ar livre?",
      opcoes: [
        { value: "0_15", label: "0 a 15 min" },
        { value: "15_30", label: "15 a 30 min" },
        { value: "30_60", label: "30 a 60 min" },
        { value: "mais_60", label: "Mais de 60 min" },
      ]
    },

    {
      field: "refeicoes",
      pergunta: "Quantas refeições você faz por dia?",
      opcoes: [
        { value: "1_2", label: "1 a 2 refeições" },
        { value: "3", label: "3 refeições" },
        { value: "4_5", label: "4 a 5 refeições" },
        { value: "mais_5", label: "Mais de 5 refeições" },
      ]
    },
  ]

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAvancar = () => {
    const dadosPasso1 = {
      peso: formData.peso,
      altura: formData.altura,
    }
    localStorage.setItem(
  "carteirinha",
  formData.carteirinha
)

localStorage.setItem("trofeus", 0)

window.dispatchEvent(
  new Event("trofeusAtualizados")

)
setStep(2)
  }

  const handleSubmit = async () => {
    const dadosFinais = {
      nome: formData.nome,
      carteirinha: formData.carteirinha,
      peso: formData.peso,
      altura: formData.altura,

      atividadeFisica: formData.atividadeFisica,
      tempoSentado: formData.tempoSentado,
      distanciaDia: formData.distanciaDia,
      agua: formData.agua,
      sono: formData.sono,
      celular: formData.celular,
      pausas: formData.pausas,
      cafeina: formData.cafeina,
      arLivre: formData.arLivre,
      refeicoes: formData.refeicoes,

    }
    const resposta = await fetch(
      "http://127.0.0.1:8000/cadastro",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(dadosFinais),
      }
    )

    const dados = await resposta.json()

    console.log(dados)

    localStorage.setItem(
      "carteirinha",
      formData.carteirinha
    )
    navigate('/inicial')
  }

  const isStep1Valid =
    formData.nome !== '' &&
    formData.carteirinha !== '' &&
    formData.peso !== '' &&
    formData.altura !== ''
  const isStep2Valid = perguntas.every(
    pergunta => formData[pergunta.field] !== ''
  )

  const RadioCard = ({ field, value, label, desc }) => {
    const selected = formData[field] === value
    return (
      <div
        className={`rounded-xl p-3 mb-2 flex items-center gap-3 cursor-pointer border-2 ${selected ? 'border-[#1c9770] bg-[rgba(28,151,112,0.05)]' : 'border-[#E4E7EB] bg-white'}`}
        onClick={() => handleChange(field, value)}
      >
        <div
          className={`rounded-full shrink-0 flex items-center justify-center w-5 h-5 border-2 ${selected ? 'bg-[#1c9770] border-[#1c9770]' : 'bg-white border-[#CDD3DA]'}`}
        >
          {selected && <div className="rounded-full bg-white w-2 h-2" />}
        </div>
        <div>
          <p className="font-bold text-[14px] text-[#1A202C]">{label}</p>
          <p className="text-[12px] text-[#6B7685]">{desc}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <TopBar showPoints={false} />
      <main className="w-full px-4 lg:px-8 pt-4 pb-10">
        <div className="flex justify-center">
          <div className="w-full lg:max-w-lg">

            <section className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <button
                  className="bg-transparent border-0 p-0 text-[#6B7685] flex items-center cursor-pointer"
                  onClick={() => step === 1 ? navigate('/onboarding') : setStep(1)}
                >
                  <FiArrowLeft size={20} />
                </button>
                <p className="text-[#6B7685] text-[14px]">Passo {step} de 2</p>
              </div>
              <h1 className="font-bold text-[20px] text-[#1A202C] mb-1">
                {step === 1 ? 'Suas medidas' : 'Seus hábitos'}
              </h1>
              <p className="text-[#6B7685] text-[14px]">
                Essas informações geram missões personalizadas. Seus dados não serão compartilhados.
              </p>
            </section>

            <div className="mb-4 rounded-full overflow-hidden h-2 bg-[#E4E7EB]">
              <div
                className={`rounded-full bg-[#1c9770] h-2 transition-[width] duration-[400ms] ease-out ${step === 1 ? 'w-1/2' : 'w-full'}`}
              />
            </div>

            {step === 1 && (
              <section>
                <div className="flex items-center gap-3 rounded-xl p-3 mb-4 bg-[rgba(28,151,112,0.07)] border border-[rgba(28,151,112,0.2)]">
                  <FiUser size={20} color="#1c9770" />
                  <p className="text-[14px] text-[#1A202C]">
                    As informações podem ser alteradas a qualquer momento na aba Perfil.
                  </p>
                </div>

                <div className="mb-3">
                  <label className="font-bold mb-2 block text-[14px] text-[#1A202C]">
                    Nome
                  </label>

                  <input
                    type="text"
                    className="w-full rounded-xl py-3 bg-white px-3 border text-[14px] border-[#E4E7EB] outline-none focus:border-[#1c9770]"
                    placeholder="Digite seu nome"
                    value={formData.nome}
                    onChange={(e) => {
                      const apenasLetras = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')
                      handleChange('nome', apenasLetras)
                    }}
                  />
                </div>

                <div className="mb-3">
                  <label className="font-bold mb-2 block text-[14px] text-[#1A202C]">
                    Carteirinha
                  </label>

                  <input
                    type="number"
                    className="w-full rounded-xl appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-white py-3 px-3 border text-[14px] border-[#E4E7EB] outline-none focus:border-[#1c9770] "
                    placeholder="Ex: 000000"
                    value={formData.carteirinha}
                    onChange={e => handleChange('carteirinha', e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="font-bold mb-2 block text-[14px] text-[#1A202C]">Peso (kg)</label>
                  <input
                    type="number"
                    className="w-full rounded-xl py-3 px-3 border border-[#E4E7EB] text-[14px] text-[#1A202C] bg-white outline-none focus:border-[#1c9770]"
                    placeholder="Ex: 70"
                    value={formData.peso}
                    onChange={e => handleChange('peso', e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="font-bold mb-2 block text-[14px] text-[#1A202C]">Altura (cm)</label>
                  <input
                    type="number"
                    className="w-full rounded-xl py-3 px-3 border border-[#E4E7EB] text-[14px] text-[#1A202C] bg-white outline-none focus:border-[#1c9770]"
                    placeholder="Ex: 175"
                    value={formData.altura}
                    onChange={e => handleChange('altura', e.target.value)}
                  />
                </div>

                <button
                  className={`w-full font-bold rounded-xl py-3 flex items-center justify-center gap-2 text-white text-[14px] cursor-pointer ${isStep1Valid ? 'bg-[#1c9770] shadow-brand-primary' : 'bg-[#CDD3DA] cursor-not-allowed'}`}
                  onClick={() => isStep1Valid && handleAvancar()}
                  disabled={!isStep1Valid}
                >
                  Continuar <FiArrowRight size={18} color="#fff" />
                </button>
              </section>
            )}

            {step === 2 && (
              <section>

                {perguntas.map((pergunta) => (
                  <div className="mb-4" key={pergunta.field}>

                    <h2 className="font-bold mb-3 text-[14px] text-[#1A202C]">
                      {pergunta.pergunta}
                    </h2>

                    {pergunta.opcoes.map(({ value, label }) => (
                      <RadioCard
                        key={value}
                        field={pergunta.field}
                        value={value}
                        label={label}
                        desc=""
                      />
                    ))}

                  </div>
                ))}

                <button
                  className={`w-full font-bold rounded-xl py-3 flex items-center justify-center gap-2 text-white text-[14px] cursor-pointer ${isStep2Valid
                    ? 'bg-[#1c9770] shadow-brand-primary'
                    : 'bg-[#CDD3DA] cursor-not-allowed'
                    }`}
                  onClick={() => isStep2Valid && handleSubmit()}
                  disabled={!isStep2Valid}
                >
                  Começar minha jornada
                  <FiArrowRight size={18} color="#fff" />
                </button>

              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Cadastro
