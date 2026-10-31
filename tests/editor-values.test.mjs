import test from 'node:test'
import assert from 'node:assert/strict'
import {readEditorValues} from '../src/lib/editorValues.js'
test('envío reconcilia autocompletado silencioso sin vaciar campos ni añadir datos ajenos',()=>{
 const fields=[{key:'nombres'},{key:'apellidos'},{key:'tratamientoProfesional',options:[]},{key:'contrasena'}]
 const values={nombres:'',apellidos:'',tratamientoProfesional:'Dra.',contrasena:'Consulta@Segura37'}
 const inputs={nombres:{value:'Sofía'},apellidos:{value:'Ramírez'},contrasena:{value:values.contrasena},idRol:{value:'ADMIN'}}
 const actual=readEditorValues({elements:{namedItem:key=>inputs[key]}},values,fields)
 assert.deepEqual(actual,{...values,nombres:'Sofía',apellidos:'Ramírez'})
 assert.equal(values.nombres,'');assert.ok(!('idRol' in actual))
})
test('campos sin control DOM conservan el valor original y se respetan nombres semánticos',()=>{
 assert.deepEqual(readEditorValues({elements:{namedItem:key=>key==='vetNombre'?{value:'Mateo'}:null}},{nombres:'Anterior',especialidad:'General'},[{key:'nombres',name:'vetNombre'},{key:'especialidad'}]),{nombres:'Mateo',especialidad:'General'})
})
