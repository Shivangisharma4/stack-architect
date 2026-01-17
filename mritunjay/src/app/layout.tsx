import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "मृत्युंजय | Mritunjay — कवि, लेखक, पत्रकार",
  description: "शब्दों में रचता स्वप्न शांति का, लेखनी से संजोता जगती की रोशनी। A personal blog by Mritunjay — poet, writer, and journalist.",
  keywords: ["मृत्युंजय", "Mritunjay", "blog", "Hindi blog", "कविता", "लेखन", "पत्रकारिता"],
  authors: [{ name: "मृत्युंजय" }],
  openGraph: {
    type: "website",
    locale: "hi_IN",
    url: "https://mritunjay.vercel.app",
    siteName: "मृत्युंजय",
    title: "मृत्युंजय | Mritunjay",
    description: "शब्दों में रचता स्वप्न शांति का, लेखनी से संजोता जगती की रोशनी।",
  },
  twitter: {
    card: "summary_large_image",
    title: "मृत्युंजय | Mritunjay",
    description: "A personal blog by Mritunjay — poet, writer, and journalist.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Spectral:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Special+Elite&family=Noto+Serif+Devanagari:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
