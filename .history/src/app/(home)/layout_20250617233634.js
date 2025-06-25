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
import { Toaster } from "react-hot-toast";
import ChatList from "@/components/social-app-component/ChatList";
import { SocketProvider } from "@/context/socketContext";
import useNotificationSocket from "@/hooks/useNotificationSocket";
import useAppStore from "@/store/ZustandStore";

export default function MainLayout({ children }) {
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const prevThemeRef = useRef(null);

  // Dữ liệu auth từ localStorage
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedToken = localStorage.getItem("accessToken");

    if (storedUserId && storedToken) {
      setUserId(storedUserId);
      setToken(storedToken);
    }
  }, []);

  // Gọi socket thông báo
  useNotificationSocket(userId, token);

  // Animation khi đổi theme
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

  // Các route cần ẩn sidebar phải phải
  const hideRightSidebar =
    pathname.startsWith("/settings") ||
    pathname.startsWith("/search");

  // Zustand chat store
  const selectedChat = useAppStore((state) => state.selectedChat);
  const virtualChat = useAppStore((state) => state.virtualChat);
  const clearVirtualChat = useAppStore((state) => state.clearVirtualChat);

  const isChatOpen = !!selectedChat || !!virtualChat;

  const handleBackToList = () => {
    clearVirtualChat();
    useAppStore.getState().selectChat(null);
  };

  const renderRightSidebar = () => {
    if (hideRightSidebar) return null;

    return (
      <aside className="hidden md:flex justify-center items-end w-[80px] lg:w-[400px] lg:max-w-[400px] h-[calc(100vh-64px)] p-4">
        <div className="flex flex-col w-full h-full relative">
          {isChatOpen ? (
            <Chatbox
              chatId={selectedChat}
              targetUser={virtualChat}
              onBack={handleBackToList}
            />
          ) : (
            <ChatList
              onSelectChat={(chatId, targetUser) => {
                useAppStore.getState().selectChat(chatId);
              }}
              selectedChatId={selectedChat}
            />
          )}
        </div>
      </aside>
    );
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
            <div
              className={`${
                hideRightSidebar ? "max-w-6xl" : "max-w-4xl"
              } w-full mx-auto space-y-6`}
            >
              {children}
            </div>
          </main>

          {/* Right Sidebar (Chat) */}
          {renderRightSidebar()}
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
