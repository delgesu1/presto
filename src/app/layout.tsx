import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#000000" },
    ],
};

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://presto-reader.vercel.app"),
    title: "Presto Reader - Science-backed Speed Reading",
    description: "Read faster with science-backed RSVP technology. Adjustable speed, focus-point highlighting, and beautiful themes for comfortable reading.",
    manifest: "/manifest.json",
    applicationName: "Presto Reader",
    keywords: ["speed reading", "RSVP", "rapid serial visual presentation", "reading", "focus", "productivity", "ORP"],
    authors: [{ name: "Presto Reader" }],
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Presto Reader",
    },
    formatDetection: {
        telephone: false,
    },
    openGraph: {
        type: "website",
        siteName: "Presto Reader",
        title: "Presto Reader - Science-backed Speed Reading",
        description: "Read faster with science-backed RSVP technology. Adjustable speed, focus-point highlighting, and beautiful themes.",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Presto Reader",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Presto Reader - Science-backed Speed Reading",
        description: "Read faster with science-backed RSVP technology. Adjustable speed, focus-point highlighting, and beautiful themes.",
        images: ["/og-image.png"],
    },
    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "32x32" },
            { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
            { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
        apple: [
            { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        ],
    },
};

// Blocking script to apply theme before React hydrates (prevents flash)
const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('rsvp-reader-storage');
    var theme = null;
    if (stored) {
      var data = JSON.parse(stored);
      theme = data && data.state && data.state.settings && data.state.settings.theme;
    }
    if (!theme) {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    if (theme && theme !== 'light') {
      document.documentElement.setAttribute('data-theme', theme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeScript }} />
            </head>
            <body className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} antialiased`}>{children}</body>
        </html>
    );
}
