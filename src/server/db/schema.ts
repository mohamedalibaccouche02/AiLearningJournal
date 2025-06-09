// src/server/db/schema.ts
import { sql } from "drizzle-orm";
import { index, pgTableCreator, text, varchar, timestamp ,integer} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const createTable = pgTableCreator((name) => `ailearningjournal_${name}`);

// Users table (linked to Clerk auth)
export const users = createTable(
  "user",
  {
    userId: varchar("user_id", { length: 256 }).primaryKey(),
    username: varchar("username", { length: 100 }),
    email: varchar("email", { length: 256 }).unique().notNull(),
    profileImageUrl: text("profile_image_url"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (t) => [index("user_id_idx").on(t.userId)]
);

export const usersRelations = relations(users, ({ many }) => ({
  journals: many(journals),
}));

// Journals table (collections of study materials)
export const journals = createTable(
  "journal",
  {
    id: varchar("id", { length: 256 }).primaryKey(),
    userId: varchar("user_id", { length: 256 })
      .references(() => users.userId, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 100 }).notNull(),
    description: text("description"),
    lastModified: timestamp("last_modified").default(sql`CURRENT_TIMESTAMP`).notNull(),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (t) => [
    index("journal_user_idx").on(t.userId),
    index("journal_modified_idx").on(t.lastModified),
  ]
);

export const journalsRelations = relations(journals, ({ one, many }) => ({
  user: one(users, {
    fields: [journals.userId],
    references: [users.userId],
  }),
  document: one(documents),
  flashcards: many(flashcards),
}));

// Documents table (PDF uploads for journals)
export const documents = createTable(
  "document",
  {
    id: varchar("id", { length: 256 }).primaryKey(),
    journalId: varchar("journal_id", { length: 256 })
      .references(() => journals.id, { onDelete: "cascade" })
      .notNull(),
    url: text("url").notNull(),
    key: text("key").notNull(),
    name: varchar("name", { length: 256 }).notNull(),
    size: integer("size"),
    uploadedAt: timestamp("uploaded_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (t) => [index("document_journal_idx").on(t.journalId)]
);

export const documentsRelations = relations(documents, ({ one }) => ({
  journal: one(journals, {
    fields: [documents.journalId],
    references: [journals.id],
  }),
}));

// Flashcards table (AI-generated from PDFs)
export const flashcards = createTable(
  "flashcard",
  {
    id: varchar("id", { length: 256 }).primaryKey(),
    journalId: varchar("journal_id", { length: 256 })
      .references(() => journals.id, { onDelete: "cascade" })
      .notNull(),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    lastReviewed: timestamp("last_reviewed"), // Tracks the last time this flashcard was reviewed
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (t) => [index("flashcard_journal_idx").on(t.journalId)]
);

export const flashcardsRelations = relations(flashcards, ({ one }) => ({
  journal: one(journals, {
    fields: [flashcards.journalId],
    references: [journals.id],
  }),
}));