"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Clock,
  CheckCircle,
  BarChart,
  Settings,
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

interface AgentSidebarProps {
  children?: React.ReactNode; // This will be the trigger element
}

export function AgentSidebar({ children }: AgentSidebarProps) {
  const pathname = usePathname();
  const { rooms } = useSupport();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const navItems = [
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
    {
      name: "آمار و گزارشات",
      href: "/agent/reports",
      icon: BarChart,
    },
    {
      name: "مدیریت کاربران",
      href: "/agent/users",
      icon: Users,
    },
    {
      name: "تنظیمات",
      href: "/agent/settings",
      icon: Settings,
    },
  ];

  const SidebarContent = () => (
    <div className="py-2 flex flex-col h-full" dir="rtl">
      <div className="px-3 py-2">
        <div className="bg-primary/5 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-primary">پنل پشتیبان</h3>
          <p className="text-xs text-muted-foreground mt-1">خوش آمدید</p>
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
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                "hover:bg-primary/10 hover:text-primary",
                "focus:outline-none focus:ring-2 focus:ring-primary/20",
                pathname === item.href
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-foreground/80"
              )}>
              <div className="flex items-center">
                <item.icon
                  className={cn(
                    "ml-3 h-5 w-5",
                    pathname === item.href
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  )}
                />
                {item.name}
              </div>
            </Link>
          ))}
        </nav>
      </div>

      {rooms.length > 0 && (
        <div className="mt-4 px-3 flex-1 overflow-hidden flex flex-col">
          <h3 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-3 px-2 flex items-center justify-between">
            گفتگوهای فعال
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200">
              {rooms.filter(room => room.agent).length}
            </Badge>
          </h3>

          {/* <ScrollArea className="flex-1 pr-3 -mr-3">
            <div className="space-y-1">
              {rooms
                .filter(room => room.agent)
                .map(room => (
                  <Link
                    key={room.id}
                    href={`/agent/chats/${room.id}`}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
                      "hover:bg-primary/10 hover:text-primary",
                      pathname === `/agent/chats/${room.id}`
                        ? "bg-primary/15 text-primary font-medium"
                        : "text-foreground/80"
                    )}>
                    <div className="bg-primary/10 p-1.5 rounded-full ml-2">
                      <MessageSquare className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="truncate">کاربر: {room.id}</span>
                  </Link>
                ))}
            </div>
          </ScrollArea> */}
        </div>
      )}

      <div className="mt-auto px-3 py-4">
        <div className="bg-muted rounded-lg p-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-primary" />
            راهنمای پشتیبان
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            برای مشاهده راهنما کلیک کنید
          </p>
          <Link
            href="/agent/help"
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
      <Sheet>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent
          side="right"
          className="w-72 p-0 border-l-primary/20"
          style={{ direction: "rtl" }}>
          <SheetHeader className="text-right p-4 pb-0 border-b">
            <SheetTitle className="text-right flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              <span>پنل پشتیبان</span>
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
          <LayoutDashboard className="h-5 w-5" />
          <span>پنل پشتیبان</span>
        </h2>
      </div>
      <div className="flex-1 overflow-hidden">
        <SidebarContent />
      </div>
    </div>
  );
}
