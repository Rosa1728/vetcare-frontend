export const storyCategories=['Adopción','Recuperación','Celebración','Aventuras','Otros']
export const storyPhotoUrl=(client,id)=>`${client.defaults.baseURL}/publicaciones/${encodeURIComponent(id)}/foto`
export function storyErrors(values) {
 const errors={}
 if(!values.idMascota)errors.idMascota='Selecciona una de tus mascotas.'
 if(!values.titulo?.trim()||values.titulo.length>120)errors.titulo='Escribe un título de hasta 120 caracteres.'
 if(!storyCategories.includes(values.categoria))errors.categoria='Selecciona una categoría válida.'
 if(!values.contenido?.trim()||values.contenido.length>3000)errors.contenido='Escribe tu historia, hasta 3000 caracteres.'
 return errors
}
export function storyError(error) {return error?.response?.data?.error&&!['Bad Request','Forbidden','Not Found','Internal Server Error'].includes(error.response.data.error)?error.response.data.error:({400:'Revisa los datos de la historia.',401:'Tu sesión expiró. Inicia sesión nuevamente.',403:'No tienes permiso para modificar esta historia.',404:'La historia ya no está disponible.'})[error?.response?.status]||'No se pudo completar la operación. Intenta nuevamente.'}
export function storyQuery(search) {
 const params=new URLSearchParams(search),page=Number(params.get('page')||0)
 return {page:Number.isSafeInteger(page)&&page>=0?page:0,q:(params.get('q')||'').slice(0,120),categoria:storyCategories.includes(params.get('categoria'))?params.get('categoria'):''}
}
export async function publishStory(client,values,photo) {
 const {data}=await client.post('/publicaciones',{idMascota:Number(values.idMascota),titulo:values.titulo,categoria:values.categoria,contenido:values.contenido})
 let photoError=null
 if(photo){try{await uploadStoryPhoto(client,data.id,photo)}catch(error){photoError=error}}
 return {story:data,photoError}
}
export function uploadStoryPhoto(client,id,file) {const body=new FormData();body.append('foto',file);return client.post(`/publicaciones/${id}/foto`,body,{timeout:30000})}
