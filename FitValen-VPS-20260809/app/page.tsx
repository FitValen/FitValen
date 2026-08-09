"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createDefaultState, type FitValenState } from "./fitvalen-state";

type View = "inicio" | "entrenamiento" | "calendario" | "nutricion" | "perfil" | "admin";
type IconName = "home" | "gym" | "calendar" | "apple" | "user" | "shield" | "bell" | "fire" | "play" | "plus" | "water" | "weight" | "trophy" | "clock" | "chart" | "people" | "check" | "arrow" | "food" | "settings" | "close";

type SessionUser = {
  id: string;
  username: string;
  displayName: string;
  role: "admin" | "member";
};

const UserContext = createContext<SessionUser | null>(null);

function LoginScreen({ onLogin }: { onLogin: (user: SessionUser) => Promise<void> }) {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, pin }),
      });
      const payload = await response.json() as { user?: SessionUser; error?: string };
      if (!response.ok || !payload.user) throw new Error(payload.error || "No se pudo iniciar sesión.");
      await onLogin(payload.user);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo iniciar sesión.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="login-page"><section className="login-card"><div className="login-brand"><span>FV</span><strong>FitValen</strong></div><p className="login-kicker">ENTRENA · REGISTRA · PROGRESA</p><h1>Bienvenido de nuevo</h1><p className="login-copy">Accede con tu usuario y PIN. La sesión se mantendrá activa en este dispositivo hasta que la cierres.</p><form onSubmit={submit}><label>Nombre de usuario<input autoComplete="username" value={username} onChange={(event)=>setUsername(event.target.value)} required/></label><label>PIN<input type="password" inputMode="numeric" autoComplete="current-password" minLength={4} maxLength={12} pattern="[0-9]+" value={pin} onChange={(event)=>setPin(event.target.value)} required/></label>{error&&<p className="login-error" role="alert">{error}</p>}<button className="primary login-submit" disabled={busy}>{busy?"Comprobando…":"Entrar en FitValen"}</button></form><small>Acceso privado · 2 usuarios · Datos cifrados</small></section></main>;
}

const nav: { id: View; label: string; icon: IconName }[] = [
  { id: "inicio", label: "Inicio", icon: "home" },
  { id: "entrenamiento", label: "Entrenamiento", icon: "gym" },
  { id: "calendario", label: "Calendario", icon: "calendar" },
  { id: "nutricion", label: "Nutrición", icon: "apple" },
  { id: "perfil", label: "Perfil", icon: "user" },
];

const icons: Record<IconName, React.ReactNode> = {
  home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-7h6v7"/></>,
  gym: <><path d="M6 7v10M3.5 9v6M18 7v10M20.5 9v6M6 12h12M2 12h1.5M20.5 12H22"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></>,
  apple: <><path d="M12 7C9.8 4.7 6.7 4.8 5 6.5 2.7 8.7 4 16.8 8.4 20c1.2.9 2.3-.3 3.6-.3s2.4 1.2 3.6.3C20 16.8 21.3 8.7 19 6.5c-1.7-1.7-4.8-1.8-7 .5Z"/><path d="M12 7c0-2 1.2-3.5 3.5-4"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c.8-5 3.5-7 8-7s7.2 2 8 7"/></>,
  shield: <><path d="M12 3 4.5 6v5.5c0 4.8 3 8 7.5 10 4.5-2 7.5-5.2 7.5-10V6L12 3Z"/><path d="m9 12 2 2 4-4"/></>,
  bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
  fire: <path d="M13.5 3.5c.3 3.1-1.3 4.3-2.8 5.6-1.4 1.2-2.7 2.4-2.7 5a4 4 0 0 0 8 0c0-1.7-.5-3.6-2.5-5.7.2 2.1-.7 3.2-1.5 3.7.2-2.8-.7-5.7 1.5-8.6Z"/>,
  play: <path d="m9 7 8 5-8 5V7Z"/>, plus: <path d="M12 5v14M5 12h14"/>,
  water: <path d="M12 3S6 10 6 15a6 6 0 0 0 12 0c0-5-6-12-6-12Z"/>,
  weight: <><path d="M6 7h12l2 14H4L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0M10 12h4"/></>,
  trophy: <><path d="M8 4h8v5a4 4 0 0 1-8 0V4Z"/><path d="M8 6H4c0 4 2 6 5 6M16 6h4c0 4-2 6-5 6M12 13v4M8 21h8"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
  people: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c.5-4 2.5-6 6-6s5.5 2 6 6M15 15c3 0 5 1.5 6 4.5"/></>,
  check: <path d="m5 12 4 4L19 6"/>, arrow: <path d="m9 6 6 6-6 6"/>,
  food: <><path d="M6 3v8M3 3v5c0 2 1 3 3 3s3-1 3-3V3M6 11v10M16 3v18M16 3c4 2 4 8 0 10"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1A7 7 0 0 0 15 6l-.3-2.5h-4L10.5 6A7 7 0 0 0 9 7.1l-2.4-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1A7 7 0 0 0 10.5 18l.3 2.5h4L15 18a7 7 0 0 0 1.5-1.1l2.4 1 2-3.4-2-1.5a7 7 0 0 0 .1-1Z"/></>,
  close: <path d="m6 6 12 12M18 6 6 18"/>,
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{icons[name]}</svg>;
}

