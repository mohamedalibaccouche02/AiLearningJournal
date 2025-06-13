// src/app/(platform)/journal/page.tsx
import { currentUser } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { journals, quizzes } from "~/server/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { Button } from "src/components/ui/button";
import Link from "next/link";
import { PlusCircle, BookOpen } from "lucide-react";
import JournalCard from "src/components/JournalCard";

export default async function JournalPage() {
  const user = await currentUser();
  const userId = user?.id;

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Please sign in to view your journals.</p>
            <Button asChild className="mt-4 bg-indigo-600 hover:bg-indigo-700">
              <a href="/sign-in">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userJournals = await db
    .select()
    .from(journals)
    .leftJoin(quizzes, eq(journals.id, quizzes.journalId))
    .where(eq(journals.userId, userId))
    .orderBy(desc(journals.lastModified));

  const journalsWithScores = userJournals.map(({ journal, quiz }) => ({
    id: journal.id,
    title: journal.title,
    createdAt: journal.createdAt,
    lastModified: journal.lastModified,
    score: quiz && quiz.score !== null && quiz.totalQuestions !== null
      ? `${quiz.score}/${quiz.totalQuestions}`
      : "Not taken",
  }));

  const username = user?.firstName || "User";

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to AIJournal, {username}!
          </h1>
          <Link href="/journal/new">
            <Button
              variant="outline"
              className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Journal
            </Button>
          </Link>
        </div>

        {journalsWithScores.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {journalsWithScores.map((journal) => (
              <JournalCard
                key={journal.id}
                id={journal.id}
                title={journal.title}
                createdAt={journal.createdAt}
                lastModified={journal.lastModified}
                score={journal.score}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-4 text-gray-600">No journals yet. Add one to get started!</p>
              <Link href="/journal/new">
                <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Your First Journal
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}