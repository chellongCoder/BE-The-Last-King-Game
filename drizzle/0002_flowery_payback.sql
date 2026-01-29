CREATE TABLE "scenarios" (
	"id" text PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"image_path" text,
	"left_choice" jsonb NOT NULL,
	"right_choice" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "name" SET DEFAULT '';