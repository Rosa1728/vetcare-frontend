import {useEffect,useState} from 'react'
import VetcareModal from './VetcareModal'
import PrettySelect from './PrettySelect'
import {api} from '../lib/api'
import {compatibleVaccineAppointments,vaccineError} from '../lib/vaccines'
import {vaccineDateLabel} from '../lib/ownerHistory'
import {professionalName} from '../lib/display'
import {agendaDate} from '../lib/vetAgenda'
export default function VaccineApplicationDialog({dose,pet,vet,historyId,onClose,onContinue}) {
 const [loaded,setLoaded]=useState(null),[selected,setSelected]=useState(''),[revision,setRevision]=useState(0)
 useEffect(()=>{
  const controller=new AbortController()
  Promise.all([api.get('/citas',{signal:controller.signal}),api.get('/atenciones',{signal:controller.signal})]).then(([c,a])=>{
   if(!Array.isArray(c.data)||!Array.isArray(a.data))throw Error('No se pudo verificar el contexto clínico.')
   if(!controller.signal.aborted)setLoaded({citas:c.data,attentions:a.data})
  }).catch(error=>{if(!controller.signal.aborted)setLoaded({error:vaccineError(error)})})
  return()=>controller.abort()
 },[revision])
 const choices=loaded&&!loaded.error?compatibleVaccineAppointments(dose,pet,vet,loaded.citas,loaded.attentions,historyId):[]
 const choice=choices.find(c=>String(c.cita.idCita)===(selected||String(choices[0]?.cita.idCita)))
 return <VetcareModal label="Registrar aplicación" className="vax-application-dialog" onClose={onClose}><h2>Registrar aplicación</h2><dl>{[['Vacuna',dose.nombre],['Paciente',pet.nombre],['Fecha programada',vaccineDateLabel(dose.fechaProgramada||dose.proximaDosis)],['Veterinario',professionalName(vet)]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p>Para registrar esta vacuna como aplicada, debe estar vinculada a una cita y atención clínica válidas del paciente.</p>
 {!loaded?<p role="status">Verificando citas y atenciones…</p>:loaded.error?<div role="alert"><p>{loaded.error}</p><button onClick={()=>{setLoaded(null);setRevision(n=>n+1)}}>Reintentar</button></div>:!choices.length?<p role="status">No se encontró una cita válida para registrar esta aplicación. La mascota debe contar previamente con una cita y atención clínica correspondiente.</p>:<><label className="vax-appointment-choice"><span>Cita compatible · Lima</span><PrettySelect keyboardNavigation floating label="Cita compatible" required value={String(choice?.cita.idCita||'')} onChange={setSelected} options={choices.map(c=>({value:c.cita.idCita,label:`${agendaDate(c.cita.fechaCita)} · ${c.attention?'Atención registrada':'Registro clínico habilitado'}`}))}/></label><p className="vax-footnote">{choice?.attention?'La aplicación se vinculará a esta atención sin modificar sus datos históricos.':'Continuar abrirá el formulario existente de atención. La cita se marcará ATENDIDA únicamente al guardar la atención correctamente.'}</p></>}
 <div className="profile-dialog-actions"><button onClick={onClose}>Cancelar</button><button className="vax-primary" disabled={!choice} onClick={()=>{const valid=compatibleVaccineAppointments(dose,pet,vet,loaded.citas,loaded.attentions,historyId).find(c=>String(c.cita.idCita)===String(choice?.cita.idCita));if(valid)onContinue(valid);else {setLoaded(null);setRevision(n=>n+1)}}}>Continuar a atención</button></div></VetcareModal>
}
