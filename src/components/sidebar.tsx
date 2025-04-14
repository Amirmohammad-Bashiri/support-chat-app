"use client";

import type React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageCircle,
  Clock,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSupport } from "@/hooks/socket/use-socket";
import { useMediaQuery } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import useUser from "@/hooks/useUser";
import { useEffect, useState } from "react";

interface SidebarProps {
  children?: React.ReactNode; // This will be the trigger element
}

export function Sidebar({ children }: SidebarProps) {
  const pathname = usePathname();
  const { rooms } = useSupport();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isAgent, setIsAgent] = useState(false);
  const [open, setOpen] = useState(false);

  const { user } = useUser();

  useEffect(() => {
    if (user && user.role_name === "Admin") {
      setIsAgent(true);
    }
  }, [user]);

  // Define navigation items based on user role
  const navItems = isAgent
    ? [
        {
          name: "داشبورد",
          href: "/agent/dashboard",
          icon: LayoutDashboard,
        },
        {
          name: "گفتگوهای در انتظار",
          href: "/agent/pending-chats",
          icon: Clock,
        },
        {
          name: "گفتگوهای فعال",
          href: "/agent/active-chats",
          icon: CheckCircle,
        },
        // {
        //   name: "آمار و گزارشات",
        //   href: "/agent/reports",
        //   icon: BarChart,
        // },
        // {
        //   name: "مدیریت کاربران",
        //   href: "/agent/users",
        //   icon: Users,
        // },
        // {
        //   name: "تنظیمات",
        //   href: "/agent/settings",
        //   icon: Settings,
        // },
      ]
    : [
        {
          name: "درخواست پشتیبانی",
          href: "/user/support",
          icon: HelpCircle,
        },
        {
          name: "اتاق های گفتگو",
          href: "/user/chats",
          icon: MessageCircle,
        },
      ];

  const isActive = (path: string) => {
    return pathname === path;
  };

  // Get title and icon based on user role
  const getTitle = () => {
    return isAgent ? "پنل پشتیبان" : "مرکز پشتیبانی";
  };

  const getTitleIcon = () => {
    return isAgent ? LayoutDashboard : MessageCircle;
  };

  const TitleIcon = getTitleIcon();

  const SidebarContent = () => (
    <div className="py-2 flex flex-col h-full" dir="rtl">
      <div className="px-3 py-2">
        <div className="bg-primary/5 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-primary">{getTitle()}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {isAgent ? "خوش آمدید" : "به مرکز پشتیبانی خوش آمدید"}
          </p>
        </div>
      </div>

      <Separator className="my-2" />

      <div className="px-3 py-2">
        <h2 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-3 px-2">
          منوی اصلی
        </h2>
        <nav className="space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && setOpen(false)}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                "hover:bg-primary/10 hover:text-primary",
                "focus:outline-none focus:ring-2 focus:ring-primary/20",
                isActive(item.href)
                  ? isAgent
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-primary/15 text-primary font-semibold"
                  : "text-foreground/80"
              )}>
              <div className="flex items-center">
                <item.icon
                  className={cn(
                    "ml-3 h-5 w-5",
                    isActive(item.href)
                      ? isAgent
                        ? "text-primary-foreground"
                        : "text-primary"
                      : "text-muted-foreground"
                  )}
                />
                {item.name}
              </div>
            </Link>
          ))}
        </nav>
      </div>

      {/* Active chats section - only for agent */}
      {isAgent && rooms.length > 0 && (
        <div className="mt-4 px-3 flex-1 overflow-hidden flex flex-col">
          <h3 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-3 px-2 flex items-center justify-between">
            گفتگوهای فعال
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200">
              {rooms.filter(room => room.agent).length}
            </Badge>
          </h3>
        </div>
      )}

      <div className="mt-auto px-3 py-4">
        <div className="bg-muted rounded-lg p-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-primary" />
            {isAgent ? "راهنمای پشتیبان" : "نیاز به کمک دارید؟"}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {isAgent
              ? "برای مشاهده راهنما کلیک کنید"
              : "با پشتیبانی تماس بگیرید"}
          </p>
          <Link
            href={isAgent ? "/agent/help" : "/help"}
            onClick={() => isMobile && setOpen(false)}
            className="mt-2 text-xs text-primary hover:underline inline-block">
            مشاهده راهنما
          </Link>
        </div>
      </div>
    </div>
  );

  // For mobile: use Sheet component with SheetTrigger
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent
          side="right"
          className="w-72 p-0 border-l-primary/20"
          style={{ direction: "rtl" }}>
          <SheetHeader className="text-right p-4 pb-0 border-b">
            <SheetTitle className="text-right flex items-center gap-2">
              <TitleIcon className="h-5 w-5 text-primary" />
              <span>{isAgent ? "پنل پشتیبان" : "پشتیبانی"}</span>
            </SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto h-[calc(100vh-4rem)]">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // For desktop: use fixed sidebar
  return (
    <div
      className={cn(
        "relative z-10 bg-white shadow-sm",
        "w-72 h-[calc(100vh-4rem)]",
        "border-l border-l-primary/10",
        "overflow-hidden flex flex-col"
      )}>
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
          <TitleIcon className="h-5 w-5" />
          <span>{isAgent ? "پنل پشتیبان" : "پشتیبانی"}</span>
        </h2>
      </div>
      <div className="flex-1 overflow-hidden">
        <SidebarContent />
      </div>
    </div>
  );
}
