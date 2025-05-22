import type { Metadata } from "next";
import { Providers } from "@/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "SplitReceipt - Share Expenses Easily",
  description:
    "SplitReceipt helps you split expenses with friends, track who owes what, and settle balances easily.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-slate-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}