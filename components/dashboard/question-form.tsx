"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Upload, Loader2 } from "lucide-react";
import { createQuestion, createQuestionWithFiles } from "@/lib/server";

interface QuestionFormProps {
  onSave?: () => void;
  initialData?: any;
}

export default function QuestionForm({
  onSave,
  initialData,
}: QuestionFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title?.text || "");
  const [titleImage, setTitleImage] = useState<File | null>(null);
  const [titleImagePreview, setTitleImagePreview] = useState(
    initialData?.title?.image || null
  );

  const [options, setOptions] = useState(
    initialData?.options || [
      { label: "A", text: "", image: null, imageFile: null },
      { label: "B", text: "", image: null, imageFile: null },
      { label: "C", text: "", image: null, imageFile: null },
      { label: "D", text: "", image: null, imageFile: null },
    ]
  );
  const [correctAnswer, setCorrectAnswer] = useState(
    initialData?.correctAnswer !== undefined
      ? String.fromCharCode(65 + initialData.correctAnswer)
      : "A"
  );
  const [explanation, setExplanation] = useState(
    initialData?.explanation?.text || ""
  );
  const [explanationImage, setExplanationImage] = useState<File | null>(null);
  const [explanationImagePreview, setExplanationImagePreview] = useState(
    initialData?.explanation?.image || null
  );
  const [tags, setTags] = useState(initialData?.tags?.join(", ") || "");
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOptionChange = (index: number, field: string, value: any) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const handleTitleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTitleImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setTitleImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExplanationImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setExplanationImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setExplanationImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleOptionChange(index, "image", event.target?.result);
        handleOptionChange(index, "imageFile", file);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: string[] = [];

    // Check if title has text or image
    if (!title.trim() && !titleImage && !titleImagePreview) {
      newErrors.push("Question title must have text or image");
    }

    // Check if each option has text or image
    options.forEach((opt: any, idx: number) => {
      if (!opt.text.trim() && !opt.image && !opt.imageFile) {
        newErrors.push(`Option ${opt.label} must have text or image`);
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      // Check if we need to use FormData (has files) or JSON
      const hasFiles =
        titleImage ||
        explanationImage ||
        options.some((opt: any) => opt.imageFile);

      if (hasFiles) {
        // Use FormData for file uploads
        const formData = new FormData();

        // Add title
        formData.append("titleText", title);
        if (titleImage) {
          formData.append("titleImage", titleImage);
        }

        // Add options
        options.forEach((opt: any, idx: number) => {
          formData.append(`optionText${idx}`, opt.text);
          if (opt.imageFile) {
            formData.append(`optionImage${idx}`, opt.imageFile);
          }
        });

        // Add correct answer (convert A,B,C,D to 0,1,2,3)
        const answerIndex = correctAnswer.charCodeAt(0) - 65;
        formData.append("correctAnswer", answerIndex.toString());

        // Add explanation
        if (explanation) {
          formData.append("explanationText", explanation);
        }
        if (explanationImage) {
          formData.append("explanationImage", explanationImage);
        }

        // Add tags
        if (tags.trim()) {
          formData.append("tags", tags);
        }

        await createQuestionWithFiles(formData);
      } else {
        // Use JSON for text-only
        const questionData = {
          title: {
            text: title,
            image: "",
          },
          options: options.map((opt: any) => ({
            text: opt.text,
            image: "",
          })),
          correctAnswer: correctAnswer.charCodeAt(0) - 65,
          explanation: {
            text: explanation,
            image: "",
          },
          tags: tags.trim()
            ? tags
                .split(",")
                .map((t: string) => t.trim())
                .filter(Boolean)
            : [],
        };

        await createQuestion(questionData);
      }

      // Success - call callback and redirect
      onSave?.();
      router.push("/all-questions");
    } catch (error) {
      console.error("Error creating question:", error);
      setErrors(["Failed to create question. Please try again."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-8 max-w-2xl">
      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
          {errors.map((error, idx) => (
            <div key={idx} className="flex gap-3 mb-2 last:mb-0">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Title */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Question Title
          </label>
          {titleImagePreview && (
            <div className="mb-3">
              <img
                src={titleImagePreview}
                alt="Title preview"
                className="w-32 h-32 rounded object-cover"
              />
            </div>
          )}
          <div className="flex gap-4">
            <Input
              type="text"
              placeholder="Enter your question"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              className="gap-2 bg-transparent"
              onClick={() => document.getElementById("title-image")?.click()}
            >
              <Upload className="w-4 h-4" />
              Upload Image
            </Button>
            <input
              id="title-image"
              type="file"
              accept="image/*"
              onChange={handleTitleImageUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <label className="block text-sm font-medium">Options</label>
          {options.map((option: any, idx: number) => (
            <div key={idx} className="p-4 bg-secondary rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-primary w-8">
                  Option {option.label}
                </span>
                {option.image && (
                  <img
                    src={option.image || "/placeholder.svg"}
                    alt={`Option ${option.label}`}
                    className="w-12 h-12 rounded object-cover"
                  />
                )}
              </div>
              <div className="flex gap-4">
                <Input
                  type="text"
                  placeholder={`Enter option ${option.label}`}
                  value={option.text}
                  onChange={(e) =>
                    handleOptionChange(idx, "text", e.target.value)
                  }
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 bg-transparent"
                  onClick={() =>
                    document.getElementById(`upload-${idx}`)?.click()
                  }
                >
                  <Upload className="w-4 h-4" />
                  Image
                </Button>
                <input
                  id={`upload-${idx}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(idx, e)}
                  className="hidden"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Correct Answer */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Correct Answer
          </label>
          <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt: any) => (
                <SelectItem key={opt.label} value={opt.label}>
                  Option {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Explanation (Optional) */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Explanation (Optional)
          </label>
          {explanationImagePreview && (
            <div className="mb-3">
              <img
                src={explanationImagePreview}
                alt="Explanation preview"
                className="w-32 h-32 rounded object-cover"
              />
            </div>
          )}
          <div className="flex gap-4 mb-2">
            <Input
              type="text"
              placeholder="Explain the correct answer"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              className="gap-2 bg-transparent"
              onClick={() =>
                document.getElementById("explanation-image")?.click()
              }
            >
              <Upload className="w-4 h-4" />
              Image
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

        {/* Tags (Optional) */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Tags (Optional)
          </label>
          <Input
            type="text"
            placeholder="mathematics, algebra, equations (comma-separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Save Question"
          )}
        </Button>
      </form>
    </Card>
  );
}
