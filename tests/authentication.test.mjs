import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {passwordError,passwordIssues,passwordHelp,registrationError,authError} from '../src/lib/passwordPolicy.js'
const base={nombres:'Persona',apellidos:'Sintética',tipoDocumento:'DNI',nroDocumento:'12345678',nroCelular:'999888777',direccion:'Dirección sintética',correo:'test@example.invalid',contrasena:'Consulta@Segura37'}
test('política común acepta ocho caracteres y unicode',()=>{for(const v of ['Aq1!bcde','Áñ2!bcde',base.contrasena])assert.equal(passwordError(v),'')})
test('rechaza claves comunes y requisitos ausentes',()=>{for(const v of ['Corta1!','solo123!','SOLO123!','SinNumero!','SinSimbolo123','Password1!','Contraseña1!','VetCare2026!'])assert.notEqual(passwordError(v),'')})
test('límite BCrypt cuenta bytes sin truncar acentos',()=>{assert.equal(passwordError('Aa1!'+'é'.repeat(34)),'');assert.notEqual(passwordError('Aa1!'+'é'.repeat(35)),'')})
test('registro valida documento, celular, campos vacíos y coincidencia',()=>{assert.equal(registrationError(base,base.contrasena),'');for(const patch of [{nombres:' '},{tipoDocumento:'ADMIN'},{nroDocumento:'123'},{nroCelular:'abc'}])assert.notEqual(registrationError({...base,...patch},base.contrasena),'');assert.match(registrationError(base,'Otra@Segura37'),/no coinciden/)})
test('errores de autenticación no exponen detalles técnicos',()=>{assert.match(authError({response:{status:401}}),/incorrectos/);assert.match(authError({response:{status:503,data:{trace:'secreto'}}}),/no está disponible/);assert.match(authError({response:{status:429}}),/minuto/);assert.ok(!authError({response:{status:500,data:{trace:'secreto'}}}).includes('secreto'))})
test('las cuatro páginas reutilizan logo y layout; logo navega a ruta pública sin tocar tokens',async()=>{
 const root=new URL('../src/',import.meta.url)
 for(const file of ['Login','Registro','RecuperarContrasena','RestablecerContrasena']){const source=await readFile(new URL(`pages/${file}.jsx`,root),'utf8');assert.match(source,/<AuthLayout/)}
 const layout=await readFile(new URL('components/auth/AuthLayout.jsx',root),'utf8');assert.match(layout,/<Link to="\/" className="auth-logo" aria-label="Ir al inicio de VetCare"/);assert.ok(!layout.includes('logout'));assert.ok(!layout.includes('sessionStorage'));assert.ok(!layout.includes('window.location'))
})
test('registro coloca contacto antes del correo y contraseña y omite texto técnico',async()=>{const source=await readFile(new URL('../src/pages/Registro.jsx',import.meta.url),'utf8');const labels=[...source.matchAll(/<AuthInput label="([^"]+)"/g)].map(m=>m[1]);assert.deepEqual(labels,['Nombres','Apellidos','Número de documento','Celular','Dirección (opcional)','Correo electrónico','Contraseña','Confirmar contraseña']);assert.ok(!source.includes('Los datos se envían'));assert.ok(!source.includes('mín. 6'))})

test('solo informa los requisitos incumplidos y explica el rechazo del nombre de la clínica',()=>{
 assert.equal(passwordError('segura!123'),'Incluye una letra mayúscula.')
 assert.equal(passwordError('Segura123'),'Agrega al menos un símbolo.')
 assert.equal(passwordError('Segura!xyz'),'Agrega al menos un número.')
 assert.match(passwordError('VetCare2026!'),/menos común/)
 assert.doesNotMatch(passwordError('VetCare2026!'),/8 caracteres|mayúscula|minúscula|bytes/)
 assert.deepEqual(passwordIssues('Consulta@Segura37'),[])
 assert.doesNotMatch(passwordHelp,/bytes/i)
 assert.equal(passwordHelp,'Usa al menos 8 caracteres, incluyendo mayúscula, minúscula, número y símbolo. Evita contraseñas comunes o fáciles de adivinar.')
 assert.doesNotMatch(passwordError('VetCare2026!'),/VetCare|2026/)
 assert.equal(passwordError('Aa1!'+'é'.repeat(35)),'La contraseña es demasiado larga. Usa una más breve.')
 assert.equal(passwordError('Aa1!'+'😀'.repeat(17)),'')
 assert.match(passwordError('Aa1!'+'😀'.repeat(18)),/demasiado larga/)
})
test('registro declara identidad estable y autocompletado semántico sin truncar contraseñas',async()=>{
 const source=await readFile(new URL('../src/pages/Registro.jsx',import.meta.url),'utf8')
 for(const [key,token] of [['nombres','given-name'],['apellidos','family-name'],['nroDocumento','off'],['nroCelular','tel'],['direccion','street-address'],['correo','email'],['contrasena','new-password'],['confirmarContrasena','new-password']]){
  assert.ok(source.includes(`id="registro-${key}" name="${key}" autoComplete="${token}"`))
 }
 assert.ok(!source.includes('maxLength={72}'))
 const input=await readFile(new URL('../src/components/auth/AuthInput.jsx',import.meta.url),'utf8')
 assert.match(input,/id=providedId\|\|generatedId/)
 assert.match(input,/htmlFor=\{id\}/)
})

test('registro permite dirección ausente, null, vacía o informada sin cambiar otros campos',()=>{
 const {direccion:ignored,...withoutAddress}=base
 void ignored
 for(const values of [withoutAddress,{...base,direccion:null},{...base,direccion:''},base])assert.equal(registrationError(values,values.contrasena),'')
})
test('dirección del registro es opcional y mantiene el límite de longitud',async()=>{
 const source=await readFile(new URL('../src/pages/Registro.jsx',import.meta.url),'utf8')
 const field=source.match(/<AuthInput label="Dirección \(opcional\)"[^>]+\/>/)[0]
 assert.doesNotMatch(field,/\brequired\b|\*/)
 assert.match(field,/maxLength=\{200\}/)
})
