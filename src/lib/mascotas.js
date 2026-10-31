import {limaToday} from './clinicalHistory.js'
export const speciesOptions = ['Perro', 'Gato', 'Otra especie'].map(value => ({ value, label: value }))
const breeds = {
  perro: ['Labrador retriever', 'Golden retriever', 'Pastor alemán', 'Poodle', 'Bulldog', 'Chihuahua', 'Shih Tzu', 'Schnauzer'],
  gato: ['Siamés', 'Persa', 'Maine Coon', 'Bengalí', 'Ragdoll', 'British Shorthair'],
}
export function breedOptions(species) {
  const key = String(species || '').trim().toLowerCase()
  const family = ['perro', 'canina', 'canino'].includes(key) ? 'perro' : ['gato', 'felina', 'felino'].includes(key) ? 'gato' : ''
  return [...(breeds[family] || []), 'Mestizo', 'No conozco la raza'].map(value => ({ value, label: value }))
}
// No normalizar valores persistidos: la opción histórica conserva incluso espacios y mayúsculas.
export function withHistoricalOption(options, value) {
  return value && !options.some(option => option.value === value) ? [...options, { value, label: `${value} (valor actual)` }] : options
}
export function changePetValues(next, previous) {
  const changedSpecies = next.especie !== previous.especie
  const compatibleBreed = breedOptions(next.especie).some(option => option.value === next.raza)
  return changedSpecies && !compatibleBreed ? { ...next, raza: '' } : next
}
export function mascotaError(error) {
  const status = error.response?.status
  if (!status) return error.isAxiosError ? 'No se pudo conectar. Comprueba tu conexión e intenta nuevamente.' : error.message || 'No se pudo completar la operación.'
  if (status === 401) return 'Tu sesión ha vencido. Vuelve a iniciar sesión.'
  if (status === 403) return 'No tienes permiso para realizar esta acción.'
  if (status === 404) return 'La mascota o el recurso solicitado ya no está disponible. Actualiza el listado.'
  if (status === 409) return 'No se pudo completar la operación porque existen datos relacionados. Actualiza e intenta nuevamente.'
  if (status >= 500) return 'El servidor no pudo completar la operación. Intenta nuevamente más tarde.'
  const data = error.response.data
  if (data?.campos && typeof data.campos === 'object') return Object.values(data.campos).flat().join(' · ')
  return data?.error || data?.mensaje || data?.message || 'No se pudo completar la operación. Revisa los datos e intenta nuevamente.'
}

export const petToday=limaToday
export function birthDateError(value,now=new Date()) {
  if(!value)return ''
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||Number.isNaN(Date.parse(`${value}T12:00:00Z`))||new Date(`${value}T12:00:00Z`).toISOString().slice(0,10)!==value)return 'Revisa la fecha de nacimiento.'
  return value>petToday(now)?'La fecha de nacimiento no puede ser futura.':''
}
