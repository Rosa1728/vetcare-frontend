import { useState } from 'react'
import PrettySelect from './PrettySelect'
import { breedOptions, withHistoricalOption } from '../lib/mascotas'

const CUSTOM = '__pet_custom_breed__'
export default function PetBreedField({ species, value, onChange, floating=false }) {
  const [custom, setCustom] = useState(false)
  const options = withHistoricalOption(breedOptions(species), custom ? '' : value)
  return <div className="mascotas-breed">
    <PrettySelect floating={floating} label="Raza de la mascota" keyboardNavigation value={custom ? CUSTOM : value} options={[...options, { value: CUSTOM, label: 'Otra' }]} onChange={next => {
      setCustom(next === CUSTOM)
      onChange(next === CUSTOM ? '' : next)
    }}/>
    {custom && <input className="input" aria-label="Raza personalizada" placeholder="Escribe la raza" required maxLength={100} value={value} onChange={event => onChange(event.target.value)}/>}
  </div>
}
