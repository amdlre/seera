CREATE EXTENSION IF NOT EXISTS "citext";--> statement-breakpoint
CREATE TYPE "public"."user_locale" AS ENUM('ar', 'en');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."resume_font" AS ENUM('arial', 'calibri', 'times');--> statement-breakpoint
CREATE TYPE "public"."resume_status" AS ENUM('draft', 'completed');--> statement-breakpoint
CREATE TYPE "public"."resume_section_layout" AS ENUM('bullets', 'dated_entries', 'paragraph');--> statement-breakpoint
CREATE TYPE "public"."resume_section_type" AS ENUM('personal', 'summary', 'experience', 'education', 'skills', 'certifications', 'languages', 'projects', 'custom');--> statement-breakpoint
CREATE TYPE "public"."export_language" AS ENUM('ar', 'en');--> statement-breakpoint
CREATE TYPE "public"."export_method" AS ENUM('print', 'pdf', 'docx');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" "citext" NOT NULL,
	"full_name" text NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"locale" "user_locale" DEFAULT 'ar' NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "otp_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" "citext" NOT NULL,
	"code_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"attempts" integer DEFAULT 0 NOT NULL,
	"ip" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resumes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"target_job_title_ar" text,
	"target_job_title_en" text,
	"status" "resume_status" DEFAULT 'draft' NOT NULL,
	"ats_score" integer DEFAULT 0 NOT NULL,
	"completed_at" timestamp with time zone,
	"font" "resume_font" DEFAULT 'arial' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "resume_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resume_id" uuid NOT NULL,
	"type" "resume_section_type" NOT NULL,
	"title_ar" text NOT NULL,
	"title_en" text NOT NULL,
	"layout" "resume_section_layout" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"is_custom" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resume_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resume_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"language" "export_language" NOT NULL,
	"method" "export_method" NOT NULL,
	"ats_score_at_export" integer NOT NULL,
	"file_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip" text,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_user_id" uuid NOT NULL,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" uuid NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resume_sections" ADD CONSTRAINT "resume_sections_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resume_items" ADD CONSTRAINT "resume_items_section_id_resume_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."resume_sections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exports" ADD CONSTRAINT "exports_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exports" ADD CONSTRAINT "exports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_admin_user_id_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "otp_codes_email_idx" ON "otp_codes" USING btree ("email");--> statement-breakpoint
CREATE INDEX "otp_codes_expires_at_idx" ON "otp_codes" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "resumes_user_id_idx" ON "resumes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "resumes_status_idx" ON "resumes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "resumes_ats_score_idx" ON "resumes" USING btree ("ats_score");--> statement-breakpoint
CREATE INDEX "resume_sections_resume_id_idx" ON "resume_sections" USING btree ("resume_id");--> statement-breakpoint
CREATE INDEX "resume_sections_sort_order_idx" ON "resume_sections" USING btree ("resume_id","sort_order");--> statement-breakpoint
CREATE INDEX "resume_items_section_id_idx" ON "resume_items" USING btree ("section_id");--> statement-breakpoint
CREATE INDEX "resume_items_sort_order_idx" ON "resume_items" USING btree ("section_id","sort_order");--> statement-breakpoint
CREATE INDEX "exports_resume_id_idx" ON "exports" USING btree ("resume_id");--> statement-breakpoint
CREATE INDEX "exports_user_id_idx" ON "exports" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "exports_language_idx" ON "exports" USING btree ("language");--> statement-breakpoint
CREATE INDEX "exports_created_at_idx" ON "exports" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_log_admin_user_id_idx" ON "audit_log" USING btree ("admin_user_id");--> statement-breakpoint
CREATE INDEX "audit_log_target_idx" ON "audit_log" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "audit_log_created_at_idx" ON "audit_log" USING btree ("created_at");