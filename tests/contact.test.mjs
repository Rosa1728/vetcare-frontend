import test from 'node:test'
import assert from 'node:assert/strict'
import {contactPayload,contactErrors} from '../src/lib/contact.js'
import {profileChanges} from '../src/lib/profile.js'
test('edición construye allowlist sin identidad ni credenciales, incluso con valores históricos',()=>{
 assert.deepEqual(contactPayload({nombres:'Protegido',correo:'a@b.invalid',contrasena:'no',idRol:1,nroCelular:'987654321',direccion:'Lima'}),{nroCelular:'987654321',direccion:'Lima'})
 assert.deepEqual(contactPayload({}),{nroCelular:'',direccion:''})
})
test('contacto opcional conserva restricciones existentes y errores contextuales',()=>{
 assert.deepEqual(contactErrors({nroCelular:'',direccion:''},true),{})
 assert.match(contactErrors({nroCelular:'123'},true).nroCelular,/9 dígitos/)
 assert.match(contactErrors({nroCelular:'887654321'},true).nroCelular,/comenzar/)
 assert.deepEqual(contactErrors({nroCelular:'+51987654321'}),{})
 assert.ok(contactErrors({direccion:'x'.repeat(201)}).direccion)
})
test('perfil puede vaciar contacto sin enviar identidad, rol ni tratamiento',()=>{
 assert.deepEqual(profileChanges({nroCelular:'',direccion:'',correo:'no',tratamientoProfesional:'Dr.'},{nroCelular:'987654321',direccion:'Lima'}),{nroCelular:'',direccion:''})
})
