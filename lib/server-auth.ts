export function ownerFromRequest(request:Request) {
  return (request.headers.get("oai-authenticated-user-email") || "private-studio-owner").trim().toLowerCase().slice(0,180);
}
export function safeId(prefix:string) { return `${prefix}_${crypto.randomUUID().replaceAll("-","")}`; }
export function cleanString(value:unknown,max=2000) { return typeof value === "string" ? value.trim().slice(0,max) : ""; }
export function cleanStringArray(value:unknown,max=30) { return Array.isArray(value) ? value.map(v=>cleanString(v,500)).filter(Boolean).slice(0,max) : []; }
