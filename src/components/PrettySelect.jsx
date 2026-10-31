import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './FloatingSelect.css'
import { Check, ChevronDown } from 'lucide-react'

export default function PrettySelect({value, onChange, options=[], placeholder='Seleccionar', required=false, className='', label, keyboardNavigation=false, floating=false, invalid=false, describedBy, menuClassName=''}) {
  const [open,setOpen]=useState(false),[portalHost,setPortalHost]=useState(null)
  const root=useRef(null),menu=useRef(null),menuId=useId()
  useLayoutEffect(()=>{
    if(!open||!floating)return
    const trigger=root.current.querySelector('.vet-select-trigger'),list=menu.current
    const position=()=>{
      const rect=trigger.getBoundingClientRect(),viewport=window.visualViewport
      const top=viewport?.offsetTop||0,left=viewport?.offsetLeft||0
      const height=viewport?.height||window.innerHeight,width=viewport?.width||window.innerWidth
      const below=top+height-rect.bottom-12,above=rect.top-top-12
      const upward=below<Math.min(260,list.scrollHeight)&&above>below
      const available=Math.max(40,upward?above:below)
      list.style.width=`${Math.min(rect.width,width-24)}px`
      list.style.maxHeight=`${Math.min(260,available)}px`
      list.style.left=`${Math.max(left+12,Math.min(rect.left,left+width-list.offsetWidth-12))}px`
      list.style.top=`${upward?rect.top-list.offsetHeight-6:rect.bottom+6}px`
      list.dataset.placement=upward?'top':'bottom'
      const body=(trigger.closest('.editor-scroll-body')||trigger.closest('fieldset'))?.getBoundingClientRect()
      list.style.visibility=body&&(rect.bottom<body.top||rect.top>body.bottom)?'hidden':'visible'
    }
    position()
    const selected=list.querySelector('[aria-selected="true"]')||list.querySelector('[role="option"]')
    selected?.focus({preventScroll:true});selected?.scrollIntoView({block:'nearest'})
    window.addEventListener('resize',position);window.addEventListener('scroll',position,true)
    window.visualViewport?.addEventListener('resize',position)
    window.visualViewport?.addEventListener('scroll',position)
    return()=>{window.removeEventListener('resize',position);window.removeEventListener('scroll',position,true);window.visualViewport?.removeEventListener('resize',position);window.visualViewport?.removeEventListener('scroll',position)}
  },[open,floating])
  useEffect(()=>{
    const close=(event)=>{if(!root.current?.contains(event.target)&&!menu.current?.contains(event.target))setOpen(false)}
    const escape=(event)=>{if(event.key==='Escape')setOpen(false)}
    document.addEventListener('pointerdown',close)
    document.addEventListener('keydown',escape)
    return ()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',escape)}
  },[])
  function openMenu() {
    if(floating)setPortalHost(root.current.closest('[role="dialog"]')||document.body)
    setOpen(true)
  }
  function keyboard(event) {
    if (!keyboardNavigation) return
    if (floating && event.key==='Tab' && open) {
      event.preventDefault();event.stopPropagation();setOpen(false)
      const trigger=root.current.querySelector('.vet-select-trigger')
      const dialog=root.current.closest('[role="dialog"]')||document.body
      const controls=[...dialog.querySelectorAll('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled)')].filter(node=>node.tabIndex!==-1&&node.offsetParent!==null&&!menu.current?.contains(node))
      const index=controls.indexOf(trigger),step=event.shiftKey?-1:1
      controls[(index+step+controls.length)%controls.length]?.focus()
      return
    }
    if (event.key === 'Escape' && (!floating || open)) { event.preventDefault(); event.stopPropagation(); setOpen(false); root.current.querySelector('.vet-select-trigger')?.focus(); return }
    if (!['ArrowDown','ArrowUp','Home','End'].includes(event.key)) return
    event.preventDefault()
    const nodes = [...(menu.current?.querySelectorAll('[role="option"]')||[])]
    if (!open) {
      openMenu()
      requestAnimationFrame(() => { const choices=[...(menu.current?.querySelectorAll('[role="option"]')||[])]; (event.key==='End'?choices.at(-1):choices.find(n=>n.getAttribute('aria-selected')==='true')||choices[0])?.focus() })
    } else {
      const current = nodes.indexOf(document.activeElement)
      const index = event.key==='Home'?0:event.key==='End'?nodes.length-1:(current+(event.key==='ArrowDown'?1:-1)+nodes.length)%nodes.length
      nodes[index]?.focus();if(floating)nodes[index]?.scrollIntoView({block:'nearest'})
    }
  }
  const selected=options.find(o=>String(o.value)===String(value))
  const optionsMenu=<div ref={menu} id={menuId} className={`vet-select-menu${floating?' vet-select-floating':''} ${menuClassName}`} style={floating?{position:'fixed',visibility:'hidden',zIndex:200}:undefined} role="listbox" aria-label={label||placeholder}>
      {!required&&<button type="button" role="option" aria-selected={!selected} className="vet-select-option" onClick={()=>{onChange('');setOpen(false);if(floating&&keyboardNavigation)root.current.querySelector('.vet-select-trigger')?.focus()}}>{placeholder}{!selected&&<Check size={17}/>}</button>}
      {options.map(o=><button type="button" role="option" aria-selected={String(o.value)===String(value)} key={o.value} className="vet-select-option" onClick={()=>{onChange(String(o.value));setOpen(false);if(keyboardNavigation)root.current.querySelector('.vet-select-trigger')?.focus()}}><span>{o.label}</span>{String(o.value)===String(value)&&<Check size={17} className="text-emerald-700"/>}</button>)}
      {!options.length&&<p className="vet-select-empty">No hay opciones disponibles</p>}
    </div>
  return <div className={`vet-select ${className}`} ref={root} onKeyDown={keyboard}>
    <button type="button" className="vet-select-trigger" aria-label={label||placeholder} aria-invalid={invalid} aria-describedby={describedBy} aria-haspopup="listbox" aria-expanded={open} aria-controls={open?menuId:undefined} onClick={()=>{if(open)setOpen(false);else openMenu()}}>
      <span className={!selected?'vet-select-placeholder':''}>{selected?.label||placeholder}</span><ChevronDown size={18} className={open?'rotate-180':''}/>
    </button>
    {open&&(floating?createPortal(optionsMenu,portalHost||document.body):optionsMenu)}
    {required&&<input type="text" required tabIndex={-1} aria-hidden="true" value={selected?String(selected.value):''} onChange={()=>{}} className="vet-select-validation"/>}
  </div>
}
