//src/components/JournalCard.tsx
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { Button } from "src/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "src/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { deleteJournal } from "src/utils/createjournal";
import { toast } from "sonner";

interface JournalCardProps {
  id: string;
  title: string;
  createdAt: Date;
  lastModified: Date;
  score: string;
}

export default function JournalCard({ id, title, createdAt, lastModified, score }: JournalCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteJournal(id);
      toast.success("Journal deleted successfully!");
    } catch (error: any) {
      toast.error(`Failed to delete journal: ${error.message || "Unknown error"}`);
    } finally {
      setIsDeleting(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <Link href={`/journal/${id}`}>
        <Card className="hover:shadow-md transition-shadow duration-200 relative group">
          <CardHeader>
            <CardTitle className="text-3xl font-semibold text-indigo-600">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Created: {new Date(createdAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">
              Last Modified: {new Date(lastModified).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">
              Quiz Score: {score}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:bg-red-50"
              onClick={(e) => {
                e.preventDefault();
                setIsDialogOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </Link>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
    </>
  );
}