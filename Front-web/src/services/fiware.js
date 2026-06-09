import { API_URL } from './sessao.js'

export async function buscarPedometroStep001() {
  const resposta = await fetch(`${API_URL}/fiware/pedometer/step001`)
  const dados = await resposta.json().catch(() => ({}))

  if (!resposta.ok) {
    throw new Error(dados.detail || 'Nao foi possivel carregar a pulseira.')
  }

  return {
    status: dados.status || 'offline',
    deviceId: dados.deviceId || 'step001',
    entityId: dados.entityId || 'urn:ngsi-ld:Pedometer:001',
    type: dados.type || 'Pedometer',
    steps: Number(dados.steps || 0),
    stepsPerMinute: Number(dados.stepsPerMinute || 0),
    buttonEvent: dados.buttonEvent || '',
    nfcId: dados.nfcId || '',
    error: dados.error || '',
  }
}
