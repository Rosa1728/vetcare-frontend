import {useRef,useState} from 'react'
import {Link} from 'react-router-dom'
import {Menu,PawPrint,X} from 'lucide-react'
import {publicSections} from '../lib/publicLanding'
import '../pages/Inicio.css'
function Brand() {
  return <Link to="/" className="public-brand" aria-label="VetCare, página de inicio"><PawPrint size={42}/><span><strong>VetCare</strong><small>Cuidado que los acompaña</small></span></Link>
}
function SectionLinks({active,onSectionClick,onNavigate}) {return publicSections.map(([id,title])=><a key={id} href={`${onSectionClick?'':'/'}#${id}`} aria-current={active===id?'location':undefined} onClick={event=>{onNavigate?.();onSectionClick?.(event,id)}}>{title}</a>)}
export function PublicHeader({active,onSectionClick}) {
 const [menu,setMenu]=useState(false),menuButton=useRef(null)
 function sectionLinks(){return <SectionLinks active={active} onSectionClick={onSectionClick} onNavigate={()=>setMenu(false)}/>}
 return <header className="public-header" onKeyDown={event => { if (event.key === 'Escape' && menu) { setMenu(false); menuButton.current?.focus() } }}>
      <div className="public-header-inner"><Brand/>
        <button ref={menuButton} className="public-menu-toggle" aria-label={menu ? 'Cerrar navegación' : 'Abrir navegación'} aria-expanded={menu} aria-controls="public-menu" onClick={() => setMenu(value => !value)}>{menu ? <X/> : <Menu/>}</button>
        <nav id="public-menu" className={menu ? 'open' : ''} aria-label="Navegación pública">{sectionLinks()}</nav>
        <div className="public-auth"><Link to="/login" className="public-button outline">Iniciar sesión</Link><Link to="/registro" className="public-button primary">Registrarte</Link></div>
      </div>
    </header>
}
export function PublicFooter({active,onSectionClick}) {function sectionLinks(){return <SectionLinks active={active} onSectionClick={onSectionClick}/>}return <footer className="public-footer public-container"><Brand/><nav aria-label="Navegación del pie de página">{sectionLinks()}</nav><p>Las historias son públicas; los expedientes clínicos son privados.</p></footer>}
export default function PublicLayout({children}) {return <div className="public-vetcare"><a className="public-skip" href="#contenido-publico">Saltar al contenido</a><PublicHeader/><main id="contenido-publico" tabIndex={-1}>{children}</main><PublicFooter/></div>}
