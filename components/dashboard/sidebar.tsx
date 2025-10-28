"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Plus, List, LogOut, HelpCircle } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const menuItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Manage Questions", href: "/dashboard/manage", icon: List },
    {
      label: "All Questions",
      href: "/dashboard/all-questions",
      icon: List,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userName");
    router.push("/");
    setLogoutDialogOpen(false);
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <h2 className="text-2xl font-bold text-sidebar-primary">Quiz Granny</h2>
        <p className="text-xs text-muted-foreground mt-1">Admin Panel</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/20"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          onClick={handleLogoutClick}
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout Confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will need to sign in again to
              access the admin panel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive hover:bg-destructive/90"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}
