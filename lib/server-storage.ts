import { getDb } from "@/db";
import { assets } from "@/db/schema";
import { safeId } from "@/lib/server-auth";
import { getStudioEnvironment } from "@/lib/server-env";

const allowed=new Set(["application/pdf","text/plain","text/markdown","application/json","application/vnd.openxmlformats-officedocument.wordprocessingml.document"]);
const safeName=(name:string)=>name.normalize("NFKC").replace(/[^\p{L}\p{N}._-]+/gu,"-").slice(-120)||"asset";
export async function storeUpload(ownerId:string,file:File,purpose="asset") {
  const bucket=getStudioEnvironment().BUCKET;
  if(!bucket) throw new Error("تخزين الملفات غير متاح");
  if(!file.size||file.size>20*1024*1024) throw new Error("حجم الملف يجب أن يكون أقل من 20 ميجابايت");
  if(!(file.type.startsWith("image/")||file.type.startsWith("video/")||file.type.startsWith("font/")||allowed.has(file.type))) throw new Error("نوع الملف غير مدعوم");
  const key=`${ownerId.replace(/[^a-z0-9]/gi,"-").slice(0,42)}-${crypto.randomUUID()}-${safeName(file.name)}`;
  await bucket.put(key,await file.arrayBuffer(),{httpMetadata:{contentType:file.type,cacheControl:"private, max-age=3600"},customMetadata:{ownerId,purpose}});
  await getDb().insert(assets).values({id:safeId("asset"),ownerId,key,fileName:file.name.slice(0,240),mimeType:file.type,size:file.size,purpose});
  return {key,url:`/api/assets/${encodeURIComponent(key)}`,name:file.name,mimeType:file.type,size:file.size};
}
export async function storeGenerated(ownerId:string,bytes:Uint8Array,mimeType:string,extension:string,purpose:string) {
  const bucket=getStudioEnvironment().BUCKET; if(!bucket) throw new Error("تخزين الملفات غير متاح");
  const key=`${ownerId.replace(/[^a-z0-9]/gi,"-").slice(0,42)}-${crypto.randomUUID()}-generated.${extension}`;
  await bucket.put(key,bytes,{httpMetadata:{contentType:mimeType,cacheControl:"private, max-age=86400"},customMetadata:{ownerId,purpose}});
  await getDb().insert(assets).values({id:safeId("asset"),ownerId,key,fileName:`generated.${extension}`,mimeType,size:bytes.byteLength,purpose});
  return `/api/assets/${encodeURIComponent(key)}`;
}
export async function readAssetForModel(url:string|undefined,ownerId:string) {
  const bucket=getStudioEnvironment().BUCKET, marker="/api/assets/"; if(!bucket||!url?.includes(marker)) return null;
  const key=decodeURIComponent(url.slice(url.indexOf(marker)+marker.length)); const object=await bucket.get(key);
  if(!object||object.customMetadata?.ownerId!==ownerId) return null;
  return {bytes:new Uint8Array(await object.arrayBuffer()),mimeType:object.httpMetadata?.contentType||"image/png"};
}
export function bytesToBase64(bytes:Uint8Array){let output="";for(let i=0;i<bytes.length;i+=0x8000)output+=String.fromCharCode(...bytes.subarray(i,Math.min(i+0x8000,bytes.length)));return btoa(output)}
export function base64ToBytes(value:string){const raw=atob(value),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);return bytes}
