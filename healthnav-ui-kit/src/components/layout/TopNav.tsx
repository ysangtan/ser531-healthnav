import { Link, useLocation } from "react-router-dom";
import { HelpCircle, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCompare } from "@/hooks/use-compare";
import { useSaved } from "@/hooks/use-saved";
import { cn } from "@/lib/utils";

interface TopNavProps {
  onMenuClick?: () => void;
}

const navLinks = [
  { to: "/search", label: "Search" },
  { to: "/saved", label: "Saved" },
  { to: "/providers", label: "Providers" },
  { to: "/hospitals", label: "Hospitals" },
];

export function TopNav({ onMenuClick }: TopNavProps) {
  const location = useLocation();
  const { savedProviders } = useSaved();
  const { compareList } = useCompare();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 lg:px-6">
        {/* Left: Logo + Mobile Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg gradient-primary">
              <span className="text-base sm:text-lg font-bold text-primary-foreground">H</span>
            </div>
            <span className="text-lg sm:text-xl font-semibold text-foreground hidden xs:inline">
              Health<span className="text-primary">Nav</span>
            </span>
          </Link>
        </div>

        {/* Center: Nav Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to || (link.to === "/search" && location.pathname === "/");
            const showBadge = link.to === "/saved" && savedProviders.length > 0;
            
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {link.label}
                {showBadge && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {savedProviders.length}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Help + Profile */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground h-9 w-9">
            <HelpCircle className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-primary/10 text-primary hover:bg-primary/20 h-9 w-9"
              >
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/settings">Profile Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/saved">
                  Saved Providers
                  {savedProviders.length > 0 && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {savedProviders.length}
                    </span>
                  )}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/compare">
                  Compare List
                  {compareList.length > 0 && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {compareList.length}/3
                    </span>
                  )}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
