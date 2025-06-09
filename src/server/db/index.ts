// src/server/db/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import postgres from "postgres";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });

// Base types for each table
export type User = InferSelectModel<typeof schema.users>;
export type NewUser = InferInsertModel<typeof schema.users>;
export type Journal = InferSelectModel<typeof schema.journals>;
export type NewJournal = InferInsertModel<typeof schema.journals>;
export type Document = InferSelectModel<typeof schema.documents>;
export type NewDocument = InferInsertModel<typeof schema.documents>;
export type Flashcard = InferSelectModel<typeof schema.flashcards>;
export type NewFlashcard = InferInsertModel<typeof schema.flashcards>;

// Relational types for querying with relations
export type UserWithRelations = User & {
  journals: Journal[];
};

export type JournalWithRelations = Journal & {
  user: User;
  document: Document;
  flashcards: Flashcard[];
};

export type DocumentWithRelations = Document & {
  journal: Journal;
};

export type FlashcardWithRelations = Flashcard & {
  journal: Journal;
};