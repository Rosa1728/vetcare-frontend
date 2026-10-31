import {useRef,useState} from 'react'
import {UserRound,Mail,LockKeyhole,Phone,House,IdCard,UserRoundPlus} from 'lucide-react'
import {Link,useNavigate} from 'react-router-dom'
import {api} from '../lib/api'
import PrettySelect from '../components/PrettySelect'
import AuthLayout from '../components/auth/AuthLayout'
import AuthInput from '../components/auth/AuthInput'
import {authError,passwordHelp,registrationError} from '../lib/passwordPolicy'
export default function Registro(){
 const navigate=useNavigate(),sending=useRef(false)
 const [values,setValues]=useState({nombres:'',apellidos:'',tipoDocumento:'DNI',nroDocumento:'',nroCelular:'',direccion:'',correo:'',contrasena:''}),[confirmation,setConfirmation]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false)
 const change=key=>e=>{setError('');setValues(v=>({...v,[key]:e.target.value}))}
 async function submit(e){e.preventDefault();if(sending.current)return;setError('');const invalid=registrationError(values,confirmation);if(invalid){setError(invalid);return}sending.current=true;setBusy(true);try{await api.post('/auth/registro',values);navigate('/login',{replace:true,state:{notice:'Cuenta creada. Inicia sesión con tu correo.'}})}catch(err){setError(authError(err))}finally{sending.current=false;setBusy(false)}}
 return <AuthLayout registration title="Crear mi cuenta" description="Regístrate en VetCare para cuidar la salud de tus mascotas"><form className="auth-form auth-grid" onSubmit={submit}><fieldset disabled={busy}>
 <AuthInput label="Nombres" id="registro-nombres" name="nombres" autoComplete="given-name" icon={UserRound} required maxLength={100} value={values.nombres} onChange={change('nombres')} placeholder="Tus nombres"/>
 <AuthInput label="Apellidos" id="registro-apellidos" name="apellidos" autoComplete="family-name" icon={UserRound} required maxLength={100} value={values.apellidos} onChange={change('apellidos')} placeholder="Tus apellidos"/>
 <div className="auth-field"><span>Tipo de documento</span><PrettySelect label="Tipo de documento" required keyboardNavigation value={values.tipoDocumento} onChange={value=>setValues(v=>({...v,tipoDocumento:value}))} options={[{value:'DNI',label:'DNI'},{value:'CE',label:'Carnet de extranjería'},{value:'PASAPORTE',label:'Pasaporte'}]}/></div>
 <AuthInput label="Número de documento" id="registro-nroDocumento" name="nroDocumento" autoComplete="off" icon={IdCard} inputMode={values.tipoDocumento==='DNI'?'numeric':'text'} spellCheck={false} required maxLength={20} value={values.nroDocumento} onChange={change('nroDocumento')} placeholder="Tu documento"/>
 <AuthInput label="Celular" id="registro-nroCelular" name="nroCelular" autoComplete="tel" icon={Phone} type="tel" maxLength={20} value={values.nroCelular} onChange={change('nroCelular')} placeholder="Tu celular"/>
 <AuthInput label="Dirección (opcional)" id="registro-direccion" name="direccion" autoComplete="street-address" icon={House} maxLength={200} value={values.direccion} onChange={change('direccion')} placeholder="Tu dirección"/>
 <AuthInput label="Correo electrónico" id="registro-correo" name="correo" autoComplete="email" icon={Mail} wide type="email" required maxLength={150} value={values.correo} onChange={change('correo')} placeholder="Tu correo electrónico"/>
 <AuthInput label="Contraseña" id="registro-contrasena" name="contrasena" autoComplete="new-password" icon={LockKeyhole} type="password" required minLength={8} aria-describedby="register-password-help" value={values.contrasena} onChange={change('contrasena')} placeholder="Crea una contraseña segura"/>
 <AuthInput label="Confirmar contraseña" id="registro-confirmarContrasena" name="confirmarContrasena" autoComplete="new-password" icon={LockKeyhole} type="password" required minLength={8} value={confirmation} onChange={e=>{setError('');setConfirmation(e.target.value)}} placeholder="Repite tu contraseña"/>
 <p id="register-password-help" className="auth-help auth-wide">{passwordHelp}</p>
 </fieldset>{error&&<p role="alert" className="auth-error auth-wide">{error}</p>}<button className="auth-submit auth-wide" disabled={busy}><UserRoundPlus size={19}/>{busy?'Creando cuenta…':'Registrarme'}</button></form><div className="auth-links">¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link></div></AuthLayout>
}
