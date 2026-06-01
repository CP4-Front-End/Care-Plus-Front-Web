import { FiHome, FiUsers, FiDollarSign, FiCheckSquare, FiMenu } from 'react-icons/fi'

const Bottomnav = ({ activePage = 'home' }) => {

  const navItems = [
    { id: 'home', label: 'Home', icon: FiHome },
    { id: 'rede', label: 'Rede', icon: FiUsers },
    { id: 'reembolsos', label: 'Reembolsos', icon: FiDollarSign },
    { id: 'autorizacoes', label: 'Autorizações', icon: FiCheckSquare },
    { id: 'mais', label: 'Mais', icon: FiMenu },
  ]

  return (
    <nav className="flex justify-around items-center bg-white border-t border-brand-gray py-2 fixed bottom-0 left-0 right-0 z-50">
      {navItems.map(({ id, label, icon: Icon }) => (
        <div
          key={id}
          className="flex flex-col items-center min-w-[44px]"
          style={{ color: activePage === id ? '#1c9770' : '#9BA3AE' }}
        >
          <Icon size={22} />
          <span className="text-[11px] mt-[2px]">{label}</span>
        </div>
      ))}
    </nav>
  )
}

export default Bottomnav