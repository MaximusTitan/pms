"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client"; // Supabase client import
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  BadgeCheck,
  BookOpen,
  Bot,
  ChevronsUpDown,
  Frame,
  LogOut,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";
import Link from "next/link";
import { ThemeSwitcher } from "./theme-switcher";
import { signOutAction } from "@/app/actions";

const navData = {
  navMain: [
    { title: "Dashboard", url: "/admin", icon: SquareTerminal, isActive: true },
    { title: "Affiliate", url: "/admin/affiliates", icon: Bot },
    { title: "Programs", url: "/admin/programs", icon: BookOpen },
    { title: "Reports", url: "/admin/reports", icon: Settings2 },
  ],
};

export function AppSidebar() {
  const [userEmail, setUserEmail] = useState("guest@example.com"); // Default email
  const { state } = useSidebar(); // Add this line to get sidebar state

  // Fetch the user session from Supabase
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient(); // Initialize Supabase client
      const {
        data: { user },
      } = await supabase.auth.getUser(); // Get user session

      if (user) {
        setUserEmail(user.email ?? "guest@example.com"); // Set email from the user session
      }
    };

    fetchUser();
  }, []);

  return (
    <Sidebar collapsible="icon">
      {/* Sidebar Header with Logo */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <p className="text-rose-500 font-extrabold">
                  {state === "collapsed" ? "PMS" : "Partner Management System"}
                </p>
              </DropdownMenuTrigger>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      {/* Main Navigation Links */}
      <SidebarContent className="mt-4">
        <SidebarGroup>
          <SidebarMenu>
            {navData.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton tooltip={item.title} asChild>
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* User Avatar and Dropdown Menu in Sidebar Footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      {userEmail.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate text-xs font-semibold">
                      {userEmail}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              {/* Dropdown Menu Content */}
              <DropdownMenuContent
                side="bottom"
                align="end"
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src="/default-avatar.png"
                        alt="User Avatar"
                      />
                      <AvatarFallback className="rounded-lg">
                        {userEmail.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate text-xs font-semibold">
                        {userEmail}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      await signOutAction();
                    }}
                    className="w-full"
                  >
                    <button type="submit" className="flex w-full items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

// Sidebar Header Component with Theme Switcher
export function AppSidebarHeader() {
  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 px-4 items-center justify-between gap-2 border-b">
        <SidebarTrigger className="-ml-1" />
        <ThemeSwitcher />
      </header>
    </SidebarInset>
  );
}