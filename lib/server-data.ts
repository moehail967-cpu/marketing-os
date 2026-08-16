import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { brands, characters, generations, skills } from "@/db/schema";
import { cleanString, cleanStringArray, safeId } from "@/lib/server-auth";
import type { Brand, CharacterProfile, Generation, Skill } from "@/lib/types";

const stripOwner = <T extends Record<string,unknown>>(row:T) => { const {ownerId:_,...rest}=row; void _; return rest; };

export async function listStudioData(ownerId:string) {
  const db=getDb();
  const [brandRows,characterRows,skillRows,generationRows]=await Promise.all([
    db.select().from(brands).where(eq(brands.ownerId,ownerId)).orderBy(desc(brands.updatedAt)),
    db.select().from(characters).where(eq(characters.ownerId,ownerId)).orderBy(desc(characters.updatedAt)),
    db.select().from(skills).where(eq(skills.ownerId,ownerId)).orderBy(desc(skills.updatedAt)),
    db.select().from(generations).where(eq(generations.ownerId,ownerId)).orderBy(desc(generations.updatedAt)).limit(100),
  ]);
  return {
    brands:brandRows.map(stripOwner) as unknown as Brand[],
    characters:characterRows.map(stripOwner) as unknown as CharacterProfile[],
    skills:skillRows.map(stripOwner) as unknown as Skill[],
    generations:generationRows.map(row=>({...stripOwner(row),costEstimate:row.costEstimateCents})) as unknown as Generation[],
  };
}

export async function saveBrand(ownerId:string, body:Record<string,unknown>) {
  const id=cleanString(body.id,120)||safeId("brand"); const now=new Date().toISOString();
  const values={id,ownerId,name:cleanString(body.name,180),type:cleanString(body.type,80)||"تطبيق",category:cleanString(body.category,160),description:cleanString(body.description,12000),website:cleanString(body.website,1000),audience:cleanString(body.audience,4000),market:cleanString(body.market,300)||"اليمن",language:cleanString(body.language,300)||"العربية",tone:cleanString(body.tone,1000)||"واضحة واحترافية",colors:cleanStringArray(body.colors,12),fonts:cleanStringArray(body.fonts,12),logoUrl:cleanString(body.logoUrl,1200),sourceText:cleanString(body.sourceText,50000),sourceUrls:cleanStringArray(body.sourceUrls,40),preferredCtas:cleanString(body.preferredCtas,2000),forbiddenPhrases:cleanString(body.forbiddenPhrases,4000),status:"ready",updatedAt:now};
  if(!values.name) throw new Error("اسم البراند مطلوب");
  await getDb().insert(brands).values({...values,createdAt:now}).onConflictDoUpdate({target:brands.id,set:values});
  const [row]=await getDb().select().from(brands).where(and(eq(brands.id,id),eq(brands.ownerId,ownerId))).limit(1); return stripOwner(row) as unknown as Brand;
}

export async function saveCharacter(ownerId:string, body:Record<string,unknown>) {
  const id=cleanString(body.id,120)||safeId("character"); const now=new Date().toISOString();
  const values={id,ownerId,name:cleanString(body.name,180),role:cleanString(body.role,300)||"شخصية إعلانية",persona:cleanString(body.persona,12000),appearance:cleanString(body.appearance,6000),wardrobe:cleanString(body.wardrobe,6000),voice:cleanString(body.voice,3000),restrictions:cleanString(body.restrictions,5000),brandIds:cleanStringArray(body.brandIds,50),imageUrls:cleanStringArray(body.imageUrls,10),active:body.active!==false,updatedAt:now};
  if(!values.name) throw new Error("اسم الشخصية مطلوب");
  await getDb().insert(characters).values({...values,createdAt:now}).onConflictDoUpdate({target:characters.id,set:values});
  const [row]=await getDb().select().from(characters).where(and(eq(characters.id,id),eq(characters.ownerId,ownerId))).limit(1); return stripOwner(row) as unknown as CharacterProfile;
}

export async function saveSkill(ownerId:string, body:Record<string,unknown>) {
  const id=cleanString(body.id,120)||safeId("skill"); const now=new Date().toISOString();
  const values={id,ownerId,name:cleanString(body.name,180),description:cleanString(body.description,3000),category:cleanString(body.category,200)||"كتابة وتسويق",markdown:cleanString(body.markdown,80000),platforms:cleanStringArray(body.platforms,20),outputTypes:cleanStringArray(body.outputTypes,20),version:cleanString(body.version,30)||"1.0.0",active:body.active!==false,updatedAt:now};
  if(!values.name) throw new Error("اسم المهارة مطلوب");
  await getDb().insert(skills).values({...values,createdAt:now}).onConflictDoUpdate({target:skills.id,set:values});
  const [row]=await getDb().select().from(skills).where(and(eq(skills.id,id),eq(skills.ownerId,ownerId))).limit(1); return stripOwner(row) as unknown as Skill;
}

export async function deleteEntity(ownerId:string, entity:string, id:string) {
  const table=entity==="brand"?brands:entity==="character"?characters:entity==="skill"?skills:entity==="generation"?generations:null;
  if(!table) throw new Error("نوع العنصر غير صحيح");
  await getDb().delete(table).where(and(eq(table.id,id),eq(table.ownerId,ownerId)));
}

export async function getGenerationContext(ownerId:string, ids:{brandId:string;characterId?:string;skillId?:string}) {
  const db=getDb();
  const [brand]=await db.select().from(brands).where(and(eq(brands.id,ids.brandId),eq(brands.ownerId,ownerId))).limit(1);
  const [character]=ids.characterId?await db.select().from(characters).where(and(eq(characters.id,ids.characterId),eq(characters.ownerId,ownerId))).limit(1):[];
  const [skill]=ids.skillId?await db.select().from(skills).where(and(eq(skills.id,ids.skillId),eq(skills.ownerId,ownerId))).limit(1):[];
  return {brand:brand?stripOwner(brand) as unknown as Brand:undefined,character:character?stripOwner(character) as unknown as CharacterProfile:undefined,skill:skill?stripOwner(skill) as unknown as Skill:undefined};
}

export async function createGeneration(ownerId:string,payload:Record<string,unknown>) {
  const id=safeId("generation"), now=new Date().toISOString();
  await getDb().insert(generations).values({id,ownerId,brandId:String(payload.brandId),characterId:String(payload.characterId||""),skillId:String(payload.skillId||""),title:String(payload.title||"حملة جديدة"),contentType:String(payload.contentType||"image"),platforms:payload.platforms as string[],objective:String(payload.objective||"awareness"),creativeMode:String(payload.creativeMode||"from-scratch"),brief:String(payload.brief||""),referenceUrl:String(payload.referenceUrl||""),status:"generating",progress:20,output:{},costEstimateCents:Number(payload.costEstimate||0),createdAt:now,updatedAt:now});
  return id;
}
export async function completeGeneration(ownerId:string,id:string,output:Record<string,unknown>,cost:number,status="completed") {
  await getDb().update(generations).set({output,status,progress:status==="completed"?100:82,costEstimateCents:cost,updatedAt:new Date().toISOString()}).where(and(eq(generations.id,id),eq(generations.ownerId,ownerId)));
  return getGeneration(ownerId,id);
}
export async function getGeneration(ownerId:string,id:string) {
  const [row]=await getDb().select().from(generations).where(and(eq(generations.id,id),eq(generations.ownerId,ownerId))).limit(1);
  return row?({...stripOwner(row),costEstimate:row.costEstimateCents} as unknown as Generation):undefined;
}
