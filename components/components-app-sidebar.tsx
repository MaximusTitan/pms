import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
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
  LayoutDashboardIcon,
  HandshakeIcon,
  UsersIcon,
  NewspaperIcon,
  BookTextIcon,
} from "lucide-react";
import Link from "next/link";
import { ThemeSwitcher } from "./theme-switcher";
import { signOutAction } from "@/app/actions";
import { useRouter, usePathname } from "next/navigation";

const adminNavData = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboardIcon,
    isActive: true,
  },
  { title: "Affiliate", url: "/admin/affiliates", icon: HandshakeIcon },
  { title: "Programs", url: "/admin/programs", icon: BookTextIcon },
  { title: "Reports", url: "/admin/reports", icon: NewspaperIcon },
  { title: "Leads", url: "/admin/leads", icon: UsersIcon },
];

const partnerNavData = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboardIcon,
    isActive: true,
  },
  { title: "Programs", url: "/programs", icon: BookTextIcon },
  { title: "Reports", url: "/reports", icon: NewspaperIcon },
  { title: "Leads", url: "/leads", icon: UsersIcon },
];

const getAdminEmails = () => {
  const emails = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
  return emails.split(",").map((email) => email.trim());
};

const authorizedEmails = getAdminEmails();

export function AppSidebar() {
  const [userEmail, setUserEmail] = useState("guest@example.com");
  const { state } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const [navData, setNavData] = useState(partnerNavData);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserEmail(user.email ?? "guest@example.com");

        // Determine the appropriate navigation data based on the user's email
        if (authorizedEmails.includes(user.email ?? "guest@example.com")) {
          setNavData(adminNavData);
        } else {
          setNavData(partnerNavData);
        }
      }
    };

    fetchUser();
  }, [router]);

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
            {navData.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  className={pathname === item.url ? "bg-neutral-200" : ""}
                >
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

      <SidebarTrigger className="ml-2" />
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