function Header({ eyebrow, title, admin }: { eyebrow: string; title: string; admin: () => void }) {
  const current=useContext(UserContext);const firstName=current?.displayName.split(" ")[0]||"Usuario";const initials=current?.displayName.split(" ").slice(0,2).map(part=>part[0]).join("").toUpperCase()||"FV";
  return <header className="topbar"><div><p>{eyebrow}</p><h1>{title}</h1></div><div className="top-actions"><button className="icon-btn dot" aria-label="Notificaciones"><Icon name="bell"/></button><button className="profile-chip" onClick={admin}><span>{initials}</span><div><strong>{firstName}</strong><small>{current?.role==="admin"?"Administrador":"Miembro"}</small></div><Icon name="arrow" size={15}/></button></div></header>;
}

const days = [
  { d: "L", n: 10, state: "done" }, { d: "M", n: 11, state: "done" },
  { d: "X", n: 12, state: "rest" }, { d: "J", n: 13, state: "today" },
  { d: "V", n: 14, state: "plan" }, { d: "S", n: 15, state: "rest" }, { d: "D", n: 16, state: "plan" },
];

function Week() { return <div className="week">{days.map(x => <button key={x.n} className={x.state}><small>{x.d}</small><strong>{x.n}</strong><i/></button>)}</div>; }
function Bar({ value, blue = false }: { value: number; blue?: boolean }) { return <span className={`bar ${blue ? "blue" : ""}`}><i style={{ width: `${value}%` }}/></span>; }

