import { Link, useLocation } from "@tanstack/react-router";
import { Home, Wrench, Bot, MessageSquare, ShieldCheck, Search } from "lucide-react";

export function MobileAppDock() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { label: "Home", to: "/", Icon: Home },
    { label: "Tools", to: "/tools", Icon: Wrench },
    { label: "Agents", to: "/agents", Icon: Bot },
    { label: "Community", to: "/community", Icon: MessageSquare },
    { label: "Governance", to: "/governance", Icon: ShieldCheck },
  ];

  return (
    <nav
      aria-label="Mobile App Navigation Bar"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/90 px-3 py-2.5 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 md:hidden select-none pb-safe"
    >
      <div className="mx-auto flex max-w-md items-center justify-around">
        {navItems.map(({ label, to, Icon }) => {
          const isActive = to === "/" ? currentPath === "/" : currentPath.startsWith(to);

          return (
            <Link
              key={to}
              to={to}
              className={`group flex flex-col items-center gap-1 rounded-2xl px-3 py-1.5 transition-all duration-200 ${
                isActive
                  ? "bg-primary/15 text-primary scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <Icon className={`h-5 w-5 transition-transform duration-200 group-active:scale-95 ${isActive ? "text-primary" : ""}`} />
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
