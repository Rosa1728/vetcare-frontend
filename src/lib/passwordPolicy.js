export const passwordHelp='Usa al menos 8 caracteres, incluyendo mayúscula, minúscula, número y símbolo. Evita contraseñas comunes o fáciles de adivinar.'
export function passwordIssues(value=''){
 const text=typeof value==='string'?value:''
 const issues=[]
 if([...text].length<8)issues.push('Usa al menos 8 caracteres.')
 if(new TextEncoder().encode(text).length>72)issues.push('La contraseña es demasiado larga. Usa una más breve.')
 if(!/\p{Lu}/u.test(text))issues.push('Incluye una letra mayúscula.')
 if(!/\p{Ll}/u.test(text))issues.push('Incluye una letra minúscula.')
 if(!/\p{Nd}/u.test(text))issues.push('Agrega al menos un número.')
 if(!/[^\p{L}\p{N}\s]/u.test(text))issues.push('Agrega al menos un símbolo.')
 const base=text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z]/g,'')
 if(['password','contrasena','qwerty','admin','administrator','letmein','welcome','bienvenido','vetcare','abc'].includes(base))issues.push('Elige una contraseña menos común o difícil de adivinar.')
 return issues
}
export function passwordError(value){return passwordIssues(value).join(' ')}
export function registrationError(v,confirmation){
 if(['nombres','apellidos','nroDocumento','correo'].some(k=>!v[k]?.trim()))return 'Completa los datos obligatorios.'
 if(!['DNI','CE','PASAPORTE'].includes(v.tipoDocumento))return 'Selecciona un tipo de documento válido.'
 if(v.tipoDocumento==='DNI'?!/^\d{8}$/.test(v.nroDocumento.trim()):!/^[A-Za-z0-9]{6,20}$/.test(v.nroDocumento.trim()))return 'Revisa el número de documento: DNI de 8 dígitos o documento de 6 a 20 letras y números.'
 if(v.nroCelular&&!/^\+?[0-9][0-9 ()-]{5,19}$/.test(v.nroCelular))return 'Ingresa un celular válido de 6 a 20 caracteres.'
 return passwordError(v.contrasena)||(v.contrasena!==confirmation?'Las contraseñas no coinciden.':'')
}
export function authError(error){
 const status=error?.response?.status
 if(status===401)return 'Correo o contraseña incorrectos.'
 if(status===503)return 'La recuperación de contraseña aún no está disponible. Contacta a la clínica o intenta más tarde.'
 if(status===429)return 'Espera un minuto antes de solicitar instrucciones nuevamente.'
 if(error?.response?.data?.campos)return Object.values(error.response.data.campos).join(' ')
 if(status===400||status===409)return error.response.data.error||'Revisa los datos del formulario.'
 return 'No se pudo completar la solicitud. Comprueba tu conexión e intenta nuevamente.'
}
