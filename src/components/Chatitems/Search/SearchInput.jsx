import React from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

export const SearchInput = ({ search, setSearch, handleKeyDown }) => {
  return (
    <div className="relative max-w-2xl mx-auto">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
      <Input
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full pl-10 pr-4 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 shadow-sm"
        aria-label="Search users"
      />
    </div>
  );
};