function Home({ go, start, notify, waterMl, addWater }: { go:(v:View)=>void; start:()=>void; notify:(s:string)=>void; waterMl:number; addWater:(amount:number)=>void }) {
  const current=useContext(UserContext);return <><Header eyebrow={`BUENOS DÍAS, ${(current?.displayName.split(" ")[0]||"USUARIO").toUpperCase()}`} title="¡A por el jueves!" admin={()=>go("perfil")}/>
    <section className="hero-grid">
      <article className="workout-hero"><div><span className="tag glass"><Icon name="fire" size={15}/> ENTRENAMIENTO DE HOY</span><h2>Empuje · Pecho<br/>y hombro</h2><p>5 ejercicios · 17 series · 55 min</p><div className="chips"><span>Pecho</span><span>Hombro</span><span>Tríceps</span></div><button className="primary white" onClick={start}><Icon name="play"/> Comenzar entrenamiento</button></div><div className="hero-art"><i/><b/><span/></div></article>
      <article className="card streak"><div className="card-title"><div><small>TU CONSTANCIA</small><h3>Esta semana</h3></div><span className="fire"><Icon name="fire"/> 4 días</span></div><div className="streak-days">{days.map((x,i)=><div key={x.n}><small>{x.d}</small><b className={i<4?"active":""}>{i<4&&<Icon name="check" size={15}/>}</b></div>)}</div><p>Un entrenamiento más para cumplir tu objetivo semanal.</p></article>
    </section>
    <SectionTitle eyebrow="VISTA RÁPIDA" title="Tu día de un vistazo" action="Ver calendario" click={()=>go("calendario")}/>
    <section className="metrics">
      <Metric icon="food" tone="green" label="Calorías" value="1.420" suffix="/ 2.250 kcal" progress={63} note="830 kcal disponibles"/>
      <Metric icon="water" tone="blue" label="Agua" value={(waterMl/1000).toFixed(2).replace(".",",")} suffix="/ 2,5 litros" progress={Math.min(100,waterMl/25)} note="+ Añadir vaso" click={()=>addWater(250)}/>
      <Metric icon="weight" tone="lime" label="Peso actual" value="78,4" suffix="kg" note="↓ 0,6 kg este mes" click={()=>notify("Registro de peso preparado")}/>
    </section>
    <section className="two-cols">
      <article className="card schedule"><SectionTitle eyebrow="PLANIFICACIÓN" title="Tu semana"/><Week/><Agenda time="19:00" title="Empuje · Pecho y hombro" sub="Hoy · 55 min · 5 ejercicios" play click={start}/><Agenda time="Mañana" title="Tirón · Espalda y bíceps" sub="18:30 · 60 min · 6 ejercicios" blue/></article>
      <article className="card achievements"><SectionTitle eyebrow="ÚLTIMOS LOGROS" title="Estás progresando"/><Achievement initials="PB" title="Nuevo récord en press banca" sub="82,5 kg · Hace 2 días" change="+2,5 kg"/><Achievement initials="RM" title="1RM estimado" sub="Press militar · 53 kg" change="+4%" blue/><button className="soft full" onClick={()=>go("entrenamiento")}>Ver todo el progreso</button></article>
    </section>
    <SectionTitle eyebrow="ACCESOS DIRECTOS" title="Registra en segundos"/>
    <section className="quick"><Quick icon="weight" title="Registrar peso" sub="Último: 78,4 kg" click={()=>notify("Registro de peso preparado")}/><Quick icon="food" title="Añadir comida" sub="1.420 kcal hoy" click={()=>go("nutricion")} blue/><Quick icon="water" title="Añadir agua" sub={`${(waterMl/1000).toFixed(2).replace(".",",")} de 2,5 L`} click={()=>addWater(250)} cyan/></section>
  </>;
}

function SectionTitle({ eyebrow, title, action, click }: { eyebrow:string; title:string; action?:string; click?:()=>void }) { return <div className="section-title"><div><small>{eyebrow}</small><h2>{title}</h2></div>{action&&<button onClick={click}>{action} <Icon name="arrow" size={15}/></button>}</div>; }
function Metric({icon,tone,label,value,suffix,progress,note,click}:{icon:IconName;tone:string;label:string;value:string;suffix:string;progress?:number;note:string;click?:()=>void}) { return <article className="card metric"><span className={`round-icon ${tone}`}><Icon name={icon}/></span><div><small>{label}</small><strong>{value} <em>{suffix}</em></strong>{progress&&<Bar value={progress} blue={tone==="blue"}/>}<button disabled={!click} onClick={click}>{note}</button></div></article>; }
function Agenda({time,title,sub,blue,play,click}:{time:string;title:string;sub:string;blue?:boolean;play?:boolean;click?:()=>void}) { return <div className="agenda"><time>{time}</time><i className={blue?"blue":""}/><div><strong>{title}</strong><small>{sub}</small></div><button onClick={click}><Icon name={play?"play":"arrow"} size={15}/></button></div>; }
function Achievement({initials,title,sub,change,blue}:{initials:string;title:string;sub:string;change:string;blue?:boolean}) { return <div className="achievement"><span className={blue?"blue":""}>{initials}</span><div><strong>{title}</strong><small>{sub}</small></div><b>{change}</b></div>; }
function Quick({icon,title,sub,click,blue,cyan}:{icon:IconName;title:string;sub:string;click:()=>void;blue?:boolean;cyan?:boolean}) { return <button onClick={click}><span className={blue?"blue":cyan?"cyan":""}><Icon name={icon}/></span><strong>{title}</strong><small>{sub}</small><Icon name="plus" size={17}/></button>; }

