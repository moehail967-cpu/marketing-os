import type { Brand, CharacterProfile, GenerationOutput, Skill } from "@/lib/types";
import { base64ToBytes, bytesToBase64, readAssetForModel, storeGenerated } from "@/lib/server-storage";
import { getStudioEnvironment } from "@/lib/server-env";

type GenerateRequest={contentType:string;platforms:string[];objective:string;creativeMode:string;brief:string;referenceUrl?:string;quality?:string};
const apiBase="https://generativelanguage.googleapis.com/v1beta", interactionsBase="https://generativelanguage.googleapis.com/v1beta2";
export const isAiConfigured=()=>Boolean(getStudioEnvironment().GEMINI_API_KEY);
const platformLabel=(id:string)=>({instagram:"إنستجرام",facebook:"فيسبوك",x:"X",linkedin:"لينكدإن",tiktok:"تيك توك"} as Record<string,string>)[id]||id;
const objectiveLabel=(id:string)=>({awareness:"زيادة الوعي",engagement:"زيادة التفاعل",leads:"الحصول على عملاء",sales:"زيادة المبيعات",launch:"إطلاق جديد",trust:"بناء الثقة"} as Record<string,string>)[id]||id;

function campaignContext(brand:Brand,character:CharacterProfile|undefined,skill:Skill|undefined,request:GenerateRequest){return `
أنت مدير إبداعي وتسويقي عربي. أنشئ حملة أصلية قابلة للنشر. لا تخترع أرقامًا أو عروضًا أو حقائق.

البراند: ${brand.name} — ${brand.type} / ${brand.category}
الوصف: ${brand.description}
الجمهور والسوق: ${brand.audience} — ${brand.market}
اللغة والنبرة: ${brand.language} — ${brand.tone}
الألوان: ${brand.colors.join(", ")}
الدعوة المفضلة: ${brand.preferredCtas}
الممنوعات: ${brand.forbiddenPhrases}
المعرفة: ${brand.sourceText.slice(0,18000)}

الشخصية: ${character?`${character.name}، ${character.role}. ${character.persona}. المظهر: ${character.appearance}. الملابس: ${character.wardrobe}. القيود: ${character.restrictions}`:"بدون شخصية؛ ركز على المنتج أو المشهد."}
المهارة: ${skill?`${skill.name}: ${skill.description}\n${skill.markdown.slice(0,12000)}`:"استخدم أفضل ممارسات محتوى السوشيال ميديا."}

الطلب: ${request.contentType} لمنصات ${request.platforms.map(platformLabel).join("، ")} بهدف ${objectiveLabel(request.objective)}.
طريقة الفكرة: ${request.creativeMode}. المرجع: ${request.referenceUrl||"لا يوجد"}.
توجيه المستخدم: ${request.brief}

ضع فكرة مركزية واحدة ونسخة مختلفة لكل منصة. اكتب البرومبت البصري بالإنجليزية. لا تطلب من مولد الصورة رسم شعار أو كتابة؛ سيضيف التطبيق النص لاحقًا.`}

const schema={type:"object",properties:{concept:{type:"string"},angle:{type:"string"},visualPrompt:{type:"string"},onImageText:{type:"string"},palette:{type:"array",items:{type:"string"}},altText:{type:"string"},qualityNotes:{type:"array",items:{type:"string"}},platformCopies:{type:"array",items:{type:"object",properties:{platform:{type:"string"},caption:{type:"string"},headline:{type:"string"},cta:{type:"string"},hashtags:{type:"array",items:{type:"string"}}},required:["platform","caption","headline","cta","hashtags"]}}},required:["concept","angle","visualPrompt","onImageText","palette","altText","qualityNotes","platformCopies"]};

