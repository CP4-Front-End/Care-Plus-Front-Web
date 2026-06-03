export const API_URL = 'http://127.0.0.1:8000'

export function chaveBeneficiosSessao(carteirinha) {
  return `beneficiosSessaoAtiva:${carteirinha}`
}

export function marcarBeneficiosSessaoAtiva(carteirinha) {
  if (!carteirinha) return

  sessionStorage.setItem(chaveBeneficiosSessao(carteirinha), 'true')
}

export function salvarSessaoUsuario(usuario) {
  if (!usuario?.carteirinha) return

  localStorage.setItem('carteirinha', usuario.carteirinha)
  localStorage.setItem('nome', usuario.nome || '')
  localStorage.setItem('trofeus', usuario.trofeus || 0)
  marcarBeneficiosSessaoAtiva(usuario.carteirinha)
  window.dispatchEvent(new Event('trofeusAtualizados'))
}

export function limparSessaoUsuario() {
  const carteirinha = localStorage.getItem('carteirinha')

  if (carteirinha) {
    sessionStorage.removeItem(chaveBeneficiosSessao(carteirinha))
  }

  localStorage.removeItem('carteirinha')
  localStorage.removeItem('nome')
  localStorage.removeItem('trofeus')
  window.dispatchEvent(new Event('trofeusAtualizados'))
}

export function redirecionarLogin(navigate) {
  limparSessaoUsuario()
  navigate('/login', { replace: true })
}

export async function buscarUsuarioLogado(navigate) {
  const carteirinha = localStorage.getItem('carteirinha')

  if (!carteirinha) {
    redirecionarLogin(navigate)
    return null
  }

  const resposta = await fetch(`${API_URL}/usuario/${carteirinha}`)
  const usuario = await resposta.json()

  if (!resposta.ok || !usuario) {
    redirecionarLogin(navigate)
    return null
  }

  return usuario
}

export async function carregarBeneficiosDaSessao(carteirinha, quantidade = 6) {
  if (!carteirinha) return []

  const renovar = !sessionStorage.getItem(chaveBeneficiosSessao(carteirinha))
  const parametros = new URLSearchParams({
    quantidade: String(quantidade),
    carteirinha,
    renovar: String(renovar),
  })

  const resposta = await fetch(`${API_URL}/beneficios-sorteados?${parametros}`)
  const dados = await resposta.json()

  if (!resposta.ok) {
    throw new Error(dados.detail || 'Nao foi possivel carregar os beneficios.')
  }

  marcarBeneficiosSessaoAtiva(carteirinha)

  return dados
}
