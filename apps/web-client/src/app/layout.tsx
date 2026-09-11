import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import Script from "next/script";
import { Providers } from "@/components/providers";
import "./globals.css";

const fontSans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Pinocchio's Pizza — Order Fresh Pizza Online",
  description:
    "Order delicious fresh pizza from Pinocchio's Pizza. Browse our menu, customize your order, and pick it up hot and ready at our counter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} antialiased`}
        suppressHydrationWarning
      >
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem("theme");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}if(t==="dark"){document.documentElement.classList.add("dark");}}catch(e){}})();`}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
