import test from 'node:test'
import assert from 'node:assert/strict'
import { breedOptions, changePetValues, mascotaError, speciesOptions, withHistoricalOption } from '../src/lib/mascotas.js'

test('editar sin cambios conserva exactamente especies y razas históricas', () => {
  for (const especie of ['CANINA', 'Conejo', ' Perro ', 'felina']) {
    for (const raza of ['Cruce antiguo', ' MESTIZO ', '', null]) {
      const previous = { especie, raza, nombre: 'Luna' }
      assert.deepEqual(changePetValues({ ...previous, nombre: 'Sol' }, previous), { ...previous, nombre: 'Sol' })
      if (raza) assert.equal(withHistoricalOption(breedOptions(especie), raza).at(-1).value, raza)
    }
    assert.ok(withHistoricalOption(speciesOptions, especie).some(option => option.value === especie))
  }
})
test('cambiar deliberadamente especie limpia la raza anterior sin cambiar otros campos', () => {
  assert.deepEqual(changePetValues({ especie: 'Gato', raza: 'Labrador retriever', nombre: 'Luna' }, { especie: 'Perro' }), { especie: 'Gato', raza: '', nombre: 'Luna' })
  assert.equal(changePetValues({ especie: 'Perro', raza: 'Personalizada' }, { especie: 'Perro' }).raza, 'Personalizada')
  for (const raza of ['Mestizo', 'No conozco la raza']) assert.equal(changePetValues({ especie: 'Gato', raza }, { especie: 'Perro' }).raza, raza)
})
test('sugerencias dependientes y opciones para especie o raza desconocidas', () => {
  assert.deepEqual(speciesOptions.map(option => option.value), ['Perro', 'Gato', 'Otra especie'])
  for (const especie of ['Perro', 'Gato', 'Otra especie']) {
    const values = breedOptions(especie).map(option => option.value)
    assert.ok(values.includes('Mestizo')); assert.ok(values.includes('No conozco la raza'))
  }
  assert.ok(breedOptions('Perro').some(option => option.value === 'Labrador retriever'))
  assert.ok(!breedOptions('Gato').some(option => option.value === 'Labrador retriever'))
  assert.equal(withHistoricalOption(speciesOptions, 'Perro').length, speciesOptions.length)
})
test('errores HTTP comprensibles y motivo de bloqueo del backend conservado', () => {
  assert.match(mascotaError({ isAxiosError: true }), /conectar/)
  assert.match(mascotaError({ response: { status: 401 } }), /sesión/)
  assert.match(mascotaError({ response: { status: 403 } }), /permiso/)
  assert.match(mascotaError({ response: { status: 404 } }), /disponible/)
  assert.match(mascotaError({ response: { status: 500, data: { error: 'SQL interno' } } }), /servidor/)
  const message = 'No se puede eliminar una mascota con historia clínica registrada'
  assert.equal(mascotaError({ response: { status: 400, data: { error: message } } }), message)
})

test('nacimiento usa fecha civil de Lima y rechaza fechas futuras o inválidas', async () => {
  const {birthDateError,petToday}=await import('../src/lib/mascotas.js')
  const now=new Date('2026-10-31T02:00:00Z')
  assert.equal(petToday(now),'2026-10-30')
  assert.equal(birthDateError('2026-10-30',now),'')
  assert.equal(birthDateError('2021-06-28',now),'')
  assert.equal(birthDateError('',now),'')
  assert.match(birthDateError('2026-10-31',now),/futura/)
  assert.match(birthDateError('2026-02-30',now),/Revisa/)
  assert.match(birthDateError('28/06/2021',now),/Revisa/)
})