function Training({ go, start, notify }: { go:(v:View)=>void; start:()=>void; notify:(s:string)=>void }) {
  const [tab,setTab]=useState<"rutinas"|"progreso">("rutinas");
  return <><Header eyebrow="PLANIFICA · ENTRENA · MEJORA" title="Entrenamiento" admin={()=>go("admin")}/><div className="tabs"><button className={tab==="rutinas"?"active":""} onClick={()=>setTab("rutinas")}>Mis rutinas</button><button className={tab==="progreso"?"active":""} onClick={()=>setTab("progreso")}>Progreso</button></div>
    {tab==="rutinas"?<><section className="training-lead"><div><span className="tag"><Icon name="fire" size={15}/> HOY</span><h2>Empuje · Pecho y hombro</h2><p>La última vez moviste 5.840 kg. Hoy puedes superarlo.</p><button className="primary" onClick={start}><Icon name="play"/> Empezar ahora</button></div><div className="big-number"><strong>0%</strong><span>0 de 17 series</span></div></section><SectionTitle eyebrow="TU PLAN" title="Rutinas de esta semana" action="+ Crear rutina" click={()=>notify("Nueva rutina preparada")}/><section className="routines">{[["Empuje","Pecho · Hombro · Tríceps","HOY","green","5 ejercicios"],["Tirón","Espalda · Bíceps","VIERNES","blue","6 ejercicios"],["Pierna completa","Cuádriceps · Femoral · Glúteo","DOMINGO","purple","7 ejercicios"]].map(r=><article className="card routine" key={r[0]}><span className={`round-icon ${r[3]}`}><Icon name="gym"/></span><small>{r[2]}</small><h3>{r[0]}</h3><p>{r[1]}</p><footer><span>{r[4]}</span><button onClick={()=>notify(`${r[0]} abierta`)}><Icon name="arrow"/></button></footer></article>)}</section></>:<Progress/>}
  </>;
}

function Progress(){const values=[45,54,52,64,70,75,84];return <><section className="stats"><Stat label="Volumen este mes" value="48.320 kg" note="↑ 12% respecto a julio"/><Stat label="Entrenamientos" value="14 sesiones" note="Objetivo: 16 sesiones"/><Stat label="Récords personales" value="6 nuevos" note="Tu mejor mes"/></section><article className="card chart-card"><SectionTitle eyebrow="PROGRESO DE FUERZA" title="Press banca"/><div className="chart"><aside><span>85</span><span>80</span><span>75</span><span>70</span></aside><div>{values.map((x,i)=><span key={i}><i style={{height:`${x}%`}}/><small>{["Feb","Mar","Abr","May","Jun","Jul","Ago"][i]}</small></span>)}</div></div></article><section className="two-cols records"><article className="card"><SectionTitle eyebrow="RÉCORDS DESTACADOS" title="Tus mejores marcas"/>{[["Press banca","82,5 kg","92 kg 1RM"],["Sentadilla","110 kg","124 kg 1RM"],["Press militar","47,5 kg","53 kg 1RM"]].map((r,i)=><div className="record" key={r[0]}><span className={i===1?"blue":""}><Icon name="trophy"/></span><div><strong>{r[0]}</strong><small>{r[2]}</small></div><b>{r[1]}</b></div>)}</article><article className="card weekly"><SectionTitle eyebrow="OBJETIVO SEMANAL" title="3 de 4 sesiones"/><div className="goal-ring"><strong>75%</strong></div><p>Te falta una sesión para completar la semana.</p></article></section></>}
function Stat({label,value,note}:{label:string;value:string;note:string}){return <article className="card"><small>{label}</small><strong>{value}</strong><p>{note}</p></article>}

function Calendar({go,notify}:{go:(v:View)=>void;notify:(s:string)=>void}){const d=["Lun 10","Mar 11","Mié 12","Jue 13","Vie 14","Sáb 15","Dom 16"];return <><Header eyebrow="SEMANA DEL 10 AL 16 DE AGOSTO" title="Calendario" admin={()=>go("admin")}/><div className="calendar-tools"><button>‹</button><strong>Agosto 2026</strong><button>›</button><button className="outline" onClick={()=>notify("Nuevo evento preparado")}><Icon name="plus"/> Programar</button></div><section className="calendar">{d.map((x,i)=><article className={i===3?"today":""} key={x}><header><small>{x.split(" ")[0]}</small><strong>{x.split(" ")[1]}</strong></header>{i===0&&<Event type="done" tag="COMPLETADO" title="Pierna completa" sub="58 min · 6.240 kg"/>}{i===1&&<Event type="meal" tag="MENÚ" title="Plan alto en proteína" sub="2.180 kcal"/>}{i===3&&<><Event type="work" tag="19:00 · HOY" title="Empuje" sub="5 ejercicios · 55 min"/><Event type="meal" tag="MENÚ" title="Plan diario" sub="4 comidas"/></>}{i===4&&<Event type="blue" tag="18:30" title="Tirón" sub="6 ejercicios · 60 min"/>}{i===6&&<Event type="purple" tag="11:00" title="Pierna completa" sub="7 ejercicios · 65 min"/>}</article>)}</section></>}
function Event({type,tag,title,sub}:{type:string;tag:string;title:string;sub:string}){return <div className={`event ${type}`}><small>{tag}</small><strong>{title}</strong><span>{sub}</span></div>}

