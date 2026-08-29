import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Header } from "@/components/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SkillSchool — student course summaries",
    template: "%s · SkillSchool",
  },
  description:
    "Students share course content summaries aligned to school requirements, matched to your summary style. Demo build with mock data.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
          {children}
        </main>
        <footer className="border-t border-line">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-muted sm:px-6">
            <p>
              SkillSchool — demo build with mock data. Students share course
              summaries; recommendations match summary style.
            </p>
            <p>
              Demo user: <span className="font-medium text-foreground">Pat (you)</span> ·{" "}
              <Link href="/share" className="font-medium text-accent hover:underline">
                Share a summary
              </Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
