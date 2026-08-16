"use client";

import { Bot,Boxes,CircleAlert,CircleCheck,FileCode2,Library,Menu,Settings,ShieldCheck,Sparkles,UsersRound,WandSparkles,X } from "lucide-react";
import { useCallback,useEffect,useState } from "react";
import type { Brand,CharacterProfile,Skill,StudioBootstrap } from "@/lib/types";
import { BrandModal,CharacterModal,SkillModal } from "./studio-modals";
import { BrandsSection,CharactersSection,GenerateSection,LibrarySection,PageLoader,SettingsSection,SkillsSection } from "./studio-sections";

export type StudioSection="generate"|"library"|"brands"|"characters"|"skills"|"settings";
type Editor={kind:"brand";item?:Brand}|{kind:"character";item?:CharacterProfile}|{kind:"skill";item?:Skill}|null;
const nav:[StudioSection,string,string,typeof Sparkles][]=[
  ["generate","توليد","/",WandSparkles],["library","مكتبة المحتوى","/library",Library],["brands","البراندات","/brands",Boxes],
  ["characters","الشخصيات","/characters",UsersRound],["skills","المهارات","/skills",FileCode2],["settings","الإعدادات","/settings",Settings],
];

export async function jsonRequest<T>(url:string,init?:RequestInit):Promise<T>{const response=await fetch(url,{...init,headers:{"Content-Type":"application/json",...(init?.headers||{})}});const payload=await response.json() as T&{error?:string};if(!response.ok)throw new Error(payload.error||"حدث خطأ غير متوقع");return payload}

export default function StudioApp({section}:{section:StudioSection}){
  const [data,setData]=useState<StudioBootstrap>({brands:[],characters:[],skills:[],generations:[],aiConfigured:false,owner:""});
  const [loading,setLoading]=useState(true),[loadError,setLoadError]=useState(""),[editor,setEditor]=useState<Editor>(null),[menu,setMenu]=useState(false),[toast,setToast]=useState("");
  const load=useCallback(async(silent=false)=>{await Promise.resolve();if(!silent){setLoading(true);setLoadError("")}try{setData(await jsonRequest<StudioBootstrap>("/api/bootstrap"))}catch(error){if(!silent)setLoadError(error instanceof Error?error.message:"تعذر تحميل البيانات")}finally{if(!silent)setLoading(false)}},[]);
  useEffect(()=>{const timer=window.setTimeout(()=>void load(),0);return()=>window.clearTimeout(timer)},[load]);
  useEffect(()=>{if(!toast)return;const timer=window.setTimeout(()=>setToast(""),3200);return()=>window.clearTimeout(timer)},[toast]);
  async function remove(entity:"brand"|"character"|"skill"|"generation",id:string){if(!window.confirm("هل تريد حذف هذا العنصر؟"))return;try{await jsonRequest("/api/entities",{method:"DELETE",body:JSON.stringify({entity,id})});setToast("تم الحذف");await load(true)}catch(error){setToast(error instanceof Error?error.message:"تعذر الحذف")}}
  const title=nav.find(([key])=>key===section)?.[1]||"استوديو المحتوى";
  return <div className="studio-root">
    <aside className={`sidebar ${menu?"sidebar-open":""}`}>
      <div className="brand-lockup"><div className="brand-mark"><Sparkles size={21}/></div><div><strong>استوديو المحتوى</strong><span>BRAND INTELLIGENCE</span></div><button className="icon-button sidebar-close" onClick={()=>setMenu(false)}><X size={19}/></button></div>
      <nav className="nav-list"><span className="nav-eyebrow">مساحة العمل</span>{nav.map(([key,label,href,Icon])=><a key={key} href={href} className={`nav-item ${section===key?"active":""}`}><Icon size={19}/><span>{label}</span>{section===key&&<i/>}</a>)}</nav>
      <div className="sidebar-status"><div className="status-orb"><Bot size={18}/></div><div><strong>{data.aiConfigured?"Gemini متصل":"وضع العرض"}</strong><span>{data.aiConfigured?"التوليد الاحترافي جاهز":"أضف المفتاح لتفعيل الصور"}</span></div><span className={`online-dot ${data.aiConfigured?"connected":""}`}/></div>
      <div className="sidebar-foot"><ShieldCheck size={16}/>مساحة خاصة وآمنة</div>
    </aside>
    {menu&&<button className="mobile-backdrop" onClick={()=>setMenu(false)}/>} 
    <main className="studio-main"><header className="topbar"><div className="topbar-title"><button className="icon-button mobile-menu" onClick={()=>setMenu(true)}><Menu size={21}/></button><div><span>استوديو المحتوى /</span><strong>{title}</strong></div></div><div className="topbar-actions"><div className="health-pill"><span className={data.aiConfigured?"pulse":"pulse amber"}/>{data.aiConfigured?"الذكاء جاهز":"عرض تجريبي"}</div><button className="avatar-button" title={data.owner||"حسابك"}>م</button></div></header>
      <div className="page-wrap">{loading?<PageLoader/>:loadError?<div className="empty-state error-state"><CircleAlert size={35}/><h2>تعذر فتح الاستوديو</h2><p>{loadError}</p><button className="primary-button" onClick={()=>void load()}><CircleCheck size={17}/>إعادة المحاولة</button></div>:<>
        {section==="generate"&&<GenerateSection key={data.brands.map(brand=>brand.id).join("|")} data={data} onCreated={()=>load(true)} onAddBrand={()=>setEditor({kind:"brand"})} setToast={setToast}/>} 
        {section==="brands"&&<BrandsSection brands={data.brands} onAdd={()=>setEditor({kind:"brand"})} onEdit={item=>setEditor({kind:"brand",item})} onDelete={id=>void remove("brand",id)}/>} 
        {section==="characters"&&<CharactersSection characters={data.characters} brands={data.brands} onAdd={()=>setEditor({kind:"character"})} onEdit={item=>setEditor({kind:"character",item})} onDelete={id=>void remove("character",id)}/>} 
        {section==="skills"&&<SkillsSection skills={data.skills} onAdd={()=>setEditor({kind:"skill"})} onEdit={item=>setEditor({kind:"skill",item})} onDelete={id=>void remove("skill",id)}/>} 
        {section==="library"&&<LibrarySection generations={data.generations} brands={data.brands} onDelete={id=>void remove("generation",id)} setToast={setToast}/>} 
        {section==="settings"&&<SettingsSection data={data}/>} 
      </>}</div>
    </main>
    {editor?.kind==="brand"&&<BrandModal initial={editor.item} onClose={()=>setEditor(null)} onSaved={async()=>{setEditor(null);setToast("تم حفظ البراند");await load(true)}}/>}
    {editor?.kind==="character"&&<CharacterModal initial={editor.item} brands={data.brands} onClose={()=>setEditor(null)} onSaved={async()=>{setEditor(null);setToast("تم حفظ الشخصية");await load(true)}}/>}
    {editor?.kind==="skill"&&<SkillModal initial={editor.item} onClose={()=>setEditor(null)} onSaved={async()=>{setEditor(null);setToast("تم حفظ المهارة");await load(true)}}/>}
    {toast&&<div className="toast"><CircleCheck size={18}/>{toast}</div>}
  </div>
}