function Nutrition({go,notify,waterMl,addWater}:{go:(v:View)=>void;notify:(s:string)=>void;waterMl:number;addWater:(amount:number)=>void}){return <><Header eyebrow="JUEVES, 13 DE AGOSTO" title="Nutrición" admin={()=>go("admin")}/><section className="nutrition-lead"><div><small>RESUMEN DE HOY</small><h2>Vas por buen camino</h2><p>Te quedan 830 kcal para completar tu objetivo diario.</p></div><div className="nutrition-number"><strong>1.420</strong><span>de 2.250 kcal</span></div></section><section className="macros"><Macro name="Proteína" now="122" total="170 g" value={72}/><Macro name="Carbohidratos" now="148" total="250 g" value={59} blue/><Macro name="Grasas" now="46" total="70 g" value={66} orange/></section><section className="nutrition-grid"><article className="card meals"><SectionTitle eyebrow="REGISTRO DIARIO" title="Tus comidas" action="+ Añadir comida" click={()=>notify("Nueva comida preparada")}/>{[["Desayuno","08:15","Avena con yogur y frutos rojos","420 kcal"],["Comida","14:10","Arroz, pollo y verduras","685 kcal"],["Snack","17:30","Plátano y crema de cacahuete","315 kcal"],["Cena","Pendiente","Sin registrar","—"]].map((m,i)=><div className={`meal ${i===3?"empty":""}`} key={m[0]}><span><Icon name="food"/></span><div><strong>{m[0]} <small>{m[1]}</small></strong><p>{m[2]}</p></div><b>{m[3]}</b><button><Icon name={i===3?"plus":"arrow"}/></button></div>)}</article><article className="card hydration"><small>HIDRATACIÓN</small><Icon name="water" size={42}/><strong>{(waterMl/1000).toFixed(2).replace(".",",")} L</strong><span>de 2,5 L</span><Bar value={Math.min(100,waterMl/25)} blue/><div><button onClick={()=>addWater(250)}>+250 ml</button><button onClick={()=>addWater(500)}>+500 ml</button></div><em>Próximo recordatorio: 18:30</em></article></section></>}
function Macro({name,now,total,value,blue,orange}:{name:string;now:string;total:string;value:number;blue?:boolean;orange?:boolean}){return <article className="card"><small>{name}</small><strong>{now} <em>/ {total}</em></strong><span className={`bar ${blue?"blue":orange?"orange":""}`}><i style={{width:`${value}%`}}/></span></article>}

