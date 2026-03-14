import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { CartProvider } from "@/contexts/cart-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { LanguageProvider } from "@/contexts/language-context";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CartDrawer from "@/components/cart-drawer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Riven — Premium Online Store",
  description: "Your premium destination for quality products. Fast delivery and in-store pickup available.",
  keywords: ["e-commerce", "online store", "shop", "riven"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              <CartProvider>
                <Header />
                <main>{children}</main>
                <Footer />
                <CartDrawer />
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
