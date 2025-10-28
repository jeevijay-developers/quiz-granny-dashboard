"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Navbar() {
  const [userName, setuserName] = useState("Admin");

  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) setuserName(name);
  }, []);

  return (
    <nav className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search questions..."
            className="pl-10 bg-secondary border-border"
          />
        </div>
      </div>

      <div className="text-sm font-medium">
        Welcome, <span className="text-primary">{userName}</span>
      </div>
    </nav>
  );
}
