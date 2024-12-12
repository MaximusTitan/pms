"use client";

import { usePathname } from "next/navigation";
import { ThemeProvider } from "next-themes";
import {
  AppSidebar,
  AppSidebarHeader,
} from "@/components/components-app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const showSidebar =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/partner") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/programs") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/leads");

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <SidebarProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        {showSidebar && <AppSidebar />}
        {isMobile && <SidebarTrigger className="mt-4 ml-2" />}
        <main className="flex-1 flex flex-col">
          {/* {showSidebar && <AppSidebarHeader />} */}
          <div className="p-4">{children}</div>
        </main>
      </ThemeProvider>
    </SidebarProvider>
  );
}
