import { ownerFromRequest } from "@/lib/server-auth";import { saveSkill } from "@/lib/server-data";
export async function POST(request:Request){try{return Response.json({skill:await saveSkill(ownerFromRequest(request),await request.json())},{status:201})}catch(error){return Response.json({error:error instanceof Error?error.message:"تعذر حفظ المهارة"},{status:400})}}
