"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import BackendHealthCheck from "@/components/backend-health-check";
import { loginUser } from "@/lib/server";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!email.trim() || !password.trim()) {
        setError("Please enter both email and password");
        setIsLoading(false);
        return;
      }

      const response = await loginUser({
        email: email.trim(),
        password: password.trim(),
      });

      if (response.user) {
        // Store user data in localStorage
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("adminId", response.user._id);
        localStorage.setItem("adminName", response.user.username);
        localStorage.setItem("adminEmail", response.user.email);
        localStorage.setItem("userRole", response.user.role);

        toast.success("Login successful!");
        router.push("/dashboard");
      } else {
        setError("Invalid response from server");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage =
        err.response?.data?.error ||
        "Invalid email or password. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BackendHealthCheck>
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-lg">
          <div className="p-8">
            {/* Logo/Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-primary mb-2">
                Quiz Granny
              </h1>
              <p className="text-muted-foreground">Admin Dashboard</p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email or Username
                </label>
                <Input
                  type="text"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2"
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>

            {/* Info Note */}
            <div className="mt-6 p-4 bg-secondary rounded-lg">
              <p className="text-xs text-muted-foreground">
                Login with your credentials to access the Quiz Granny Admin
                Dashboard
              </p>
            </div>
          </div>
        </Card>
      </div>
    </BackendHealthCheck>
  );
}
