"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Upload, X, Check, ChevronDown } from "lucide-react";
import {
  createQuestion,
  createQuestionWithFiles,
  getAllCategories,
  getUserById,
} from "@/lib/server";
import toast from "react-hot-toast";

interface QuestionFormData {
  question: string;
  questionImage: File | null;
  questionImagePreview: string | null;
  options: Array<{
    text: string;
    image: File | null;
    imagePreview: string | null;
  }>;
  explanation: string;
  explanationImage: File | null;
  explanationImagePreview: string | null;
  createdBy: string;
  correctAnswer: number;
  difficulty: number;
  categories: string[];
}

interface Category {
  _id: string;
  name: string;
}

export default function CreateQuestionsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<QuestionFormData>({
    question: "",
    questionImage: null,
    questionImagePreview: null,
    options: [
      { text: "", image: null, imagePreview: null },
      { text: "", image: null, imagePreview: null },
      { text: "", image: null, imagePreview: null },
      { text: "", image: null, imagePreview: null },
    ],
    explanation: "",
    explanationImage: null,
    explanationImagePreview: null,
    correctAnswer: 0,
    createdBy: "",
    difficulty: 3,
    categories: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setCategoryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Failed to load categories");
    }
  };

  const toggleCategory = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const getSelectedCategoryNames = () => {
    return categories
      .filter((cat) => formData.categories.includes(cat._id))
      .map((cat) => cat.name)
      .join(", ");
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, question: e.target.value });
  };

  const handleQuestionImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({
          ...formData,
          questionImage: file,
          questionImagePreview: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveQuestionImage = () => {
    setFormData({
      ...formData,
      questionImage: null,
      questionImagePreview: null,
    });
  };

  const handleExplanationChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, explanation: e.target.value });
  };

  const handleExplanationImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({
          ...formData,
          explanationImage: file,
          explanationImagePreview: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveExplanationImage = () => {
    setFormData({
      ...formData,
      explanationImage: null,
      explanationImagePreview: null,
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], text: value };
    setFormData({ ...formData, options: newOptions });
  };

  const handleOptionImageUpload = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newOptions = [...formData.options];
        newOptions[index] = {
          ...newOptions[index],
          image: file,
          imagePreview: event.target?.result as string,
        };
        setFormData({ ...formData, options: newOptions });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveOptionImage = (index: number) => {
    const newOptions = [...formData.options];
    newOptions[index] = {
      ...newOptions[index],
      image: null,
      imagePreview: null,
    };
    setFormData({ ...formData, options: newOptions });
  };

  const handleAddOption = () => {
    setFormData({
      ...formData,
      options: [
        ...formData.options,
        { text: "", image: null, imagePreview: null },
      ],
    });
  };

  const handleRemoveOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        options: newOptions,
        correctAnswer:
          formData.correctAnswer >= newOptions.length
            ? 0
            : formData.correctAnswer,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    if (!formData.question.trim()) {
      toast.error("Please enter a question");
      setIsSubmitting(false);
      return;
    }

    if (formData.options.some((opt) => !opt.text.trim())) {
      toast.error("Please fill in all options");
      setIsSubmitting(false);
      return;
    }

    const userId = window.localStorage.getItem("userId");
    if (!userId) {
      toast.error("User not logged in");
      setIsSubmitting(false);
      return;
    }
    formData.createdBy = userId;

    if (formData.categories.length === 0) {
      toast.error("Please select at least one category");
      setIsSubmitting(false);
      return;
    }

    try {
      // Check if there are any files to upload
      const hasFiles =
        formData.questionImage ||
        formData.explanationImage ||
        formData.options.some((opt) => opt.image !== null);

      if (hasFiles) {
        // Use FormData for multipart/form-data
        const formDataToSend = new FormData();
        formDataToSend.append("createdBy", formData.createdBy);
        // Add title text and image
        formDataToSend.append("titleText", formData.question);
        if (formData.questionImage) {
          formDataToSend.append("titleImage", formData.questionImage);
        }

        // Add options text and images
        formData.options.forEach((option, index) => {
          formDataToSend.append(`optionText${index}`, option.text);
          if (option.image) {
            formDataToSend.append(`optionImage${index}`, option.image);
          }
        });

        // Add explanation text and image
        formDataToSend.append("explanationText", formData.explanation);
        if (formData.explanationImage) {
          formDataToSend.append("explanationImage", formData.explanationImage);
        }

        // Add other fields
        formDataToSend.append(
          "correctAnswer",
          formData.correctAnswer.toString()
        );
        formDataToSend.append(
          "categories",
          JSON.stringify(formData.categories)
        );
        formDataToSend.append("difficulty", formData.difficulty.toString());
        console.log("Ful Data", formData);
        await createQuestionWithFiles(formDataToSend);
      } else {
        // Use JSON for application/json
        const questionData = {
          title: {
            text: formData.question,
            image: "",
          },
          options: formData.options.map((opt) => ({
            text: opt.text,
            image: "",
          })),
          correctAnswer: formData.correctAnswer,
          explanation: {
            text: formData.explanation,
            image: "",
          },
          categories: formData.categories,
          difficulty: formData.difficulty,
        };

        await createQuestion(questionData);
      }

      toast.success("Question created successfully!");

      // Reset form
      setFormData({
        question: "",
        questionImage: null,
        questionImagePreview: null,
        options: [
          { text: "", image: null, imagePreview: null },
          { text: "", image: null, imagePreview: null },
          { text: "", image: null, imagePreview: null },
          { text: "", image: null, imagePreview: null },
        ],
        explanation: "",
        explanationImage: null,
        explanationImagePreview: null,
        createdBy: "",
        correctAnswer: 0,
        difficulty: 3,
        categories: [],
      });

      setIsSubmitting(false);
    } catch (error) {
      console.error("Error creating question:", error);
      toast.error("Failed to create question. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Create New Question
        </h1>
        <p className="text-muted-foreground mt-1">
          Add a new question to your quiz database
        </p>
      </div>

      {/* Form */}
      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question */}
          <div>
            <label className="block text-sm font-medium mb-2">Question</label>

            {/* Question Image Preview */}
            {formData.questionImagePreview && (
              <div className="mb-3 relative inline-block">
                <img
                  src={formData.questionImagePreview}
                  alt="Question preview"
                  className="w-32 h-32 rounded object-cover border border-border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={handleRemoveQuestionImage}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}

            <div className="flex gap-3">
              <textarea
                value={formData.question}
                onChange={handleQuestionChange}
                placeholder="Enter your question here..."
                className="flex-1 px-4 py-3 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={4}
              />
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-full gap-2 hover:bg-gray-900/10"
                  onClick={() =>
                    document.getElementById("question-image")?.click()
                  }
                >
                  <Upload className="w-4 h-4" />
                  Upload Image
                </Button>
                <input
                  id="question-image"
                  type="file"
                  accept="image/*"
                  onChange={handleQuestionImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Category and Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Categories
              </label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-between"
                >
                  <span className="text-sm truncate">
                    {formData.categories.length > 0
                      ? getSelectedCategoryNames()
                      : "Select categories..."}
                  </span>
                  <ChevronDown className="w-4 h-4 ml-2 shrink-0" />
                </button>

                {categoryDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-64 overflow-hidden">
                    <div className="p-2 border-b border-border">
                      <Input
                        type="text"
                        placeholder="Search categories..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="w-full"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredCategories.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No categories found
                        </div>
                      ) : (
                        filteredCategories.map((category) => (
                          <label
                            key={category._id}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-accent cursor-pointer"
                          >
                            <div className="flex items-center justify-center w-4 h-4 border border-border rounded">
                              {formData.categories.includes(category._id) && (
                                <Check className="w-3 h-3 text-primary" />
                              )}
                            </div>
                            <input
                              type="checkbox"
                              checked={formData.categories.includes(
                                category._id
                              )}
                              onChange={() => toggleCategory(category._id)}
                              className="sr-only"
                            />
                            <span className="text-sm">{category.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    difficulty: parseInt(e.target.value, 10),
                  })
                }
                className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="1">1 - Very Easy</option>
                <option value="2">2 - Easy</option>
                <option value="3">3 - Medium</option>
                <option value="4">4 - Hard</option>
                <option value="5">5 - Very Hard</option>
              </select>
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium mb-4">
              Answer Options
            </label>
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="space-y-2">
                  {/* Option Image Preview */}
                  {option.imagePreview && (
                    <div className="relative inline-block ml-8">
                      <img
                        src={option.imagePreview}
                        alt={`Option ${index + 1} preview`}
                        className="w-20 h-20 rounded object-cover border border-border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                        onClick={() => handleRemoveOptionImage(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={formData.correctAnswer === index}
                      onChange={() =>
                        setFormData({ ...formData, correctAnswer: index })
                      }
                      className="w-4 h-4 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={option.text}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      placeholder={`Option ${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        document
                          .getElementById(`option-image-${index}`)
                          ?.click()
                      }
                      title="Upload image"
                      className="hover:bg-sidebar-primary/10"
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                    <input
                      id={`option-image-${index}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleOptionImageUpload(index, e)}
                      className="hidden"
                    />
                    {formData.options.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveOption(index)}
                        className="text-destructive hover:bg-sidebar-primary/10  hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleAddOption}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-transparent hover:bg-gray-800/10"
            >
              <Plus className="w-4 h-4" />
              Add Option
            </Button>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Explanation (Optional)
            </label>

            {/* Explanation Image Preview */}
            {formData.explanationImagePreview && (
              <div className="mb-3 relative inline-block">
                <img
                  src={formData.explanationImagePreview}
                  alt="Explanation preview"
                  className="w-32 h-32 rounded object-cover border border-border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={handleRemoveExplanationImage}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}

            <div className="flex gap-3">
              <textarea
                value={formData.explanation}
                onChange={handleExplanationChange}
                placeholder="Enter explanation for the correct answer..."
                className="flex-1 px-4 py-3 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={3}
              />
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-full gap-2 hover:bg-gray-900/10"
                  onClick={() =>
                    document.getElementById("explanation-image")?.click()
                  }
                >
                  <Upload className="w-4 h-4" />
                  Upload Image
                </Button>
                <input
                  id="explanation-image"
                  type="file"
                  accept="image/*"
                  onChange={handleExplanationImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-6 border-t border-border">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? "Creating..." : "Create Question"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
