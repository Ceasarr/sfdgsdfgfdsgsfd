"use client";

import { Search } from "./icons";
import { useState, useEffect } from "react";

interface SearchBarProps {
    onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
    const [query, setQuery] = useState("");

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, onSearch]);

    return (
        <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск товаров..."
            className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 sm:py-2.5 text-base sm:text-sm backdrop-blur shadow-sm transition-all placeholder:text-muted-foreground focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:shadow-md"
        />
    );
}
