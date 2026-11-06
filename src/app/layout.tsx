import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import ServiceWorker from "@/components/ServiceWorker";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "latin-ext"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://grader.varizsombor.com"),
  title: { default: "Osztályozó", template: "%s · Osztályozó" },
  description: "Pontszámból jegy: gyors számoló, dolgozatjavítás, ponthatár-táblázat és saját sávok tanároknak.",
  applicationName: "Osztályozó",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Osztályozó", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f5f1" },
    { media: "(prefers-color-scheme: dark)", color: "#141412" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="hu" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Nav />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-28 sm:px-6 sm:pt-10 sm:pb-16">{children}</main>
        <footer className="no-print mx-auto hidden w-full max-w-5xl px-6 pb-8 text-sm text-muted sm:block">
          Minden adat csak ebben a böngészőben tárolódik. ·{" "}
          <a className="underline-offset-4 hover:underline" href="https://github.com/mcbulazs/Grader" target="_blank" rel="noreferrer">
            © mcbulazs
          </a>
        </footer>
        <ServiceWorker />
      </body>
    </html>
  );
}
