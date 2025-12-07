import type { Metadata } from "next";
import { Syne, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";

const syne = Syne({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const outfit = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "FoxFile | AI File Organizer",
  description: "Organize your messy folders with AI in one click. Upload a zip and get a clean, structured folder layout back.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          defer
          src="https://umami-three-wheat-87.vercel.app/script.js"
          data-website-id="6895d488-4297-4ba3-9115-73d9c0d83c59"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(){var e="stag_42ya0plbtz5n",t="https://outgoing-porcupine-668.convex.site/api/analytics/collect";function n(){var n=Math.random().toString(36).slice(2),a=sessionStorage.getItem("_stag_s")||n;sessionStorage.setItem("_stag_s",a);var o=localStorage.getItem("_stag_v")||n;localStorage.setItem("_stag_v",o);var i={trackingId:e,path:location.pathname,title:document.title,referrer:document.referrer,visitorId:o,sessionId:a,device:innerWidth<768?"mobile":innerWidth<1024?"tablet":"desktop",browser:navigator.userAgent.match(/(chrome|safari|firefox|edge|opera)/i)?.[1]||"unknown",os:navigator.platform};navigator.sendBeacon?navigator.sendBeacon(t,JSON.stringify(i)):fetch(t,{method:"POST",body:JSON.stringify(i),keepalive:!0})}"loading"===document.readyState?document.addEventListener("DOMContentLoaded",n):n()}();`,
          }}
        />
      </head>
      <body
        className={`${syne.variable} ${outfit.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ClerkProvider dynamic>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
