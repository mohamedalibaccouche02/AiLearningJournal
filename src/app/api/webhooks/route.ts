import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { db } from "src/server/db"; // Adjusted path to your db index
import { eq } from "drizzle-orm";
import { users } from "src/server/db/schema"; // Adjusted path to your schema
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

const webhookSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

if (!webhookSecret) {
  throw new Error("Missing CLERK_WEBHOOK_SIGNING_SECRET environment variable");
}

const handler = async (req: Request) => {
  const hdrs = await headers();
  console.log("Webhook request received:", {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(hdrs),
  });
  if (req.method === "POST") {
    const payload = await req.text();
    const headerPayload = await headers();
    const svixId = headerPayload.get("svix-id");
    const svixTimestamp = headerPayload.get("svix-timestamp");
    const svixSignature = headerPayload.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.log("Missing Svix headers:", { svixId, svixTimestamp, svixSignature });
      return new NextResponse("Missing Svix headers", { status: 400 });
    }

    const wh = new Webhook(webhookSecret);

    let evt;

    try {
      evt = wh.verify(payload, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as any;
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return new NextResponse("Invalid signature", { status: 400 });
    }

    const eventType = evt.type;
    const data = evt.data;
    console.log("Processed event:", { eventType, data });

    if (eventType === "user.created" || eventType === "user.updated") {
      const userSchema = createInsertSchema(users).omit({ createdAt: true });
      const userData = userSchema.parse({
        userId: data.id,
        username: data.username || null,
        email: data.email_addresses[0]?.email_address || null,
        profileImageUrl: data.image_url || null,
      });

      await db
        .insert(users)
        .values(userData)
        .onConflictDoUpdate({
          target: users.userId,
          set: userData,
        });
      console.log("User data synced:", userData);
    } else if (eventType === "session.created") {
      await db
      await db
        .update(users)
        .set({ createdAt: new Date() })
        .where(eq(users.userId, data.user_id));
      console.log("Session created updated for user:", data.user_id);
      await db
        .update(users)
      await db
        .update(users)
        .set({ createdAt: new Date() })
        .where(eq(users.userId, data.user_id));
      console.log("Session ended updated for user:", data.user_id);
    } else {
      console.log("Unhandled event type:", eventType);
    }

    return new NextResponse("", { status: 200 });
  }
  return new NextResponse("Method not allowed", { status: 405 });
};

export async function POST(req: Request) {
  return handler(req);
}

export async function GET(req: Request) {
  return new NextResponse("Method not allowed", { status: 405 });
}