function Profile({go,notify}:{go:(v:View)=>void;notify:(s:string)=>void}){return <><Header eyebrow="CUENTA Y EVOLUCIÓN" title="Mi perfil" admin={()=>go("admin")}/><section className="card profile-lead"><span>DV</span><div><h2>Daniel Valenzuela</h2><p>@danivalen · Miembro desde agosto de 2026</p><footer><b><Icon name="fire"/> 12 días activo</b><b><Icon name="people"/> 8 amigos</b></footer></div><button className="outline" onClick={()=>notify("Edición de perfil preparada")}>Editar perfil</button></section><section className="two-cols"><article className="card body"><SectionTitle eyebrow="EVOLUCIÓN CORPORAL" title="Datos actuales" action="+ Registrar" click={()=>notify("Nuevo registro preparado")}/><div><Stat label="Peso" value="78,4 kg" note="↓ 0,6 kg este mes"/><Stat label="Grasa corporal" value="16,8%" note="Último registro: hoy"/><Stat label="Objetivo" value="76 kg" note="68% completado"/></div><div className="mini-bars">{[70,62,64,50,47,38,30].map((v,i)=><i key={i} style={{height:`${v}%`}}/>)}</div></article><article className="card friends"><SectionTitle eyebrow="AMIGOS" title="Actividad reciente" action="+ Añadir" click={()=>notify("Buscador de amigos abierto")}/>{[["LM","Laura M.","Nuevo récord en sentadilla","Hace 1 h"],["JV","Javi V.","Completó Tirón","Hace 3 h"],["AM","Ana M.","4 entrenamientos esta semana","Ayer"]].map(f=><div key={f[1]}><span>{f[0]}</span><section><strong>{f[1]}</strong><small>{f[2]}</small></section><em>{f[3]}</em></div>)}</article></section><section className="card settings">{[["shield","Privacidad y permisos","Controla qué compartes con cada amistad"],["bell","Notificaciones","Entrenamientos, agua y actividad social"],["settings","Configuración","Cuenta, unidades y preferencias"]].map((x,i)=><button key={x[1]} onClick={()=>notify(`${x[1]} abierto`)}><span className={i===1?"blue":i===2?"purple":""}><Icon name={x[0] as IconName}/></span><div><strong>{x[1]}</strong><small>{x[2]}</small></div><Icon name="arrow"/></button>)}</section></>}

function Admin({go,notify}:{go:(v:View)=>void;notify:(s:string)=>void}){return <><Header eyebrow="FITVALEN · ADMINISTRADOR PRINCIPAL" title="Panel de administración" admin={()=>go("perfil")}/><section className="admin-stats"><AdminStat icon="people" label="USUARIOS ACTIVOS" value="12" note="+2 este mes"/><AdminStat icon="gym" label="ENTRENAMIENTOS" value="47" note="Esta semana" blue/><AdminStat icon="clock" label="PENDIENTES" value="8" note="Por validar" orange/><AdminStat icon="chart" label="ACTIVIDAD" value="84%" note="Usuarios activos" purple/></section><section className="admin-grid"><article className="card approvals"><SectionTitle eyebrow="PENDIENTES" title="Solicitudes de validación" action="Ver todas" click={()=>notify("Solicitudes abiertas")}/>{[["gym","Ejercicio","Remo unilateral en polea","Laura M."],["food","Alimento","Yogur proteico natural","Javi V."],["apple","Receta","Tortitas de avena y plátano","Ana M."]].map((x,i)=><div key={x[2]}><span className={i===1?"blue":i===2?"orange":""}><Icon name={x[0] as IconName}/></span><section><small>{x[1].toUpperCase()}</small><strong>{x[2]}</strong><p>Enviado por {x[3]}</p></section><button className="yes" onClick={()=>notify(`${x[2]} validado`)}><Icon name="check"/></button><button className="no" onClick={()=>notify(`${x[2]} rechazado`)}><Icon name="close"/></button></div>)}</article><article className="card next"><SectionTitle eyebrow="PRÓXIMOS" title="Programación"/>{[["Hoy · 19:00","Daniel","Empuje"],["Viernes · 18:30","Laura","Pierna completa"],["Sábado · 10:00","Javi","Tirón"]].map((x,i)=><div key={x[1]}><span className={i===1?"blue":""}><Icon name="calendar"/></span><section><small>{x[0]}</small><strong>{x[2]}</strong><p>{x[1]}</p></section></div>)}</article></section><SectionTitle eyebrow="GESTIÓN RÁPIDA" title="Herramientas"/><section className="tools">{[["people","Usuarios y roles","Gestiona accesos y permisos"],["gym","Rutinas y catálogo","Crea y asigna entrenamientos"],["apple","Nutrición y menús","Alimentos, recetas y planes"],["settings","Configuración","Opciones generales de FitValen"]].map(x=><button key={x[1]} onClick={()=>notify(`${x[1]} abierto`)}><span><Icon name={x[0] as IconName}/></span><div><strong>{x[1]}</strong><small>{x[2]}</small></div><Icon name="arrow"/></button>)}</section></>}
function AdminStat({icon,label,value,note,blue,orange,purple}:{icon:IconName;label:string;value:string;note:string;blue?:boolean;orange?:boolean;purple?:boolean}){return <article className="card"><span className={blue?"blue":orange?"orange":purple?"purple":""}><Icon name={icon}/></span><div><small>{label}</small><strong>{value}</strong><p>{note}</p></div></article>}

