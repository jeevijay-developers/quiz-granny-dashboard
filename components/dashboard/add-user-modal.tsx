"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { createUser } from "@/lib/server";
import toast from "react-hot-toast";

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddUserModal({
  open,
  onOpenChange,
  onSuccess,
}: AddUserModalProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!password.trim()) {
      toast.error("Password is required");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get admin ID from localStorage
      const adminId = localStorage.getItem("adminId");

      if (!adminId) {
        toast.error("Admin authentication required");
        setIsSubmitting(false);
        return;
      }

      await createUser(
        {
          username: username.trim(),
          email: email.trim(),
          password: password.trim(),
          role,
        },
        adminId
      );

      toast.success("User created successfully!");

      // Reset form
      setUsername("");
      setEmail("");
      setPassword("");
      setRole("user");

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating user:", error);
      const errorMessage =
        error.response?.data?.error ||
        "Failed to create user. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setRole("user");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account. Fill in all the required fields.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <Input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
              className="w-full"
              autoComplete="off"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="w-full"
              autoComplete="off"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <Input
              type="password"
              placeholder="Enter password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              className="w-full"
              autoComplete="new-password"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium mb-2 ">Role</label>
            <Select
              value={role}
              onValueChange={setRole}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full hover:bg-gray-400/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create User"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
