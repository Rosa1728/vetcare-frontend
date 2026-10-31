import test from 'node:test'
import assert from 'node:assert/strict'
import {fullName,professionalName,vetLabel} from '../src/lib/display.js'
import {professionalName as clinicalName} from '../src/lib/clinicalAppointments.js'
import {professionalName as adminName} from '../src/lib/veterinarians.js'
import {profileDisplayName} from '../src/lib/profile.js'
import {vetWelcome} from '../src/lib/homePresentation.js'

test('listados, citas, perfil y saludo comparten tratamiento explícito sin modificar nombres',()=>{
 for(const tratamientoProfesional of ['Dr.','Dra.',null]){
  const vet={nombres:'Mateo',apellidos:'Ramírez Torres',tratamientoProfesional,especialidad:'General'}
  const expected=(tratamientoProfesional?tratamientoProfesional+' ':'')+'Mateo Ramírez Torres'
  assert.equal(professionalName(vet),expected);assert.equal(clinicalName(vet),expected);assert.equal(adminName(vet),expected)
  assert.equal(profileDisplayName(vet,vet,'VETERINARIO'),expected)
  assert.equal(vetLabel(vet),expected+' — General')
  assert.equal(vetWelcome(vet,vet).greeting,`¡Hola, ${tratamientoProfesional?tratamientoProfesional+' ':''}Mateo!`)
  assert.equal(fullName(vet),'Mateo Ramírez Torres')
  assert.equal(profileDisplayName(vet,vet,'PROPIETARIO'),'Mateo Ramírez Torres')
  assert.equal(vet.nombres,'Mateo')
 }
})
test('prefijos de presentación repetidos se muestran una sola vez y no se infiere tratamiento',()=>{
 const vet={nombres:'Dr. Dra. Mateo',apellidos:'Ramírez',tratamientoProfesional:'Dra.'}
 assert.equal(professionalName(vet),'Dra. Mateo Ramírez')
 assert.equal(profileDisplayName(vet,vet,'VETERINARIO'),'Dra. Mateo Ramírez')
 assert.equal(professionalName({nombres:'Sofía',apellidos:'Ramírez',tratamientoProfesional:'Doctor'}),'Sofía Ramírez')
})
