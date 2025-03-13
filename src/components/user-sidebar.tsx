"use client";

import Link from "next/link";

export function UserSidebar() {
  return (
    <aside className="w-64 bg-gray-100 min-h-screen p-4" dir="rtl">
      <nav className="space-y-2">
        <Link
          href="/support"
          className="block py-2 px-4 rounded hover:bg-gray-200">
          درخواست پشتیبانی
        </Link>
        <Link
          href="/chat-room/123"
          className="block py-2 px-4 rounded hover:bg-gray-200">
          اتاق گفتگو
        </Link>
      </nav>
    </aside>
  );
}
