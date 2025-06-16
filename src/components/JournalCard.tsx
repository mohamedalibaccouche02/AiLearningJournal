"use client";
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { Button } from "src/components/ui/button";
import { Badge } from "src/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "src/components/ui/alert-dialog";
import { Trash2, Calendar } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react"; // Added useTransition for better UX
import { deleteJournal } from "src/utils/createjournal";
import { toast } from "sonner";
import { useRouter } from "next/navigation"; // Added for client-side navigation control

interface JournalCardProps {
  id: string;
  title: string;
  createdAt: Date;
  lastModified: Date; // Kept for potential future use, but not displayed
  score: string;
}

export default function JournalCard({ id, title, createdAt, lastModified, score }: JournalCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, startTransition] = useTransition(); // Using useTransition for pending state
  const router = useRouter();

  const handleDelete = async () => {
    startTransition(async () => {
      try {
        await deleteJournal(id);
        toast.success("Journal deleted successfully!");
        // Revalidate and stay on /journal by refreshing the current page
        router.refresh(); // This re-renders the page without full navigation
      } catch (error: any) {
        toast.error(`Failed to delete journal: ${error.message || "Unknown error"}`);
      } finally {
        setIsDialogOpen(false);
      }
    });
  };

  // Parse score into numeric values
  const [scoreNumRaw, totalNumRaw] = score !== "Not taken"
    ? score.split("/").map(Number)
    : [0, 1]; // Default to 0/1 for "Not taken"
  const scoreNum = typeof scoreNumRaw === "number" && !isNaN(scoreNumRaw) ? scoreNumRaw : 0;
  const totalNum = typeof totalNumRaw === "number" && !isNaN(totalNumRaw) && totalNumRaw > 0 ? totalNumRaw : 1;
  const percentage = (scoreNum / totalNum) * 100;
  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    return percentage > 50 ? "bg-green-500" : "bg-red-500";
  };

  const getScoreBadgeColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    return percentage > 50 ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600";
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <Link href={`/journal/${id}`} className="flex-1">
            <CardTitle className="text-xl font-bold text-gray-900 capitalize leading-tight">{title}</CardTitle>
          </Link>
          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full p-2 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Journal</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{title}"? This action cannot be undone, and all associated PDFs and quizzes will be removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Score Section */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Score</span>
          <Badge className={`${getScoreBadgeColor(scoreNum, totalNum)} text-white font-semibold px-3 py-1`}>
            {score} ({Math.round(percentage)}%)
          </Badge>
        </div>

        {/* Created Date */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Created</span>
          <div className="flex items-center text-sm text-gray-700 font-medium">
            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
            {formatDate(createdAt)}
          </div>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Progress</span>
            <span>{Math.round(percentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getScoreColor(scoreNum, totalNum)}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}