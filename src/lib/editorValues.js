// Algunos autocompletadores actualizan el DOM sin emitir onChange.
// La reconciliación es optativa y no añade campos al contrato del formulario.
export function readEditorValues(form, values, fields) {
  const next={...values}
  for(const field of fields){
    if(field.section||field.hidden||field.options)continue
    const input=form.elements.namedItem(field.name??field.key)
    if(input&&typeof input.value==='string')next[field.key]=input.value
  }
  return next
}
