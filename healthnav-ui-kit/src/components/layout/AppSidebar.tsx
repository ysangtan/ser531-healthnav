import { Link, useLocation } from "react-router-dom";
import { Search, Heart, GitCompare, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompare } from "@/hooks/use-compare";
import { useSaved } from "@/hooks/use-saved";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const location = useLocation();
  const { compareList } = useCompare();
  const { savedProviders } = useSaved();

  const sidebarItems = [
    { to: "/search", icon: Search, label: "Search", badge: null },
    { to: "/saved", icon: Heart, label: "Saved", badge: savedProviders.length || null },
    { to: "/compare", icon: GitCompare, label: "Compare", badge: compareList.length || null },
    { to: "/settings", icon: Settings, label: "Settings", badge: null },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-14 sm:top-16 z-40 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] w-64 border-r bg-sidebar transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile Close Button */}
        <div className="flex items-center justify-end p-2 lg:hidden">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-4">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.to || 
              (item.to === "/search" && location.pathname === "/");
            
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          <div className="rounded-lg bg-primary/5 p-4">
            <p className="text-sm font-medium text-foreground">Need Help?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Check our guide on finding the right provider.
            </p>
            <Button variant="link" className="mt-2 h-auto p-0 text-xs text-primary">
              View Guide →
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
