"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import {
  LayoutDashboard,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Plus,
  Users,
} from "lucide-react";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Get user role from localStorage
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("userRole");
    router.push("/");
  };

  // Define all navigation items with role requirements
  const allNavItems = [
    {
      href: "/dashboard",
      label: "Overview",
      icon: LayoutDashboard,
      roles: ["admin", "user"],
    },
    {
      href: "/dashboard/questions",
      label: "Create Questions",
      icon: Plus,
      roles: ["admin", "user"],
    },
    {
      href: "/dashboard/all-questions",
      label: "Manage Questions",
      icon: HelpCircle,
      roles: ["admin", "user"],
    },
    {
      href: "/dashboard/category/create",
      label: "Create Category",
      icon: Plus,
      roles: ["admin"],
    },
    {
      href: "/dashboard/category/manage",
      label: "Manage Category",
      icon: HelpCircle,
      roles: ["admin"],
    },
    {
      href: "/dashboard/users",
      label: "Users",
      icon: Users,
      roles: ["admin"],
    },
  ];

  // Filter navigation items based on user role
  const navItems = allNavItems.filter(
    (item) => userRole && item.roles.includes(userRole)
  );

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 hover:bg-secondary rounded-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Logo */}
          <div className="mb-8 mt-8 md:mt-0">
            <h1 className="text-2xl font-bold text-sidebar-primary">
              Quiz Granny
            </h1>
            <p className="text-xs text-sidebar-foreground/60">
              Admin Dashboard
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 gap-1 flex flex-col mb-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    onClick={() => setIsOpen(false)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-primary/10"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <Button
            onClick={() => setShowLogoutDialog(true)}
            variant="outline"
            className="w-full flex items-center gap-2 justify-center bg-transparent hover:bg-gray-800/10"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will need to login again to
              access the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-gray-800/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
