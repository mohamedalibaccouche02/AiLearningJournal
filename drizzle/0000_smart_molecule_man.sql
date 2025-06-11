CREATE TABLE "ailearningjournal_document" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"journal_id" varchar(256) NOT NULL,
	"url" text NOT NULL,
	"key" text NOT NULL,
	"name" varchar(256) NOT NULL,
	"size" integer,
	"uploaded_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ailearningjournal_flashcard" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"journal_id" varchar(256) NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"last_reviewed" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ailearningjournal_journal" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"user_id" varchar(256) NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" text,
	"last_modified" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ailearningjournal_quiz" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"journal_id" varchar(256) NOT NULL,
	"questions" jsonb NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ailearningjournal_user" (
	"user_id" varchar(256) PRIMARY KEY NOT NULL,
	"username" varchar(100),
	"email" varchar(256) NOT NULL,
	"profile_image_url" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "ailearningjournal_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "ailearningjournal_document" ADD CONSTRAINT "ailearningjournal_document_journal_id_ailearningjournal_journal_id_fk" FOREIGN KEY ("journal_id") REFERENCES "public"."ailearningjournal_journal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ailearningjournal_flashcard" ADD CONSTRAINT "ailearningjournal_flashcard_journal_id_ailearningjournal_journal_id_fk" FOREIGN KEY ("journal_id") REFERENCES "public"."ailearningjournal_journal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ailearningjournal_journal" ADD CONSTRAINT "ailearningjournal_journal_user_id_ailearningjournal_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ailearningjournal_user"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ailearningjournal_quiz" ADD CONSTRAINT "ailearningjournal_quiz_journal_id_ailearningjournal_journal_id_fk" FOREIGN KEY ("journal_id") REFERENCES "public"."ailearningjournal_journal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "document_journal_idx" ON "ailearningjournal_document" USING btree ("journal_id");--> statement-breakpoint
CREATE INDEX "flashcard_journal_idx" ON "ailearningjournal_flashcard" USING btree ("journal_id");--> statement-breakpoint
CREATE INDEX "journal_user_idx" ON "ailearningjournal_journal" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "journal_modified_idx" ON "ailearningjournal_journal" USING btree ("last_modified");--> statement-breakpoint
CREATE INDEX "quiz_journal_idx" ON "ailearningjournal_quiz" USING btree ("journal_id");--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "ailearningjournal_user" USING btree ("user_id");