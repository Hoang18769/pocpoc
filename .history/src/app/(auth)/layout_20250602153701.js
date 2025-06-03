import { Geist, Geist_Mono } from "next/font/google";
import  ThemeProvider  from "@/providers/ThemeProvider"
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function MainLayout({ children }) {
  return (
    
    <div className="flex min-h-screen w-full">
      <div className="hidden lg:block w-1/2 bg-muted" />
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-6">
        {children}
      </div>
    </div>
  );
}


