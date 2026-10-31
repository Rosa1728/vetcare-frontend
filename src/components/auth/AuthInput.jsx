import {useId,useState} from 'react'
import {Eye,EyeOff} from 'lucide-react'
export default function AuthInput({label,icon:Icon,type='text',wide=false,id:providedId,controlOnly=false,...props}){
 const [visible,setVisible]=useState(false),generatedId=useId(),id=providedId||generatedId,password=type==='password'
 const control=<div className="auth-control">{Icon&&<Icon size={19} aria-hidden="true"/>}<input {...props} id={id} type={password&&visible?'text':type} className={password?'auth-password':''}/>{password&&<button type="button" aria-label={`${visible?'Ocultar':'Mostrar'} ${label.toLowerCase()}`} aria-pressed={visible} onMouseDown={event=>{if(controlOnly)event.preventDefault()}} onClick={()=>setVisible(v=>!v)}>{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button>}</div>
 return controlOnly?control:<div className={`auth-field${wide?' auth-wide':''}`}><label htmlFor={id}>{label}</label>{control}</div>
}
