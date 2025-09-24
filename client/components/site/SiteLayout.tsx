import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Eye, Sparkles } from "lucide-react";

export default function SiteLayout() {
  const { pathname, hash } = useLocation();
  const isHome = pathname === "/";

  const nav = [
    {
      href: isHome ? "#intelligent" : "/#intelligent",
      label: "Intelligent by Design",
    },
    { href: isHome ? "#how" : "/#how", label: "How it Works" },
    { href: isHome ? "#gallery" : "/#gallery", label: "Screenshots" },
    {
      href: isHome ? "#contributors" : "/#contributors",
      label: "Contributors",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-3 py-2 rounded-md"
      >
        Skip to content
      </a>

      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b border-border/60 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        )}
      >
        <div className="container mx-auto flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="text-lg tracking-tight">EchoSight</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            {nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className={cn(
                  "text-muted-foreground hover:text-foreground transition-colors relative group",
                  hash && n.href.endsWith(hash) && "text-foreground",
                )}
              >
                {n.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/check-it-out">
              <Button className="rounded-full bg-primary hover:bg-black hover:text-primary hover:border-primary hover:border-2 shadow-lg transition-all duration-300">
                <Sparkles className="mr-2" /> Check It Out
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main id="content" className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border/60">
        <div className="container mx-auto py-10 grid gap-6 md:grid-cols-2 items-center">
          <div className="flex items-center gap-2">
            <div>
              <p className="font-semibold">EchoSight</p>
              <p className="text-sm text-muted-foreground">
                The sound that helps you see.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
