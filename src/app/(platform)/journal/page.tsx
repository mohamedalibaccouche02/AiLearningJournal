import { currentUser } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { journals, quizzes } from "~/server/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent } from "src/components/ui/card";
import Link from "next/link";
import { BookOpen, Trophy } from "lucide-react";
import JournalCard from "src/components/JournalCard";

export const dynamic = "force-dynamic"; // Force dynamic rendering to avoid static generation issues

export default async function JournalPage() {
  const user = await currentUser();
  const userId = user?.id;

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-600 mb-4">Please sign in to view your journals.</p>
            <Link href="/sign-in">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">
                Sign In
              </button>
            </Link>
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
      ? { score: quiz.score, total: quiz.totalQuestions }
      : { score: 0, total: 1 }, // Default to 0/1 to avoid division by zero
  }));

  const totalJournals = journalsWithScores.length;
  const averageScore =
    journalsWithScores.length > 0
      ? Math.round(
          journalsWithScores.reduce((acc, { score }) => acc + (score.score / score.total) * 100, 0) /
            journalsWithScores.length
        )
      : 0;

  const username = user?.firstName || "User";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-10 gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome to AIJournal, <span className="text-purple-600">mohamed ali!</span>
            </h2>
            <p className="text-lg text-gray-600">Track your learning progress and quiz performance</p>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:min-w-[420px] lg:max-w-[420px]">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 mb-1">Total Journals</p>
                    <p className="text-3xl font-bold text-blue-900">{totalJournals}</p>
                  </div>
                  <div className="p-3 bg-blue-500 rounded-full">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`${averageScore > 40 ? "bg-gradient-to-br from-green-50 to-green-100 border-green-200" : "bg-gradient-to-br from-red-50 to-red-100 border-red-200"} shadow-lg`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${averageScore > 40 ? "text-green-700" : "text-red-700"} mb-1`}>
                      Average Quiz Score
                    </p>
                    <p className={`text-3xl font-bold ${averageScore > 40 ? "text-green-900" : "text-red-900"}`}>
                      {averageScore}%
                    </p>
                  </div>
                  <div className={`p-3 ${averageScore > 40 ? "bg-green-500" : "bg-red-500"} rounded-full`}>
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Journal Cards */}
        {journalsWithScores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {journalsWithScores.map((journal) => (
              <JournalCard
                key={journal.id}
                id={journal.id}
                title={journal.title}
                createdAt={journal.createdAt}
                lastModified={journal.lastModified}
                score={`${journal.score.score}/${journal.score.total}`}
              />
            ))}
          </div>
        ) : (
          <Card className="p-16 text-center bg-white shadow-lg">
            <BookOpen className="h-20 w-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">No journals yet</h3>
            <p className="text-gray-600 text-lg">Start creating journals to see your history here!</p>
          </Card>
        )}
      </main>
    </div>
  );
}