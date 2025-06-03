import { Geist, Geist_Mono } from "next/font/google";
import  ThemeProvider  from "@/providers/ThemeProvider"
import Script from "next/script";
import Image from "next/image";
import { ArrowDown } from "lucide-react";
import Connectimg from "@/assests/photo/Connect.jpg"
import useMeasure from "react-use-measure";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function MainLayout({ children }) {
  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  
  const [formBoundsRef, { height }] = useMeasure()
  return (
    
   <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Main Section */}
      <main className="flex-grow flex flex-col md:flex-row h-full ">
      <div className="w-full md:w-1/2 h-screen flex items-center justify-center bg-muted relative">
          <Image
            src={Connectimg}
            alt="Network illustration"
            width={400}
            height={400}
            className="max-w-full h-auto object-contain"
            priority
          />
          {/* Mobile button */}
          <div className="absolute bottom-10 left-0 right-0 flex justify-center md:hidden">
            <button
              onClick={scrollToForm}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg hover:opacity-90 transition-opacity"
            >
              Reset Password
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
      </div>
  );
}


