"use client";

import Link from "next/link";
import { MessageCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-mobile";
import { usePathname } from "next/navigation";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface UserSidebarProps {
  children?: React.ReactNode; // This will be the trigger element
}

export function UserSidebar({ children }: UserSidebarProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const pathname = usePathname();

  const navItems = [
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

  const SidebarContent = () => (
    <div className="py-2 flex flex-col h-full" dir="rtl">
      <div className="px-3 py-2">
        <div className="bg-primary/5 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-primary">مرکز پشتیبانی</h3>
          <p className="text-xs text-muted-foreground mt-1">
            به مرکز پشتیبانی خوش آمدید
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
              className={cn(
                "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                "hover:bg-primary/10 hover:text-primary",
                "focus:outline-none focus:ring-2 focus:ring-primary/20",
                isActive(item.href)
                  ? "bg-primary/15 text-primary font-semibold"
                  : "text-foreground/80"
              )}>
              <item.icon
                className={cn(
                  "ml-3 h-5 w-5",
                  isActive(item.href) ? "text-primary" : "text-muted-foreground"
                )}
              />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto px-3 py-4">
        <div className="bg-muted rounded-lg p-3">
          <h3 className="text-sm font-medium">نیاز به کمک دارید؟</h3>
          <p className="text-xs text-muted-foreground mt-1">
            با پشتیبانی تماس بگیرید
          </p>
          <Link
            href="/help"
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
              <MessageCircle className="h-5 w-5 text-primary" />
              <span>پشتیبانی</span>
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
        "overflow-y-auto"
      )}>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <span>پشتیبانی</span>
          </h2>
        </div>
        <SidebarContent />
      </div>
    </div>
  );
}
