import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiZap, FiTrendingUp, FiStar, FiAward } from 'react-icons/fi'
import TopBar from '../components/TopBar.jsx'
import Bottomnav from '../components/Bottomnav.jsx'
import flux from '../assets/flux.png'

const Impulso = () => {
  const navigate = useNavigate()
  const points = 1500
  const streakDias = 7

  const comoFunciona = [
    { id: 1, icon: FiZap, title: 'Acesse diariamente', desc: 'Entre no app todos os dias para manter seu streak ativo.' },
    { id: 2, icon: FiTrendingUp, title: 'Complete missões', desc: 'Conclua missões diárias para evoluir seu Flux e subir de nível.' },
    { id: 3, icon: FiStar, title: 'Ganhe recompensas', desc: 'Quanto maior seu streak, melhores as recompensas desbloqueadas.' },
    { id: 4, icon: FiAward, title: 'Suba de nível', desc: 'Evolua sua conta e desbloqueie benefícios exclusivos.' },
  ]

  return (
    <div className="min-vh-100 bg-body">
      <TopBar points={points} showPoints={true} />

      <main className="container py-3 pb-5 mb-4">

        <section className="d-flex align-items-center gap-2 mb-4">
          <button
            className="btn btn-link p-0 text-decoration-none text-muted"
            onClick={() => navigate('/missoes')}
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="fw-bold mb-0 fs-5 text-dark-custom">Impulso+</h1>
        </section>

        <section className="mb-4">
          <div className="bg-gradient-primary shadow-primary rounded-3 p-4 text-center">
            <img
              src={flux}
              alt="Flux"
              className="avatar-xl rounded-circle"
              style={{ objectFit: 'contain' }}
            />
            <h2 className="fw-bold text-white fs-4 mb-1">Flux</h2>
            <p className="text-white opacity-75 small mb-3">Seu amigo de streak</p>
            <div className="d-inline-flex align-items-center gap-2 bg-white bg-opacity-25 rounded-pill px-3 py-2">
              <FiZap size={16} color="#fff" />
              <span className="fw-bold text-white fs-7">{streakDias} dias de streak</span>
            </div>
          </div>
        </section>

        <section className="mb-4">
          <div className="bg-white rounded-3 border shadow-card p-3 text-center">
            <p className="text-muted-custom fs-7 mb-1">Próxima recompensa em</p>
            <span className="fw-bold text-primary fs-5">2 dias</span>
          </div>
        </section>

        <section className="mb-4">
          <h2 className="fw-bold fs-6 text-dark-custom mb-3">Como funciona o Flux</h2>
          <div className="d-flex flex-column gap-2">
            {comoFunciona.map(({ id, icon: Icon, title, desc }) => (
              <div key={id} className="bg-white rounded-3 border shadow-card p-3 d-flex align-items-center gap-3">
                <div className="icon-box-sm rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 bg-primary-subtle-custom">
                  <Icon size={18} color="#1c9770" />
                </div>
                <div>
                  <p className="fw-bold mb-0 fs-7 text-dark-custom">{title}</p>
                  <p className="mb-0 text-muted fs-9">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="bg-white rounded-3 border shadow-card p-3">
            <h2 className="fw-bold fs-6 text-dark-custom mb-3">Seu progresso semanal</h2>
            <div className="d-flex justify-content-between align-items-end gap-2">
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((dia, index) => (
                <div key={dia} className="d-flex flex-column align-items-center gap-1 flex-fill">
                  <div
                    className={`w-100 rounded-2 ${index < streakDias ? 'bg-primary bar-active' : 'bg-primary-subtle-custom bar-inactive'}`}
                  />
                  <span className="fs-9 text-muted">{dia}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Bottomnav activePage="home" />
    </div>
  )
}

export default Impulso