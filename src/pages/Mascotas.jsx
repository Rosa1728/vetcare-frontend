import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertCircle, Camera, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react'
import { api, errorText } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import EditorForm from '../components/EditorForm'
import PetAvatar from '../components/PetAvatar'
import PetPhotoEditor from '../components/PetPhotoEditor'
import PetPhotoCrop from '../components/PetPhotoCrop'
import { createPetWithPhoto, notifyPetPhoto } from '../lib/petPhoto'
import { dateDisplay, fullName, listOf } from '../lib/display'
import VetcareModal from '../components/VetcareModal'
import PrettySelect from '../components/PrettySelect'
import PetBreedField from '../components/PetBreedField'
import { useCitaToast } from '../lib/useCitaToast'
import { changePetValues, mascotaError, speciesOptions, withHistoricalOption, birthDateError, petToday } from '../lib/mascotas'
import './UnifiedHeadings.css'
import './Mascotas.css'

export default function Mascotas() {
  const { user, owner } = useAuth()
  const role = user?.role
  const canDelete = role === 'ADMIN'
  const canWrite = role === 'ADMIN' || role === 'PROPIETARIO'
  const [items,setItems] = useState([])
  const [owners,setOwners] = useState([])
  const [error,setError] = useState('')
  const [form,setForm] = useState(null)
  const [photoPet, setPhotoPet] = useState(null)
  const [rawPhoto, setRawPhoto] = useState(null)
  const [createPhoto, setCreatePhoto] = useState(null)
  const [notice, setNotice] = useCitaToast()
  const [warning, setWarning] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  const [deletePet, setDeletePet] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const editorTrigger=useRef(null),photoTrigger=useRef(null)
  const pendingLoad = useRef(null)
  const deletingRef = useRef(false)
  const ownersLoaded = useRef(false)
  const cancelCrop = useCallback(() => setRawPhoto(null), [])
  const closePhoto = useCallback(() => setPhotoPet(null), [])
  const load = useCallback(() => {
    if (pendingLoad.current) return pendingLoad.current
    setLoading(true); setLoadFailed(false); setError('')
    const request = Promise.all([
      api.get('/mascotas'),
      role === 'ADMIN' && !ownersLoaded.current ? api.get('/propietarios') : Promise.resolve(null),
    ]).then(([pets, people]) => {
      setItems(listOf(pets.data))
      if (people) { setOwners(listOf(people.data)); ownersLoaded.current = true }
      return true
    }).catch(e => { setError(mascotaError(e)); setLoadFailed(true); return false })
      .finally(() => { pendingLoad.current = null; setLoading(false) })
    pendingLoad.current = request
    return request
  }, [role])
  useEffect(() => { void load() }, [load])
  function clearMessages() { setNotice(''); setWarning(''); setError('') }
  const modalOpen = !!(form || photoPet || rawPhoto || deletePet)
  const actionsDisabled = loading || deleting || modalOpen
  const ownerOptions = owners.map(p => ({ value: p.idPropietario, label: `${fullName(p) || `Cliente ${p.idPropietario}`} (#${p.idPropietario})` }))
  const fields = [
    ...(role === 'ADMIN' ? [{ key:'idPropietario', label:'Propietario', options: ownerOptions }] : [{ key:'idPropietario', label:'Propietario', hidden:true }]),
    { key:'nombre', label:'Nombre', id:'pet-name', name:'petName', autoComplete:'off', maxLength:100 },
    { key:'especie', label:'Especie', render:({values,onChange}) => <PrettySelect floating label="Especie de la mascota" required keyboardNavigation value={values.especie} options={withHistoricalOption(speciesOptions, form?.item.especie)} onChange={onChange}/> },
    { key:'raza', label:'Raza', required:false, render:({values,onChange}) => <PetBreedField floating key={values.especie} species={values.especie} value={values.raza} onChange={onChange}/> },
    { key:'sexo', label:'Sexo', required:false, options:[{value:'Hembra',label:'Hembra'},{value:'Macho',label:'Macho'}] },
    { key:'fechaNacimiento', label:'Fecha de nacimiento', type:'date', required:false, max:petToday() },
  ]
  async function remove() {
    if (!canDelete || !deletePet || deletingRef.current) return
    deletingRef.current = true; setDeleting(true); setDeleteError(''); clearMessages()
    try {
      await api.delete(`/mascotas/${deletePet.idMascota}`)
      setDeletePet(null)
      setNotice('Mascota eliminada.')
      await load()
    } catch (e) { setDeleteError(mascotaError(e)) }
    finally { deletingRef.current = false; setDeleting(false) }
  }
  async function save(payload) {
    try {
      const invalid=birthDateError(payload.fechaNacimiento)
      if(invalid)throw new Error(invalid)
      return form.type === 'create' ? await createPetWithPhoto(api, payload, createPhoto) : await api.put(`/mascotas/${form.item.idMascota}`, payload)
    } catch (e) { throw new Error(mascotaError(e), { cause: e }) }
  }
  return <section className="mascotas-page">
    <div className="vetcare-section-header">
      <div><h1>{role==='PROPIETARIO'?'Mis mascotas':'Pacientes'}</h1><p>Gestiona la información de tus mascotas y sus fotografías.</p></div>
      <div className="flex gap-2"><button className="btn btn-ghost" disabled={actionsDisabled} onClick={()=>{clearMessages();void load()}}><RefreshCw size={17}/> Actualizar</button>{canWrite && <button className="btn btn-primary" disabled={actionsDisabled || loadFailed} onClick={event=>{editorTrigger.current=event.currentTarget;clearMessages();setCreatePhoto(null);setForm({type:'create', item:{ idPropietario: owner?.idPropietario || '' }})}}><Plus size={17}/> Nueva mascota</button>}</div>
    </div>
    {!modalOpen && (error || warning || notice) && <div role={error || warning ? 'alert' : 'status'} className={`mascotas-message ${error ? 'mascotas-error' : warning ? 'mascotas-warning' : 'mascotas-success'}`}>
      {(error || warning) && <AlertCircle size={18}/>}<span>{error || warning || notice}</span>
      <button type="button" aria-label="Cerrar mensaje" onClick={clearMessages}><X size={17}/></button>
    </div>}
    <div className="overflow-x-auto bg-white border border-vetcare-soft rounded-2xl shadow-sm">
      <table className="w-full text-sm" aria-busy={loading}><thead className="bg-[#f2eefc]"><tr>{['Nombre','Especie','Raza','Sexo','Nacimiento','Propietario', canWrite?'Acciones':null].filter(Boolean).map(h=><th key={h} className="px-4 py-4 text-left">{h}</th>)}</tr></thead>
      <tbody>{loading && <tr><td colSpan={canWrite?7:6} className="p-6 text-center" role="status">Cargando mascotas…</td></tr>}{!loading && items.map(m=><tr key={m.idMascota} className="border-t border-vetcare-soft-2">
        <td className="p-4 font-bold flex items-center gap-2"><PetAvatar pet={m}/>{m.nombre}</td>
        <td className="p-4">{m.especie}</td><td className="p-4">{m.raza || '—'}</td><td className="p-4">{m.sexo || '—'}</td>
        <td className="p-4">{dateDisplay(m.fechaNacimiento)}</td>
        <td className="p-4">{m.nombrePropietario || `#${m.idPropietario}`}</td>
        {canWrite && <td className="p-4"><div className="mascotas-actions"><button disabled={actionsDisabled} className="btn mascotas-edit text-xs" onClick={event=>{editorTrigger.current=event.currentTarget;clearMessages();setForm({type:'edit', item:m})}}><Pencil size={14}/> Editar</button><button disabled={actionsDisabled} className="btn mascotas-photo text-xs" onClick={event=>{photoTrigger.current=event.currentTarget;clearMessages();setPhotoPet({pet:m})}}><Camera size={14}/> Fotografía</button>{canDelete && <button disabled={actionsDisabled} className="btn mascotas-delete text-xs" onClick={()=>{clearMessages();setDeleteError('');setDeletePet(m)}}><Trash2 size={14}/> Eliminar</button>}</div></td>}
      </tr>)}{!loading && loadFailed && <tr><td colSpan={canWrite?7:6} className="text-center p-6">No se pudo actualizar el listado. Usa Actualizar para reintentar.</td></tr>}{!loading && !loadFailed && !items.length && <tr><td colSpan={canWrite?7:6} className="text-center p-10 text-vetcare-text-muted">No hay mascotas visibles para tu cuenta.</td></tr>}</tbody></table>
    </div>
    {form && <EditorForm compact floatingSelects containFocus returnFocusRef={editorTrigger} className="mascotas-editor" transformValues={changePetValues} title={form.type==='create'?'Registrar mascota':'Editar mascota'} endpoint={form.type==='create'?'/mascotas':`/mascotas/${form.item.idMascota}`} method={form.type==='create'?'post':'put'} fields={fields} initial={form.item} onClose={()=>setForm(null)}
      renderError={(message,onDismiss)=><div role="alert" className="mascotas-message mascotas-error sm:col-span-2"><AlertCircle size={18}/><span>{message}</span><button type="button" aria-label="Cerrar error del formulario" onClick={onDismiss}><X size={17}/></button></div>}
      onSave={save}
      onDone={result=>{setForm(null);void load();clearMessages();if(form.type==='create'){if(result.photoError){setWarning('La mascota fue registrada. Solo falta guardar su fotografía; no vuelvas a registrar la mascota.');setPhotoPet({pet:result.pet,initialPhoto:createPhoto,initialError:errorText(result.photoError)})}else{if(createPhoto)notifyPetPhoto(result.pet.idMascota,true);setNotice(createPhoto?'Mascota y fotografía registradas.':'Mascota registrada.')}}else setNotice('Datos de la mascota actualizados.')}}>
      {form.type==='create' && <section className="mascotas-photo-section"><h3>Fotografía de la mascota (opcional)</h3><label className="btn mascotas-secondary mascotas-file-control"><Camera size={17}/>Seleccionar fotografía<input className="mascotas-file-input" type="file" aria-label="Seleccionar fotografía" accept="image/jpeg,image/png,image/webp" onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)setRawPhoto(file)}}/></label><p>{createPhoto ? 'Fotografía seleccionada. Se guardará al registrar la mascota.' : 'Puedes agregar una fotografía ahora o más adelante.'}</p>{createPhoto&&<button type="button" className="mascotas-remove-pending" onClick={()=>setCreatePhoto(null)}>Quitar foto seleccionada</button>}</section>}
    </EditorForm>}
    {canDelete && deletePet && <VetcareModal className="mascotas-delete-modal" label="Eliminar mascota" busy={deleting} onClose={()=>{if(!deletingRef.current)setDeletePet(null)}}>
      <h2>Eliminar mascota</h2><p>¿Deseas eliminar a <strong>{deletePet.nombre}</strong>?</p>
      <p>Esta acción no se puede deshacer. El sistema no permite eliminar mascotas con citas o historia clínica registrada, incluso si el expediente está vacío.</p>
      {deleteError && <div role="alert" className="mascotas-message mascotas-error"><span>{deleteError}</span><button type="button" aria-label="Cerrar error" onClick={()=>setDeleteError('')}><X size={17}/></button></div>}
      <div className="profile-dialog-actions"><button className="btn btn-ghost" data-autofocus disabled={deleting} onClick={()=>setDeletePet(null)}>Cancelar</button><button className="btn mascotas-delete" disabled={deleting} onClick={remove}><Trash2 size={16}/>{deleting?'Eliminando…':'Eliminar mascota'}</button></div>
    </VetcareModal>}
    {rawPhoto && <PetPhotoCrop variant="mascotas" file={rawPhoto} onCancel={cancelCrop} onConfirm={file=>{setCreatePhoto(file);setRawPhoto(null)}}/>}
    {photoPet && <PetPhotoEditor returnFocusRef={photoTrigger} variant="mascotas" {...photoPet} onClose={closePhoto} onSaved={()=>{setWarning('');void load()}}/>}
  </section>
}
