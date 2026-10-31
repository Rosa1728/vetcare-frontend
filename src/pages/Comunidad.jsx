import {useEffect,useState} from 'react'
import {Link,useLocation,useParams,useSearchParams} from 'react-router-dom'
import PublicLayout from '../components/PublicLayout'
import StoryCard,{StoryPhoto} from '../components/StoryCard'
import PrettySelect from '../components/PrettySelect'
import {api} from '../lib/api'
import {useAuth} from '../contexts/AuthContext'
import {storyCategories,storyError,storyQuery} from '../lib/stories'
import {dateDisplay} from '../lib/display'
export function StoryDetail({own=false}) {
 const {user}=useAuth()
 const {id}=useParams(),location=useLocation(),[loaded,setLoaded]=useState(null),[revision,setRevision]=useState(0)
 useEffect(()=>{const controller=new AbortController();api.get(own?`/publicaciones/mis/${id}`:`/publicaciones/${id}`,{signal:controller.signal}).then(({data})=>{if(!controller.signal.aborted)setLoaded({id,data,revision})}).catch(error=>{if(!controller.signal.aborted)setLoaded({id,error,revision})});return()=>controller.abort()},[id,own,revision])
 const current=loaded?.id===id&&loaded?.revision===revision?loaded:null,back=own?'/panel/mis-historias':`/comunidad${location.search}`
 const body=<section className="story-detail"><div className="story-detail-navigation"><Link className="story-button" to={back}>← {own?'Volver a Mis historias':'Volver a Comunidad'}</Link>{!own&&user&&<Link className="story-button" to="/panel">← Regresar a mi panel</Link>}</div>{!current?<p role="status">Cargando historia…</p>:current.error?<div role="alert"><p>{storyError(current.error)}</p><button className="story-button" onClick={()=>setRevision(n=>n+1)}>Reintentar</button></div>:<article><div className="story-detail-photo"><StoryPhoto key={current.data.id} story={current.data}/></div><div><span className="story-category">{current.data.categoria}</span><h1>{current.data.titulo}</h1><p className="story-author">{current.data.mascota} · Publicado por {current.data.autor} · {dateDisplay(current.data.fechaCreacion)}</p><p className="story-full-text">{current.data.contenido}</p></div></article>}</section>
 return own?body:<PublicLayout>{body}</PublicLayout>
}
function StorySearch({initial,onSearch}){const [draft,setDraft]=useState(initial);return <form onSubmit={event=>{event.preventDefault();onSearch(draft.trim())}}><label>Buscar por título o mascota<input maxLength={120} value={draft} onChange={event=>setDraft(event.target.value)}/></label><button className="story-button">Buscar</button></form>}
export default function Comunidad() {
 const {user}=useAuth()
 const [params,setParams]=useSearchParams(),query=storyQuery(params.toString()),search=params.toString(),[loaded,setLoaded]=useState(null),[revision,setRevision]=useState(0)
 useEffect(()=>{const controller=new AbortController();api.get('/publicaciones/pagina',{params:{...storyQuery(search),size:9},signal:controller.signal}).then(({data})=>{if(!Array.isArray(data?.content))throw Error('Listado inválido');if(!controller.signal.aborted)setLoaded({search,data,revision})}).catch(error=>{if(!controller.signal.aborted)setLoaded({search,error,revision})});return()=>controller.abort()},[search,revision])
 const current=loaded?.search===search&&loaded?.revision===revision?loaded:null
 function change(values){const next={...query,...values};setParams(Object.fromEntries(Object.entries(next).filter(([,v])=>v!==''&&v!==0)))}
 return <PublicLayout><section className="community-page"><header><h1>Comunidad</h1><p>Conoce historias de mascotas y sus familias.</p>{user&&<Link className="story-button community-return" to="/panel">← Regresar a mi panel</Link>}</header><div className="community-filters"><StorySearch key={query.q} initial={query.q} onSearch={q=>change({q,page:0})}/><label>Categoría<PrettySelect label="Categoría de historias" keyboardNavigation floating value={query.categoria} onChange={categoria=>change({categoria,page:0})} placeholder="Todas las categorías" options={storyCategories.map(value=>({value,label:value}))}/></label><span className="story-order">Más recientes primero</span></div>{!current?<p role="status">Cargando historias…</p>:current.error?<div role="alert"><p>{storyError(current.error)}</p><button className="story-button" onClick={()=>setRevision(n=>n+1)}>Reintentar</button></div>:<><div className="community-grid">{current.data.content.map(story=><StoryCard key={story.id} story={story} to={`/comunidad/${story.id}?${params}`}/>)}</div>{!current.data.content.length&&<p>No se encontraron historias para esta búsqueda.</p>}<nav className="story-pagination" aria-label="Páginas de historias"><button className="story-button" disabled={query.page===0} onClick={()=>change({page:query.page-1})}>Anterior</button><span>Página {query.page+1} · {current.data.totalElements} historias</span><button className="story-button" disabled={query.page+1>=current.data.totalPages} onClick={()=>change({page:query.page+1})}>Siguiente</button></nav></>}</section></PublicLayout>
}
