import { AsyncLocalStorage } from "node:async_hooks";

export interface StudioEnvironment {
  ASSETS?: Fetcher; DB?: D1Database; BUCKET?: R2Bucket;
  IMAGES?: { input(stream:ReadableStream): { transform(options:Record<string,unknown>): { output(options:{format:string;quality:number}):Promise<{response():Response}> } } };
  GEMINI_API_KEY?:string; GEMINI_TEXT_MODEL?:string; GEMINI_IMAGE_MODEL?:string; GEMINI_VIDEO_MODEL?:string;
}
const store = new AsyncLocalStorage<StudioEnvironment>();
export const withStudioEnvironment = <T,>(env:StudioEnvironment, task:()=>T) => store.run(env, task);
export const getStudioEnvironment = () => store.getStore() ?? {};
