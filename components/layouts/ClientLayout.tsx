"use client";

import { usePathname } from "next/navigation";
import { ThemeProvider } from "next-themes";
import {
  AppSidebar,
  AppSidebarHeader,
} from "@/components/components-app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

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
    pathname.startsWith("/programs");

  return (
    <SidebarProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {showSidebar && <AppSidebar />}
        <main className="flex-1 flex flex-col">
          {showSidebar && <AppSidebarHeader />}
          <div className="p-4">{children}</div>
        </main>
      </ThemeProvider>
    </SidebarProvider>
  );
}
