import {useState} from 'react'
import {Link} from 'react-router-dom'
import {PawPrint,UserRound} from 'lucide-react'
import {api} from '../lib/api'
import {storyPhotoUrl} from '../lib/stories'
import {dateDisplay} from '../lib/display'
import './Stories.css'
export function StoryPhoto({story}) {const [failed,setFailed]=useState(false);return story.foto&&!failed?<img loading="lazy" src={storyPhotoUrl(api,story.id)} alt={`Fotografía de ${story.mascota}`} onError={()=>setFailed(true)}/>:<span className="story-photo-fallback" aria-label="Sin fotografía disponible"><PawPrint size={32}/></span>}
export default function StoryCard({story,to,compact=false,actions}) {return <article className={`story-card ${compact?'story-compact':''}`}><Link className="story-photo" to={to} aria-label={`Leer historia: ${story.titulo}`}><StoryPhoto story={story}/></Link><div className="story-card-body"><span className="story-category">{story.categoria}</span><h3><Link to={to}>{story.titulo}</Link></h3><p className="story-excerpt">{story.contenido}</p><div className="story-byline"><UserRound size={22}/><span><strong>{story.autor}</strong><small>{story.mascota}</small></span></div>{!compact&&<time>{dateDisplay(story.fechaCreacion)}</time>}{!compact&&<Link className="story-read" to={to}>{actions?'Ver historia':'Leer historia'} →</Link>}{actions}</div></article>}
