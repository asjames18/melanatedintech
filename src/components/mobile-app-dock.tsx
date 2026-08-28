import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link, useLocation } from "@tanstack/react-router";
import { MessageSquare, Wrench, Trophy, Bot, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getUnreadNotificationCount } from "@/lib/community.functions";

export function MobileAppDock() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [me, setMe] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null));
  }, []);

  const profileTarget = me ? `/u/${me}` : "/auth";
  const getUnreadCount = useServerFn(getUnreadNotificationCount);
  const unreadQuery = useQuery({
    queryKey: ["mobile-dock-unread-notification-count"],
    queryFn: () => getUnreadCount(),
    enabled: !!me,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  const unreadCount = unreadQuery.data?.count ?? 0;

  const navItems = [
    { label: "Feed", to: "/community", Icon: MessageSquare },
    { label: "Tools", to: "/tools", Icon: Wrench },
    { label: "Challenges", to: "/challenges", Icon: Trophy },
    { label: "Agents", to: "/agents", Icon: Bot },
    { label: "Profile", to: profileTarget, Icon: User },
  ];

  return (
    <nav
      aria-label="Mobile Social Community App Dock"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/90 px-2 py-2.5 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 md:hidden select-none pb-safe"
    >
      <div className="mx-auto flex max-w-md items-center justify-around">
        {navItems.map(({ label, to, Icon }) => {
          const isActive = to === "/" ? currentPath === "/" : currentPath.startsWith(to);

          return (
            <Link
              key={label}
              to={to}
              aria-label={label === "Feed" && unreadCount > 0 ? `${label}, ${unreadCount} unread notifications` : label}
              className={`group relative flex flex-col items-center gap-1 rounded-2xl px-2.5 py-1.5 transition-all duration-200 ${
                isActive
                  ? "bg-primary/15 text-primary scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <span className="relative">
                <Icon className={`h-5 w-5 transition-transform duration-200 group-active:scale-95 ${isActive ? "text-primary" : ""}`} />
                {label === "Feed" && unreadCount > 0 && (
                  <span aria-hidden="true" className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-extrabold leading-none text-primary-foreground ring-2 ring-background">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </span>
              <span className={`text-[10px] font-bold tracking-tight ${isActive ? "text-primary font-extrabold" : ""}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
