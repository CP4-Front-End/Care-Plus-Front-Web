import { FiBell } from 'react-icons/fi'
import { FaTrophy } from 'react-icons/fa';
import { useEffect, useState } from 'react'

const TopBar = ({ showPoints = true }) => {

  const [points, setPoints] = useState(0)

  useEffect(() => {

    async function buscarTrofeus() {

      const carteirinha = localStorage.getItem("carteirinha")
      if (!carteirinha) return

      const resposta = await fetch(
        `http://127.0.0.1:8000/usuario/${carteirinha}`
      )

      const usuario = await resposta.json()

      if (!usuario) return

      setPoints(usuario.trofeus)
      localStorage.setItem("trofeus", usuario.trofeus)
    }

    buscarTrofeus()

  }, [])

  useEffect(() => {

    function atualizarTrofeus() {
      const novoValor = localStorage.getItem("trofeus")
      setPoints(Number(novoValor))
    }

    window.addEventListener("trofeusAtualizados", atualizarTrofeus)

    return () => {
      window.removeEventListener("trofeusAtualizados", atualizarTrofeus)
    }

  }, [])

  return (
    <header className="flex justify-between items-center px-3 py-2 bg-white border-b border-brand-gray">
      <div>
        {showPoints && (
          <span className="flex items-center gap-1 bg-brand-gray-100 rounded-full px-3 py-1">
            <FaTrophy size={18} className="text-brand-primary" />
            <span className="font-bold text-sm">
              {points.toLocaleString('pt-BR')}
            </span>
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button className="bg-transparent border-none p-0 font-bold text-brand-muted">
          A+
        </button>
        <button className="bg-transparent border-none p-0 text-brand-muted">
          <FiBell size={20} />
        </button>
      </div>
    </header>
  )
}

export default TopBar