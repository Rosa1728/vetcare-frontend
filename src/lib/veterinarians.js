import {passwordIssues} from './passwordPolicy.js'
import {professionalName as displayProfessionalName} from './display.js'
export function professionalName(v){return displayProfessionalName(v)||'Profesional sin nombre'}
export function vetInitials(v) {return [v?.nombres,v?.apellidos].filter(Boolean).map(s=>s.trim().charAt(0)).join('').toUpperCase() || 'V'}
export function eligibleVets(users,items){return users.filter(u=>u.rol==='VETERINARIO'&&!items.some(v=>v.idUsuario===u.idUsuario))}
export function vetError(err){if(!err.response)return err.message==='Formato inesperado'?'No se pudieron interpretar los datos. Intenta actualizar.':'No se pudo conectar. Intenta nuevamente.';if(err.response.status>=500)return 'El servidor no pudo completar la operación. Intenta nuevamente.';return ({401:'Tu sesión expiró. Vuelve a iniciar sesión.',403:'No tienes permiso para esta operación.',409:'No se puede completar la operación: existen registros relacionados o datos duplicados.'})[err.response.status]||err.response.data?.error||'No se pudo completar la operación.'}

// La política compartida decide la validez; aquí solo se presenta lo que falta.
export function vetPasswordIssues(value=''){return passwordIssues(value)}
export function vetFormErrors(v){
 const errors={}
 const required={idUsuario:'Selecciona una cuenta veterinaria.',nombres:'Ingresa los nombres.',apellidos:'Ingresa los apellidos.',tipoDocumento:'Selecciona un tipo de documento.',nroDocumento:'Ingresa el número de documento.',correo:'Ingresa el correo electrónico.',especialidad:'Ingresa la especialidad.',nroColegiatura:'Ingresa la colegiatura.'}
 for(const [key,message]of Object.entries(required))if(key in v&&!String(v[key]??'').trim())errors[key]=message
 if('correo'in v&&v.correo&&!/^[^\s@]+@[^\s@]+$/.test(v.correo))errors.correo='Ingresa un correo electrónico válido.'
 for(const [key,max]of Object.entries({nombres:100,apellidos:100,tipoDocumento:20,nroDocumento:20,correo:150,nroCelular:20,especialidad:100,nroColegiatura:30}))if(typeof v[key]==='string'&&v[key].length>max)errors[key]=`El campo no puede superar ${max} caracteres.`
 if(v.tipoDocumento==='DNI'&&!/^\d{8}$/.test(v.nroDocumento||''))errors.nroDocumento='El DNI debe tener 8 dígitos.'
 if(['CE','PASAPORTE'].includes(v.tipoDocumento)&&!/^[A-Za-z0-9]{6,20}$/.test(v.nroDocumento||''))errors.nroDocumento='Usa entre 6 y 20 letras o números.'
 if(v.nroCelular&&!/^9\d{8}$/.test(v.nroCelular))errors.nroCelular='Ingresa 9 dígitos y comienza con 9.'
 if('contrasena' in v){const issues=vetPasswordIssues(v.contrasena);if(issues.length)errors.contrasena=issues}
 return errors
}
export function vetServerErrors(err){
 const data=err?.response?.data,errors={}
 for(const [key,message] of Object.entries(data?.campos||{}))errors[key.split('.').at(-1)]=message
 const message=data?.error||''
 if(/correo/i.test(message))errors.correo=message
 else if(/documento/i.test(message))errors.nroDocumento=message
 else if(/colegiatura/i.test(message))errors.nroColegiatura=message
 else if(/contraseña/i.test(message))errors.contrasena=message.replace(/Máximo 72 bytes[.]?/g,'Usa una contraseña más breve si es demasiado larga.')
 return errors
}
