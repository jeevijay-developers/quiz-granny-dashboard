"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Loader2, Trash2, Shield, User } from "lucide-react";
import { getAllUsers, deleteUser } from "@/lib/server";
import toast from "react-hot-toast";
import AddUserModal from "@/components/dashboard/add-user-modal";
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

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const adminId = localStorage.getItem("adminId");

      if (!adminId) {
        toast.error("Admin authentication required");
        return;
      }

      const data = await getAllUsers(adminId);
      setUsers(data);
    } catch (err) {
      console.error("Error loading users:", err);
      toast.error("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      setDeleting(id);
      const adminId = localStorage.getItem("adminId");

      if (!adminId) {
        toast.error("Admin authentication required");
        return;
      }

      await deleteUser(id, adminId);
      setUsers(users.filter((u) => u._id !== id));
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      toast.success("User deleted successfully!");
    } catch (err) {
      console.error("Error deleting user:", err);
      const errorMessage =
        err.response?.data?.error || "Failed to delete user. Please try again.";
      toast.error(errorMessage);
    } finally {
      setDeleting(null);
    }
  };

  const handleAddSuccess = () => {
    loadUsers();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground mt-1">
            {users.length} total users
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Users Table */}
      <Card className="overflow-hidden">
        {users.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              No users found. Add your first user to get started.
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Username
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Role
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user, index) => (
                  <tr
                    key={user._id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {user.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-foreground">
                        {user.email}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role === "admin" ? (
                          <Shield className="w-3 h-3" />
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(user)}
                          disabled={deleting === user._id}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {deleting === user._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add User Modal */}
      <AddUserModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={handleAddSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user "{userToDelete?.username}" from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && handleDelete(userToDelete._id)}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
