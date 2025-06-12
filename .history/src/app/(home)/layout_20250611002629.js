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
import ChatList from "@/components/social-app-component/ChatList";
import { Button } from "@/components/ui-components/Button";
import { ArrowLeft } from "lucide-react";

export default function MainLayout({ children }) {
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const prevThemeRef = useRef(null);
  const [activeChat, setActiveChat] = useState(null);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  // Read token & userId from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedToken = localStorage.getItem("accessToken");

    if (storedUserId && storedToken) {
      setUserId(storedUserId);
      setToken(storedToken);
    }
  }, []);

  // WebSocket hook
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
    pathname.startsWith("/settings") || 
    pathname.startsWith("/search") || 
    pathname.startsWith("/chats");

  const handleSelectChat = (chatId, target) => {
    setActiveChat({ chatId, target });
  };

  const handleBackToList = () => {
    setActiveChat(null);
  };

  const renderRightSidebarContent = () => {
    if (activeChat) {
      return (
        <div className="w-full h-full flex flex-col">
          <div className="flex items-center p-3 border-b">
            <Button 
              variant="ghost" 
              size="sm"
              // onClick={handleBackToList}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h3 className="font-medium">
              {activeChat.target.givenName} {activeChat.target.familyName}
            </h3>
          </div>
          <div className="flex-1 overflow-hidden">
            <Chatbox 
              chatId={activeChat.chatId} 
              targetUser={activeChat.target}
              className="h-full"
            />
          </div>
        </div>
      );
    }
    return <ChatList onSelectChat={handleSelectChat} />;
  };

  const layoutContent = (
    <>
      <ProgressBar />
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      <div className="h-screen flex flex-col">
        <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 h-16 border-b transition-colors duration-500">
          <Header />
        </header>

        <div className="flex flex-1 pt-16 bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500">
          {/* Left Sidebar */}
          <aside className="md:w-[80px] h-[calc(100vh-64px)] overflow-y-auto">
            <Sidebar />
          </aside>

          {/* Main Content */}
          <main className="flex-1 h-[calc(100vh-64px)] overflow-y-auto px-4">
            <div className={`${hideRightSidebar ? "max-w-6xl" : "max-w-4xl"} w-full mx-auto space-y-6`}>
              {children}
            </div>
          </main>

          {/* Right Sidebar */}
          {!hideRightSidebar && (
            <aside className="hidden md:flex w-[80px] lg:w-[400px] lg:max-w-[400px] h-[calc(100vh-64px)] border-l">
              <div className="w-full h-full flex flex-col">
                {renderRightSidebarContent()}
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