async function planWithGemini(context:string):Promise<GenerationOutput>{
  const env=getStudioEnvironment();
  const response=await fetch(`${interactionsBase}/interactions`,{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":env.GEMINI_API_KEY||""},body:JSON.stringify({model:env.GEMINI_TEXT_MODEL||"gemini-3.7-flash",input:context,response_format:[{type:"text",mime_type:"application/json",schema}]})});
  if(!response.ok)throw new Error(`Gemini planning failed: ${response.status}`);
  const data=await response.json() as {output_text?:string;steps?:Array<{type?:string;content?:Array<{type?:string;text?:string}>}>};
  const text=data.output_text||data.steps?.filter(s=>s.type==="model_output").flatMap(s=>s.content||[]).filter(x=>x.type==="text").map(x=>x.text||"").join("");
  if(!text)throw new Error("Gemini returned an empty plan"); return {...JSON.parse(text),provider:"gemini"} as GenerationOutput;
}

function demoPlan(brand:Brand,request:GenerateRequest):GenerationOutput{
  const message=request.brief||`قدّم ${brand.name} من زاوية تركز على القيمة التي يحصل عليها العميل.`;
  return {concept:`لحظة التحول مع ${brand.name}`,angle:`ربط الفائدة اليومية للعميل بهدف ${objectiveLabel(request.objective)} بدل الحديث العام عن المزايا.`,visualPrompt:`Premium editorial advertising scene for ${brand.name}, authentic Middle Eastern setting, clean composition, ample negative space for Arabic headline, brand palette ${brand.colors.join(" ")||"deep indigo and warm white"}, cinematic commercial photography, no text, no logo, no watermark`,onImageText:message.length>92?message.slice(0,89)+"…":message,palette:brand.colors.length?brand.colors:["#6256E8","#A899FF","#17152A"],altText:`تصميم إعلاني حديث لبراند ${brand.name}.`,qualityNotes:["تمت مراعاة نبرة البراند","النص والشعار يضافان كطبقات قابلة للتعديل","راجع تفاصيل العرض قبل النشر"],platformCopies:request.platforms.map(platform=>({platform,headline:`خلّ ${brand.name} أقرب لعملائك`,caption:`${message}\n\nمع ${brand.name}، الفكرة مش مجرد ظهور أكثر؛ الفكرة إن رسالتك توصل للشخص المناسب بشكل واضح ومقنع.\n\nجاهز تبدأ؟`,cta:brand.preferredCtas||"تواصل معنا لمعرفة التفاصيل",hashtags:[`#${brand.name.replaceAll(" ","_")}`,"#تسويق",`#${platformLabel(platform).replaceAll(" ","_")}`]})),provider:"demo"};
}
const aspect=(platforms:string[],type:string)=>type==="video"||platforms.includes("tiktok")?"9:16":platforms.includes("instagram")||platforms.includes("facebook")?"4:5":"16:9";
async function references(ownerId:string,brand:Brand,character?:CharacterProfile){const urls=[brand.logoUrl,...(character?.imageUrls||[]).slice(0,4)].filter(Boolean),parts:Record<string,unknown>[]=[];for(const url of urls){const asset=await readAssetForModel(url,ownerId);if(asset)parts.push({inlineData:{mimeType:asset.mimeType,data:bytesToBase64(asset.bytes)}})}return parts}
async function generateImage(ownerId:string,plan:GenerationOutput,brand:Brand,character:CharacterProfile|undefined,request:GenerateRequest){
  const env=getStudioEnvironment();if(!env.GEMINI_API_KEY)return undefined;
  const response=await fetch(`${apiBase}/models/${env.GEMINI_IMAGE_MODEL||"gemini-3.1-flash-image"}:generateContent`,{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":env.GEMINI_API_KEY},body:JSON.stringify({contents:[{role:"user",parts:[{text:`${plan.visualPrompt}\nCreate an original advertising visual. Preserve provided character identity. No words, letters, logo, UI, border, or watermark.`},...(await references(ownerId,brand,character))]}],generationConfig:{responseModalities:["IMAGE"],imageConfig:{aspectRatio:aspect(request.platforms,request.contentType),imageSize:request.quality==="pro"?"2K":"1K"}}})});
  if(!response.ok)throw new Error(`Gemini image failed: ${response.status}`);const data=await response.json() as {candidates?:Array<{content?:{parts?:Array<{inlineData?:{data?:string;mimeType?:string}}>} }>};const inline=data.candidates?.[0]?.content?.parts?.find(p=>p.inlineData?.data)?.inlineData;if(!inline?.data)throw new Error("Gemini returned no image");return storeGenerated(ownerId,base64ToBytes(inline.data),inline.mimeType||"image/png","png","generated-image");
}
export async function createCampaign(ownerId:string,brand:Brand,character:CharacterProfile|undefined,skill:Skill|undefined,request:GenerateRequest){const plan=isAiConfigured()?await planWithGemini(campaignContext(brand,character,skill,request)):demoPlan(brand,request);if(!["video","text"].includes(request.contentType)&&isAiConfigured())plan.imageUrl=await generateImage(ownerId,plan,brand,character,request);return plan}
export async function startVideo(ownerId:string,plan:GenerationOutput,brand:Brand,character:CharacterProfile|undefined,platforms:string[]){
  const env=getStudioEnvironment();if(!env.GEMINI_API_KEY)return null;const referenceImages=[];for(const url of(character?.imageUrls||[]).slice(0,3)){const asset=await readAssetForModel(url,ownerId);if(asset)referenceImages.push({image:{inlineData:{mimeType:asset.mimeType,data:bytesToBase64(asset.bytes)}},referenceType:"asset"})}
  const response=await fetch(`${apiBase}/models/${env.GEMINI_VIDEO_MODEL||"veo-3.1-lite-generate-preview"}:predictLongRunning`,{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":env.GEMINI_API_KEY},body:JSON.stringify({instances:[{prompt:`${plan.visualPrompt}. Native sound, no dialogue, text or logo. Brand: ${brand.name}.`,...(referenceImages.length?{referenceImages}:{})}],parameters:{aspectRatio:platforms.includes("tiktok")||platforms.includes("instagram")?"9:16":"16:9",resolution:"720p",durationSeconds:8,sampleCount:1}})});if(!response.ok)throw new Error(`Veo start failed: ${response.status}`);const data=await response.json() as {name?:string};if(!data.name)throw new Error("Veo returned no operation name");return data.name;
}
export async function pollVideo(ownerId:string,operationName:string){
  const env=getStudioEnvironment();if(!env.GEMINI_API_KEY)return{done:true,error:"AI is not configured"};const response=await fetch(`${apiBase}/${operationName}`,{headers:{"x-goog-api-key":env.GEMINI_API_KEY}});if(!response.ok)throw new Error(`Veo status failed: ${response.status}`);const data=await response.json() as {done?:boolean;error?:{message?:string};response?:{generateVideoResponse?:{generatedSamples?:Array<{video?:{uri?:string}}>}}};if(!data.done)return{done:false};if(data.error)return{done:true,error:data.error.message||"Video generation failed"};const uri=data.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;if(!uri)return{done:true,error:"Veo returned no video URL"};const video=await fetch(uri,{headers:{"x-goog-api-key":env.GEMINI_API_KEY},redirect:"follow"});if(!video.ok)return{done:true,error:"Could not download generated video"};return{done:true,url:await storeGenerated(ownerId,new Uint8Array(await video.arrayBuffer()),video.headers.get("content-type")||"video/mp4","mp4","generated-video")};
}
