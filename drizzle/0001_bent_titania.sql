ALTER TABLE "ailearningjournal_quiz" ADD COLUMN "user_id" varchar(256);--> statement-breakpoint
ALTER TABLE "ailearningjournal_quiz" ADD COLUMN "score" integer;--> statement-breakpoint
ALTER TABLE "ailearningjournal_quiz" ADD COLUMN "total_questions" integer;--> statement-breakpoint
ALTER TABLE "ailearningjournal_quiz" ADD COLUMN "responses" jsonb;--> statement-breakpoint
ALTER TABLE "ailearningjournal_quiz" ADD CONSTRAINT "ailearningjournal_quiz_user_id_ailearningjournal_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ailearningjournal_user"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "quiz_user_idx" ON "ailearningjournal_quiz" USING btree ("user_id");