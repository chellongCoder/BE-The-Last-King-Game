CREATE TABLE "choices" (
	"id" serial PRIMARY KEY NOT NULL,
	"scenario_id" text NOT NULL,
	"text" text NOT NULL,
	"type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scenario_effects" (
	"id" serial PRIMARY KEY NOT NULL,
	"choice_id" integer NOT NULL,
	"money" integer DEFAULT 0 NOT NULL,
	"army" integer DEFAULT 0 NOT NULL,
	"people" integer DEFAULT 0 NOT NULL,
	"religion" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "choices" ADD CONSTRAINT "choices_scenario_id_scenarios_id_fk" FOREIGN KEY ("scenario_id") REFERENCES "public"."scenarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scenario_effects" ADD CONSTRAINT "scenario_effects_choice_id_choices_id_fk" FOREIGN KEY ("choice_id") REFERENCES "public"."choices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scenarios" DROP COLUMN "left_choice";--> statement-breakpoint
ALTER TABLE "scenarios" DROP COLUMN "right_choice";