import "./globals.css";
import type { Metadata } from "next";
import NavBar from "../components/NavBar";

export const metadata: Metadata = {
  title: "ThoughtDom",
  description: "Where ideas have names. People don't.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <NavBar />
        <main className="max-w-2xl mx-auto px-4 pb-24 pt-6">{children}</main>
      </body>
    </html>
  );
}
