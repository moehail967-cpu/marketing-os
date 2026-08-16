import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";
import { getStudioEnvironment } from "../lib/server-env";

export function getDb() {
  const db = getStudioEnvironment().DB;
  if (!db) throw new Error("قاعدة البيانات غير متاحة");
  return drizzle(db,{schema});
}
