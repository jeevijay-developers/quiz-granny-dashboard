"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { createCategory } from "@/lib/server";
import toast from "react-hot-toast";

export default function CreateCategoryPage() {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    if (!name.trim()) {
      toast.error("Please enter a category name");
      setIsSubmitting(false);
      return;
    }

    try {
      await createCategory({ name: name.trim() });
      toast.success("Category created successfully!");

      // Clear form after successful creation
      setName("");
      setIsSubmitting(false);
    } catch (error: any) {
      console.error("Error creating category:", error);
      const errorMessage =
        error.response?.data?.error ||
        "Failed to create category. Please try again.";
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Create New Category
        </h1>
        <p className="text-muted-foreground mt-1">
          Add a new category for organizing quiz questions
        </p>
      </div>

      {/* Form */}
      <Card className="p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Category Name
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Science, History, Math"
              className="w-full"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-6 border-t border-border">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? "Creating..." : "Create Category"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
