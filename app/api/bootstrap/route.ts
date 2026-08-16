import { listStudioData } from "@/lib/server-data";
import { ownerFromRequest } from "@/lib/server-auth";
import { isAiConfigured } from "@/lib/server-ai";
import { getStudioEnvironment } from "@/lib/server-env";
export const dynamic="force-dynamic";
export async function GET(request:Request){try{const owner=ownerFromRequest(request);return Response.json({...await listStudioData(owner),owner,aiConfigured:isAiConfigured(),storageConfigured:Boolean(getStudioEnvironment().BUCKET)})}catch(error){return Response.json({error:error instanceof Error?error.message:"تعذر تحميل البيانات"},{status:500})}}
