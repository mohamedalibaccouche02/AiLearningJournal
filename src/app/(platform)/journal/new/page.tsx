// src/app/(platform)/journal/new/page.tsx
"use client";
import "@uploadthing/react/styles.css";
import { createJournal } from "src/utils/createjournal";
import { UploadButton } from "~/utils/uploadthing";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import { Button } from "src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewJournalPage() {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileKey, setFileKey] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [uploadComplete, setUploadComplete] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();

  const handleGenerateQuiz = async () => {
    if (!fileUrl || !fileKey || !fileName || !fileSize) {
      toast.error("Please upload a PDF file first.");
      return;
    }
    setIsSubmitting(true);
    const formData = new FormData();
    formData.set("title", (document.getElementById("title") as HTMLInputElement).value);
    formData.set("description", (document.getElementById("description") as HTMLInputElement).value || "");
    formData.set("fileUrl", fileUrl);
    formData.set("fileKey", fileKey);
    formData.set("fileName", fileName);
    formData.set("fileSize", fileSize.toString());
    try {
      await createJournal(formData);
      toast.success("Journal and quiz created successfully!");
      router.push(`/journal/${crypto.randomUUID()}`); // Temporary; update with newJournal.id
    } catch (error: any) {
      toast.error("Failed to create journal: " + (error.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-900">Create a New Journal</CardTitle>
            <p className="text-gray-600">Upload a PDF and add details to start your learning journal.</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-gray-900">Journal Title</Label>
                <Input id="title" name="title" placeholder="Enter journal title" required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="description" className="text-gray-900">Description (Optional)</Label>
                <Input id="description" name="description" placeholder="Enter description" className="mt-1" />
              </div>
              <div>
                <Label className="text-gray-900">Upload PDF</Label>
                <div className="mt-2">
                  <UploadButton
                    endpoint="pdfUploader"
                    appearance={{
                      button: "bg-indigo-600 text-white hover:bg-indigo-700",
                      allowedContent: "text-gray-600",
                    }}
                    content={{
                      button({ ready }) {
                        return ready ? (
                          <span className="flex items-center">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload PDF
                          </span>
                        ) : "Loading...";
                      },
                      allowedContent({ ready }) {
                        return ready ? "PDF files only (max 16MB)" : "";
                      },
                    }}
                    onClientUploadComplete={(res) => {
                      if (res && res.length > 0) {
                        const uploadedFile = res[0];
                        if (uploadedFile) {
                          setFileUrl(uploadedFile.url);
                          setFileKey(uploadedFile.key);
                          setFileName(uploadedFile.name);
                          setFileSize(uploadedFile.size);
                          setUploadComplete(true);
                          toast.success(`PDF "${uploadedFile.name}" uploaded successfully!`);
                        }
                      }
                    }}
                    onUploadError={(error: Error) => {
                      toast.error(`Upload failed: ${error.message}`);
                      setUploadComplete(false);
                    }}
                  />
                </div>
                {fileName && <p className="mt-2 text-sm text-gray-600">Uploaded: {fileName}</p>}
              </div>
              <Button
                onClick={handleGenerateQuiz}
                disabled={!uploadComplete || !fileUrl || isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Quiz...
                  </>
                ) : (
                  "Generate Quiz and Create Journal"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}