// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({
    pdf: {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const { userId } = await auth(); // Directly use Clerk's auth to get userId
      if (!userId) {
        throw new UploadThingError("User not authenticated");
      }
      console.log("Middleware: User authenticated with ID:", userId);
      return { userId }; // Return userId as metadata
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload completed for userId:", metadata.userId, "File:", file.url);
      return {};
    }),
} satisfies FileRouter;
