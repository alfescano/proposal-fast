import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, Users, BarChart3, Calendar, Bell, Zap, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardNav() {
  const location = useLocation();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/brand-kit", label: "Brand Kit", icon: Palette },
    { href: "/crm-settings", label: "CRM", icon: Settings },
    { href: "/calendar-settings", label: "Calendar", icon: Calendar },
    { href: "/notifications", label: "Alerts", icon: Bell },
    { href: "/webhooks", label: "Automations", icon: Zap },
    { href: "/teams", label: "Teams", icon: Users },
  ];

  return (
    <nav className="flex gap-2">
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;
        const Icon = item.icon;
        return (
          <Link key={item.href} to={item.href}>
            <Button
              variant={isActive ? "default" : "ghost"}
              size="sm"
              className="gap-2"
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}