CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"author_id" serial NOT NULL,
	"created_at" date DEFAULT now() NOT NULL,
	"updated_at" date
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" date DEFAULT now() NOT NULL,
	"updated_at" date,
	"due_date" date
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"assignee-id" serial NOT NULL,
	"priority" varchar(255) DEFAULT 'low',
	"position" integer NOT NULL,
	"created_at" date DEFAULT now() NOT NULL,
	"updated_at" date
);