function Workout({close,notify,sets,setSets,weights,repetitions,setNumbers}:{close:()=>void;notify:(s:string)=>void;sets:boolean[];setSets:(sets:boolean[])=>void;weights:number[];repetitions:number[];setNumbers:(kind:"weight"|"repetitions",index:number,value:number)=>void}){const [rest,setRest]=useState(90);return <div className="overlay"><section className="workout-sheet"><header><button className="icon-btn" onClick={close}><Icon name="close"/></button><div><small>ENTRENAMIENTO EN CURSO</small><strong>Empuje · Pecho y hombro</strong></div><time>08:42</time></header><Bar value={sets.length?sets.filter(Boolean).length/sets.length*100:0}/><main><div className="exercise-head"><div><small>EJERCICIO 1 DE 5</small><h2>Press banca</h2><p>Pecho · Empuje horizontal</p></div><button onClick={()=>notify("3 alternativas encontradas")}>Ver alternativas <Icon name="arrow"/></button></div><div className="previous"><Icon name="clock"/><span>Sesión anterior</span><strong>4 × 8 · 70 kg</strong></div><div className="set-table"><header><span>Serie</span><span>Anterior</span><span>Kg</span><span>Reps</span><span>Hecha</span></header>{sets.map((done,i)=><div className={done?"done":""} key={i}><b>{i+1}</b><small>70 × 8</small><input aria-label={`Peso serie ${i+1}`} type="number" min="0" value={weights[i]??0} onChange={(event)=>setNumbers("weight",i,Number(event.target.value))}/><input aria-label={`Repeticiones serie ${i+1}`} type="number" min="0" value={repetitions[i]??0} onChange={(event)=>setNumbers("repetitions",i,Number(event.target.value))}/><button onClick={()=>{setSets(sets.map((value,index)=>index===i?!value:value));if(!done){setRest(90);notify("Serie completada · guardando…")}}}><Icon name="check"/></button></div>)}</div><button className="add-set" onClick={()=>{setSets([...sets,false]);notify("Serie adicional añadida")}}><Icon name="plus"/> Añadir serie</button><div className="timer"><span><Icon name="clock"/> Descanso</span><button onClick={()=>setRest(x=>Math.max(0,x-15))}>−15</button><strong>{Math.floor(rest/60)}:{String(rest%60).padStart(2,"0")}</strong><button onClick={()=>setRest(x=>x+15)}>+15</button><button className="skip" onClick={()=>setRest(0)}>Saltar</button></div></main><footer><button className="outline" onClick={()=>notify("Entrenamiento guardado como incompleto")}>Finalizar incompleto</button><button className="primary" onClick={()=>notify("Siguiente: press inclinado")}>Siguiente ejercicio <Icon name="arrow"/></button></footer></section></div>}

