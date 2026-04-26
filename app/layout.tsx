import type { Metadata } from "next";
import { AuthProvider } from "./lib/auth-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "AuraStyle",
  description: "Your Personal AI Style Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
