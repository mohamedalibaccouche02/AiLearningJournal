import { SignedIn, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import logo from "public/aijournallogo.svg";
import { Button } from "src/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function TopBar() {
  return (
    <nav className="sticky top-0 z-50 flex w-full items-center justify-between bg-white shadow-sm p-4">
      <div className="flex items-center space-x-4">
        <Link href="/journal" className="flex items-center space-x-2">
          <Image src={logo} alt="AIJournal Logo" width={200} height={32} />
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <Link href="/journal/new">
          <Button variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Journal
          </Button>
        </Link>
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