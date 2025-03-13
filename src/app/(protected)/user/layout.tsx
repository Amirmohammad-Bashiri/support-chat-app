import { UserSidebar } from "@/components/user-sidebar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <UserSidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
