import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Sans } from "next/font/google";
import "./globals.css";

const SITE_URL = "https://frameit.mymoonpk.com";

const geistMonoHeading = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Frame-it — Frame Photos Online in Your Browser",
    template: "%s · Frame-it",
  },
  description:
    "Frame your photos online for free with your own transparent PNG frame. Smart face-aware cropping, batch export as ZIP — everything runs entirely in your browser. No uploads, no sign-up.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "Frame-it — Frame Photos Online in Your Browser",
    description:
      "Frame your photos online for free with your own transparent PNG frame. Smart face-aware cropping, batch export as ZIP — everything runs entirely in your browser.",
    siteName: "Frame-it",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Frame-it — Frame Photos Online in Your Browser",
    description:
      "Frame your photos online for free with your own transparent PNG frame. Everything runs entirely in your browser — no uploads.",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  category: "utilities",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4ade80",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        geistMonoHeading.variable,
      )}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
