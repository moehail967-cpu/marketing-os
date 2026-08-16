import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const stamps = {
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
};

export const brands = sqliteTable("brands", {
  id: text("id").primaryKey(), ownerId: text("owner_id").notNull(), name: text("name").notNull(),
  type: text("type").notNull().default("تطبيق"), category: text("category").notNull().default(""),
  description: text("description").notNull().default(""), website: text("website").notNull().default(""),
  audience: text("audience").notNull().default(""), market: text("market").notNull().default("اليمن"),
  language: text("language").notNull().default("العربية"), tone: text("tone").notNull().default("واضحة واحترافية"),
  colors: text("colors", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
  fonts: text("fonts", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
  logoUrl: text("logo_url").notNull().default(""), sourceText: text("source_text").notNull().default(""),
  sourceUrls: text("source_urls", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
  preferredCtas: text("preferred_ctas").notNull().default(""), forbiddenPhrases: text("forbidden_phrases").notNull().default(""),
  status: text("status").notNull().default("ready"), ...stamps,
});

export const characters = sqliteTable("characters", {
  id: text("id").primaryKey(), ownerId: text("owner_id").notNull(), name: text("name").notNull(),
  role: text("role").notNull().default("شخصية إعلانية"), persona: text("persona").notNull().default(""),
  appearance: text("appearance").notNull().default(""), wardrobe: text("wardrobe").notNull().default(""),
  voice: text("voice").notNull().default(""), restrictions: text("restrictions").notNull().default(""),
  brandIds: text("brand_ids", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
  imageUrls: text("image_urls", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
  active: integer("active", { mode: "boolean" }).notNull().default(true), ...stamps,
});

export const skills = sqliteTable("skills", {
  id: text("id").primaryKey(), ownerId: text("owner_id").notNull(), name: text("name").notNull(),
  description: text("description").notNull().default(""), category: text("category").notNull().default("كتابة وتسويق"),
  markdown: text("markdown").notNull().default(""),
  platforms: text("platforms", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
  outputTypes: text("output_types", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
  version: text("version").notNull().default("1.0.0"), active: integer("active", { mode: "boolean" }).notNull().default(true), ...stamps,
});

export const generations = sqliteTable("generations", {
  id: text("id").primaryKey(), ownerId: text("owner_id").notNull(), brandId: text("brand_id").notNull(),
  characterId: text("character_id").notNull().default(""), skillId: text("skill_id").notNull().default(""),
  title: text("title").notNull().default("حملة جديدة"), contentType: text("content_type").notNull().default("image"),
  platforms: text("platforms", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
  objective: text("objective").notNull().default("awareness"), creativeMode: text("creative_mode").notNull().default("from-scratch"),
  brief: text("brief").notNull().default(""), referenceUrl: text("reference_url").notNull().default(""),
  status: text("status").notNull().default("queued"), progress: integer("progress").notNull().default(0),
  output: text("output", { mode: "json" }).$type<Record<string, unknown>>().notNull().default(sql`'{}'`),
  costEstimateCents: integer("cost_estimate_cents").notNull().default(0), ...stamps,
});

export const assets = sqliteTable("assets", {
  id: text("id").primaryKey(), ownerId: text("owner_id").notNull(), key: text("object_key").notNull().unique(),
  fileName: text("file_name").notNull(), mimeType: text("mime_type").notNull(), size: integer("size").notNull().default(0),
  purpose: text("purpose").notNull().default("asset"), ...stamps,
});
