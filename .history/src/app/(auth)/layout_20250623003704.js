import { Geist, Geist_Mono } from "next/font/google";
import  ThemeProvider  from "@/providers/ThemeProvider"
import Script from "next/script";


export default function MainLayout({ children }) {
  return (
    
    <div>
      {children}
    </div>
  );
}


