"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

import MotionContainer from "@/components/ui-components/MotionContainer";
import Header from "@/components/ui-components/Header";
import Sidebar from "@/components/ui-components/Sidebar";
import ProgressBar from "@/components/ui-components/ProgressBar";
import { Toaster } from "react-hot-toast";
import Chatbox from "@/components/social-app-component/ChatBox";
import ChatList from "@/components/social-app-component/ChatList";

import useNotificationSocket from "@/hooks/useNotificationSocket";
import useAppStore from "@/store/ZustandStore";

export default function MainLayout({ children }) {
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const prevThemeRef = useRef(null);

  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  const selectedChatId = useAppStore((s) => s.selectedChatId);
  const virtualChatUser = useAppStore((s) => s.virtualChatUser);
  const clearChatSelection = useAppStore((s) => s.clearChatSelection);
  const getSelectedChat = useAppStore((s) => s.getSelectedChat);
  const showVirtualChat = useAppStore((s) => s.showVirtualChat);
  const selectChat = useAppStore((s) => s.selectChat);

  const selectedChat = getSelectedChat();

  // Lấy userId & token từ localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedToken = localStorage.getItem("accessToken");
    if (storedUserId && storedToken) {
      setUserId(storedUserId);
      setToken(storedToken);
    }
  }, []);

  // Kích hoạt socket noti
  useNotificationSocket(userId, token);

  useEffect(() => {
    setMounted(true);
  }, []);

  const shouldAnimate =
    mounted && prevThemeRef.current && prevThemeRef.current !== resolvedTheme;

  useEffect(() => {
    if (mounted) prevThemeRef.current = resolvedTheme;
  }, [resolvedTheme, mounted]);

  const hideRightSidebar =
    pathname.startsWith("/settings") ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/chats");

  const renderRightSidebar = () => {
    if (hideRightSidebar) return null;

    return (
      <aside className="hidden md:flex justify-center items-end w-[80px] lg:w-[400px] lg:max-w-[400px] h-[calc(100vh-64px)] p-4">
        <div className="flex flex-col w-full h-full relative">
          {selectedChatId && selectedChat ? (
            <Chatbox
              chatId={selectedChatId}
              targetUser={selectedChat.target}
              onBack={clearChatSelection}
            />
          ) : virtualChatUser ? (
            <Chatbox
              chatId={null}
              targetUser={virtualChatUser}
              onBack={clearChatSelection}
            />
          ) : (
            <ChatList
              onSelectChat={(chatId, user) => {
                selectChat(chatId);
              }}
              selectedChatId={selectedChatId}
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
          <aside className="md:w-[80px] h-[calc(100vh-64px)] overflow-y-auto">
            <Sidebar />
          </aside>

          <main className="flex-1 h-[calc(100vh-64px)] overflow-y-auto px-4">
            <div
              className={`${
                hideRightSidebar ? "max-w-6xl" : "max-w-4xl"
              } w-full mx-auto space-y-6`}
            >
              {children}
            </div>
          </main>

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
