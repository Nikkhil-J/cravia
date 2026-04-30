"use client";

import { useState, useRef, useEffect, useCallback, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { ROUTES } from "@/lib/constants/routes";
import {
  setExploreQuery,
  getExploreQuery,
  subscribeExploreQuery,
} from "@/lib/stores/explore-search";

const SEARCH_PLACEHOLDERS = [
  "Search for a dish... e.g. Butter Chicken",
  "Search for a dish... e.g. Margherita Pizza",
  "Search for a dish... e.g. Hyderabadi Biryani",
  "Search for a dish... e.g. Masala Dosa",
  "Search for a dish... e.g. Momos",
  "Search for a dish... e.g. Pasta Alfredo",
];

interface SearchBarProps {
  variant: "navbar" | "hero";
  autoFocus?: boolean;
  initialQuery?: string;
  className?: string;
}

export function SearchBar({
  variant,
  autoFocus,
  initialQuery = "",
  className,
}: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const isOnExplorePage = pathname === ROUTES.EXPLORE;

  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const rotatePlaceholder = useCallback(() => {
    setPlaceholderIndex((i) => (i + 1) % SEARCH_PLACEHOLDERS.length)
  }, [])
  useEffect(() => {
    const id = setInterval(rotatePlaceholder, 3500)
    return () => clearInterval(id)
  }, [rotatePlaceholder])

  const storeQuery = useSyncExternalStore(
    subscribeExploreQuery,
    getExploreQuery,
    () => ""
  );
  const [query, setQuery] = useState(() => initialQuery || getExploreQuery());
  const [lastStoreQuery, setLastStoreQuery] = useState(storeQuery);
  if (storeQuery !== lastStoreQuery) {
    setLastStoreQuery(storeQuery);
    if (storeQuery !== query) {
      setQuery(storeQuery);
    }
  }

  useEffect(() => {
    if (variant !== "navbar" || !isOnExplorePage) return;
    const params = new URLSearchParams(window.location.search);
    const urlQ = params.get("q")?.trim();
    if (urlQ && !query) {
      setQuery(urlQ);
    }
    if (!params.has("focus")) return;

    const timer = setTimeout(() => {
      inputRef.current?.focus();
      const url = new URL(window.location.href);
      url.searchParams.delete("focus");
      window.history.replaceState(null, "", url.pathname + (url.search || ""));
    }, 300);
    return () => clearTimeout(timer);
  }, [variant, isOnExplorePage]);

  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (variant !== "navbar") return;
    if (!isOnExplorePage) return;
    setExploreQuery(debouncedQuery.length >= 2 ? debouncedQuery : "");
  }, [debouncedQuery, variant, isOnExplorePage]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setExploreQuery(trimmed);

    if (!isOnExplorePage) {
      router.push(ROUTES.EXPLORE);
    }
  }

  if (variant === "hero") {
    return (
      <div className="flex items-center gap-3 rounded-pill border border-border bg-card py-4 px-6 text-left shadow-lg">
        <Search className="h-5 w-5 shrink-0 text-text-muted" />
        <span className="flex-1 text-base text-text-muted transition-opacity duration-300">
          {SEARCH_PLACEHOLDERS[placeholderIndex]}
        </span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("hidden w-full max-w-[400px] md:block", className)}
    >
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-muted" />
        <Input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
          autoFocus={autoFocus}
          className={cn(
            "h-auto w-full rounded-pill border border-border bg-card/50 py-2 pl-10 pr-4 text-base md:text-sm font-body",
            "placeholder:text-text-muted focus-visible:border-primary focus-visible:ring-0",
          )}
        />
      </div>
    </form>
  );
}
