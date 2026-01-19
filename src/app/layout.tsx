import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });

export const metadata: Metadata = {
    title: "RSVP Reader",
    description: "High-performance speed reading application",
    manifest: "/manifest.json",
};

// Blocking script to apply theme before React hydrates (prevents flash)
const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('rsvp-reader-storage');
    if (stored) {
      var data = JSON.parse(stored);
      var theme = data.state && data.state.settings && data.state.settings.theme;
      if (theme && theme !== 'light') {
        document.documentElement.setAttribute('data-theme', theme);
      }
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
