import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import { ScreenSizeGuard } from "@/components/screen-size-guard";

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
      <body>
        <QueryProvider>
          <ScreenSizeGuard>
            {children}
          </ScreenSizeGuard>
          <Toaster position="top-right" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
