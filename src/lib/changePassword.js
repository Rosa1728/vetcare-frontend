import {passwordError,passwordHelp} from './passwordPolicy.js'
export const securityPasswordHelp=passwordHelp
export function passwordChangeErrors(values){
 const errors={}
 if(!values.contrasenaActual)errors.contrasenaActual='Ingresa tu contraseña actual.'
 const invalid=passwordError(values.nuevaContrasena)
 if(invalid)errors.nuevaContrasena=invalid
 if(!values.confirmarContrasena||values.nuevaContrasena!==values.confirmarContrasena)errors.confirmarContrasena='Las contraseñas no coinciden.'
 if(values.nuevaContrasena&&values.nuevaContrasena===values.contrasenaActual)errors.nuevaContrasena='Elige una contraseña diferente de la actual.'
 return errors
}
