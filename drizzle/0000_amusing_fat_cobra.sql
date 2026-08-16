CREATE TABLE `assets` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`object_key` text NOT NULL,
	`file_name` text NOT NULL,
	`mime_type` text NOT NULL,
	`size` integer DEFAULT 0 NOT NULL,
	`purpose` text DEFAULT 'asset' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assets_object_key_unique` ON `assets` (`object_key`);--> statement-breakpoint
CREATE TABLE `brands` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text DEFAULT 'تطبيق' NOT NULL,
	`category` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`website` text DEFAULT '' NOT NULL,
	`audience` text DEFAULT '' NOT NULL,
	`market` text DEFAULT 'اليمن' NOT NULL,
	`language` text DEFAULT 'العربية' NOT NULL,
	`tone` text DEFAULT 'واضحة واحترافية' NOT NULL,
	`colors` text DEFAULT '[]' NOT NULL,
	`fonts` text DEFAULT '[]' NOT NULL,
	`logo_url` text DEFAULT '' NOT NULL,
	`source_text` text DEFAULT '' NOT NULL,
	`source_urls` text DEFAULT '[]' NOT NULL,
	`preferred_ctas` text DEFAULT '' NOT NULL,
	`forbidden_phrases` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'ready' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `characters` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'شخصية إعلانية' NOT NULL,
	`persona` text DEFAULT '' NOT NULL,
	`appearance` text DEFAULT '' NOT NULL,
	`wardrobe` text DEFAULT '' NOT NULL,
	`voice` text DEFAULT '' NOT NULL,
	`restrictions` text DEFAULT '' NOT NULL,
	`brand_ids` text DEFAULT '[]' NOT NULL,
	`image_urls` text DEFAULT '[]' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `generations` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`brand_id` text NOT NULL,
	`character_id` text DEFAULT '' NOT NULL,
	`skill_id` text DEFAULT '' NOT NULL,
	`title` text DEFAULT 'حملة جديدة' NOT NULL,
	`content_type` text DEFAULT 'image' NOT NULL,
	`platforms` text DEFAULT '[]' NOT NULL,
	`objective` text DEFAULT 'awareness' NOT NULL,
	`creative_mode` text DEFAULT 'from-scratch' NOT NULL,
	`brief` text DEFAULT '' NOT NULL,
	`reference_url` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`progress` integer DEFAULT 0 NOT NULL,
	`output` text DEFAULT '{}' NOT NULL,
	`cost_estimate_cents` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `skills` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`category` text DEFAULT 'كتابة وتسويق' NOT NULL,
	`markdown` text DEFAULT '' NOT NULL,
	`platforms` text DEFAULT '[]' NOT NULL,
	`output_types` text DEFAULT '[]' NOT NULL,
	`version` text DEFAULT '1.0.0' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
