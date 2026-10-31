export function contactPayload(values) { return {nroCelular: values.nroCelular ?? '', direccion: values.direccion ?? ''} }
export function contactErrors(values, peruano=false) {
 const errors={}, phone=values.nroCelular || ''
 if(phone && (phone.length>20 || (peruano ? !/^9[0-9]{8}$/.test(phone) : !/^[+]?[0-9][0-9 ()-]{5,19}$/.test(phone)))) errors.nroCelular=peruano ? (phone.length!==9 ? 'Ingresa un celular de 9 dígitos.' : 'El celular debe comenzar con 9.') : 'Ingresa un celular válido de 6 a 20 caracteres.'
 if((values.direccion || '').length>200) errors.direccion='La dirección admite hasta 200 caracteres.'
 return errors
}
