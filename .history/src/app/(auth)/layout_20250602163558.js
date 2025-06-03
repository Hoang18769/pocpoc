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
    
   <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Main Section */}
      <main className="flex-grow flex flex-col md:flex-row h-full ">
      </main>
      </div>
  );
}


