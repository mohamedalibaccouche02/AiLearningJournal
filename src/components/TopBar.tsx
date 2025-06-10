import { SignedIn, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import logo from "public/aijournallogo.svg";
import { Button } from "src/components/ui/button";
import { BookOpen, PlusCircle } from "lucide-react";

export default function TopBar() {
  return (
    <nav className="sticky top-0 z-50 flex w-full items-center justify-between bg-white shadow-sm p-4">
      <Link href="/journal" className="flex items-center space-x-2">
        <Image src={logo} alt="AIJournal Logo" width={200} height={32} />
      </Link>
      <div className="flex items-center space-x-4">
        <SignedIn>
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: {
                  width: "40px",
                  height: "40px",
                },
              },
            }}
          />
        </SignedIn>
      </div>
    </nav>
  );
}