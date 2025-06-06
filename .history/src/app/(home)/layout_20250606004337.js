"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import MotionContainer from "@/components/ui-components/MotionContainer";
import Chatbox from "@/components/social-app-component/ChatBox";
import Header from "@/components/ui-components/Header";
import Sidebar from "@/components/ui-components/Sidebar";
import ProgressBar from "@/components/ui-components/ProgressBar";
import useNotificationSocket from "@/hooks/useNotificationSocket";
import { Toaster } from "react-hot-toast";
import { NotificationProvider } from "@/context/NotificationContext";
import NotificationList from "@/components/social-app-component/NotificationList";

export default function MainLayout({ children }) {
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const prevThemeRef = useRef(null);

  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  // Read token & userId from localStorage (client-only)
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedToken = localStorage.getItem("accessToken");

    if (storedUserId && storedToken) {
      setUserId(storedUserId);
      setToken(storedToken);
    }
  }, []);

  // WebSocket hook (auto connects internally if valid)
  useNotificationSocket(userId, token);

  useEffect(() => {
    setMounted(true);
  }, []);

  const shouldAnimate =
    mounted && prevThemeRef.current && prevThemeRef.current !== resolvedTheme;

  useEffect(() => {
    if (mounted) {
      prevThemeRef.current = resolvedTheme;
    }
  }, [resolvedTheme, mounted]);

  const hideRightSidebar =
    pathname.startsWith("/settings") || pathname.startsWith("/search");

  const layoutContent = (
    <>
      {/* Progress loading bar */}
      <ProgressBar />

      {/* Toasts */}
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      {/* Layout structure */}
      <div className="h-screen flex flex-col">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 h-16 border-b transition-colors duration-500">
          <Header />
        </header>

        {/* Body: Sidebar + Main + RightSidebar */}
        <div className="flex flex-1 pt-16 bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500">
          {/* Left Sidebar */}
          <aside className="md:w-[80px] h-[calc(100vh-64px)] overflow-y-auto">
            <Sidebar />
          </aside>

          {/* Main Content */}
          <main className="flex-1 flex justify-center h-[calc(100vh-64px)] overflow-y-auto px-4">
            <div className="w-full max-w-4xl space-y-6">{children}</div>
          </main>

          {/* Right Sidebar */}
          {!hideRightSidebar && (
            <aside className="relative p-8 hidden md:flex flex-col justify-center items-center w-[80px] lg:w-[400px] lg:max-w-[400px] h-[calc(100vh-64px)] items-end justify-center">
              <div className="absolute top-0">
                <NotificationList/>
              </div>
              <div className="absolute bottom-0">
                <Chatbox />
              </div>
            </aside>
          )}
        </div>
      </div>

    </>
  );

  return shouldAnimate ? (
    
    <AnimatePresence mode="wait">
      <MotionContainer
        key={resolvedTheme}
        modeKey={resolvedTheme}
        effect="fadeUp"
        duration={0.25}
      >
        {layoutContent}
      </MotionContainer>
    </AnimatePresence>
  ) : (
    layoutContent
  );
}
