import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Image Text Composer",
  description: "This is a tool that allows you to add text to images for meme-ifying.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
