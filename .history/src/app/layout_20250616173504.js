import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/providers/ThemeProvider";
import Script from "next/script";
import { NotificationProvider } from "@/store/NotificationContext";

import { cookies } from "next/headers"; // 🆕 để đọc cookie
import { NextIntlClientProvider } from "next-intl"; // 🆕
import { defaultLocale } from "./i18n";

const geist = Geist({ subsets: ["latin"] });

export default async function RootLayout({ children }) {
  const cookieStore = cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || defaultLocale;

  let messages;
  try {
    messages = (await import(`@app/i18n/${locale}.json`)).default;
  } catch (error) {
    messages = (await import(`@/i18n/${defaultLocale}.json`)).default;
  }

  return (
    <html lang={locale} className={geist.className} suppressHydrationWarning>
      <head>
        <Script
          id="theme-switcher"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  const theme = localStorage.getItem("theme");
                  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                  const resolved = theme === "dark" || (theme === "system" && systemDark);
                  if (resolved) {
                    document.documentElement.classList.add("dark");
                  } else {
                    document.documentElement.classList.remove("dark");
                  }
                } catch (_) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
