"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllQuestions, getAllCategories } from "@/lib/server";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Category {
  _id: string;
  name: string;
}

interface Question {
  _id: string;
  categories: Array<{ _id: string; name: string } | string>;
}

export default function DashboardPage() {
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categoryQuestionCount, setCategoryQuestionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCategory && allQuestions.length > 0) {
      calculateCategoryQuestions();
    }
  }, [selectedCategory, allQuestions]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [questionsData, categoriesData] = await Promise.all([
        getAllQuestions(),
        getAllCategories(),
      ]);

      setAllQuestions(questionsData);
      setTotalQuestions(questionsData.length);
      setCategories(categoriesData);
      setTotalCategories(categoriesData.length);

      // Set first category as default if available
      if (categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0]._id);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const calculateCategoryQuestions = () => {
    const count = allQuestions.filter((question) => {
      if (!question.categories || question.categories.length === 0) {
        return false;
      }
      return question.categories.some((cat) => {
        const catId = typeof cat === "string" ? cat : cat._id;
        return catId === selectedCategory;
      });
    }).length;
    setCategoryQuestionCount(count);
  };

  const getSelectedCategoryName = () => {
    const category = categories.find((cat) => cat._id === selectedCategory);
    return category ? category.name : "Select category";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back to Quiz Granny Admin
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Total Questions
              </p>
              <p className="text-3xl font-bold text-primary">
                {totalQuestions}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Total Categories
              </p>
              <p className="text-3xl font-bold text-primary">
                {totalCategories}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏷️</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Questions by Category
            </p>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full mb-3">
                <SelectValue placeholder="Select a category">
                  {getSelectedCategoryName()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-3xl font-bold text-primary">
              {categoryQuestionCount}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              questions in this category
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