export default function Page(){
  const [view,setView]=useState<View>("inicio");
  const [workout,setWorkout]=useState(false);
  const [toast,setToast]=useState("");
  const [session,setSession]=useState<"checking"|"authenticated"|"anonymous">("checking");
  const [user,setUser]=useState<SessionUser|null>(null);
  const [data,setData]=useState<FitValenState>(()=>createDefaultState("Daniel Valenzuela","admin"));
  const [saveStatus,setSaveStatus]=useState<"idle"|"saving"|"saved"|"error">("idle");
  const hydrated=useRef(false);

  async function loadData(currentUser:SessionUser){
    const response=await fetch("/api/state",{cache:"no-store"});
    if(!response.ok)throw new Error("No se pudieron cargar tus datos.");
    const payload=await response.json() as {state:FitValenState};
    setData(payload.state);
    setUser(currentUser);
    setSession("authenticated");
    hydrated.current=true;
  }

  useEffect(()=>{
    fetch("/api/auth/session",{cache:"no-store"})
      .then(async response=>{
        if(!response.ok)throw new Error("anonymous");
        const payload=await response.json() as {user:SessionUser};
        await loadData(payload.user);
      })
      .catch(()=>{hydrated.current=false;setUser(null);setSession("anonymous")});
  },[]);

  useEffect(()=>{
    if(!hydrated.current||session!=="authenticated")return;
    setSaveStatus("saving");
    const timer=setTimeout(()=>{
      fetch("/api/state",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(data)})
        .then(response=>{if(!response.ok)throw new Error();setSaveStatus("saved")})
        .catch(()=>setSaveStatus("error"));
    },450);
    return()=>clearTimeout(timer);
  },[data,session]);

  const notify=(message:string)=>{setToast(message);setTimeout(()=>setToast(""),2200)};
  const addActivity=(type:FitValenState["activity"][number]["type"],message:string)=>({id:crypto.randomUUID(),type,message,createdAt:new Date().toISOString()});
  const addWater=(amount:number)=>{setData(current=>({...current,hydration:{...current.hydration,waterMl:Math.min(20000,current.hydration.waterMl+amount)},activity:[...current.activity,addActivity("water",`+${amount} ml de agua`)]}));notify(`+${amount} ml añadidos · guardando…`)};
  const setSets=(sets:boolean[])=>setData(current=>({...current,workout:{...current.workout,completedSets:sets,weightsKg:sets.map((_,index)=>current.workout.weightsKg[index]??70),repetitions:sets.map((_,index)=>current.workout.repetitions[index]??8)},activity:[...current.activity,addActivity("workout","Estado del entrenamiento actualizado")]}));
  const setNumbers=(kind:"weight"|"repetitions",index:number,value:number)=>setData(current=>{const key=kind==="weight"?"weightsKg":"repetitions";const values=[...current.workout[key]];values[index]=Number.isFinite(value)?Math.max(0,value):0;return{...current,workout:{...current.workout,[key]:values}}});
  const signOut=async()=>{await fetch("/api/auth/logout",{method:"POST"});hydrated.current=false;setUser(null);setSession("anonymous");setView("inicio")};

  if(session==="checking")return <main className="login-page"><div className="loading-mark">FV</div><p>Abriendo FitValen…</p></main>;
  if(session==="anonymous")return <LoginScreen onLogin={loadData}/>;

  return <div className="shell"><aside><button className="brand" onClick={()=>setView("inicio")}><span>FV</span><strong>FitValen</strong></button><nav>{nav.map(x=><button className={view===x.id?"active":""} key={x.id} onClick={()=>setView(x.id)}><Icon name={x.icon}/><span>{x.label}</span>{x.id==="entrenamiento"&&<i/>}</button>)}</nav><div className="aside-bottom">{user?.role==="admin"&&<button className={view==="admin"?"active":""} onClick={()=>setView("admin")}><Icon name="shield"/> Administración</button>}<button onClick={signOut}><Icon name="close"/> Cerrar sesión</button><section><div><Icon name="fire"/><span><strong>{saveStatus==="saving"?"Guardando…":saveStatus==="error"?"Error al guardar":"Datos seguros"}</strong><small>{saveStatus==="saved"?"Guardados en la VPS":"Sesión persistente"}</small></span></div><Bar value={saveStatus==="saved"?100:75}/></section></div></aside><main>{view==="inicio"&&<Home go={setView} start={()=>setWorkout(true)} notify={notify} waterMl={data.hydration.waterMl} addWater={addWater}/>} {view==="entrenamiento"&&<Training go={setView} start={()=>setWorkout(true)} notify={notify}/>} {view==="calendario"&&<Calendar go={setView} notify={notify}/>} {view==="nutricion"&&<Nutrition go={setView} notify={notify} waterMl={data.hydration.waterMl} addWater={addWater}/>} {view==="perfil"&&<Profile go={setView} notify={notify}/>} {view==="admin"&&user?.role==="admin"&&<Admin go={setView} notify={notify}/>}<div className="end-space"/></main><nav className="mobile-nav">{nav.map(x=><button className={view===x.id?"active":""} key={x.id} onClick={()=>setView(x.id)}><Icon name={x.icon}/><small>{x.label}</small></button>)}</nav>{workout&&<Workout close={()=>setWorkout(false)} notify={notify} sets={data.workout.completedSets} setSets={setSets} weights={data.workout.weightsKg} repetitions={data.workout.repetitions} setNumbers={setNumbers}/>} {toast&&<div className="toast"><Icon name="check"/>{toast}</div>}</div>
}
