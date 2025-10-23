"use client";

import { useState, useEffect } from "react";
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
import { AlertCircle, Upload, Loader2 } from "lucide-react";
import { updateQuestion, updateQuestionWithFiles } from "@/lib/server";

interface EditQuestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: any;
  onSuccess: () => void;
}

export default function EditQuestionModal({
  open,
  onOpenChange,
  question,
  onSuccess,
}: EditQuestionModalProps) {
  const [title, setTitle] = useState("");
  const [titleImage, setTitleImage] = useState<File | null>(null);
  const [titleImagePreview, setTitleImagePreview] = useState<string | null>(
    null
  );

  const [options, setOptions] = useState([
    { label: "A", text: "", image: null, imageFile: null },
    { label: "B", text: "", image: null, imageFile: null },
    { label: "C", text: "", image: null, imageFile: null },
    { label: "D", text: "", image: null, imageFile: null },
  ]);

  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [explanation, setExplanation] = useState("");
  const [explanationImage, setExplanationImage] = useState<File | null>(null);
  const [explanationImagePreview, setExplanationImagePreview] = useState<
    string | null
  >(null);
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("General");
  const [difficulty, setDifficulty] = useState(3);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load question data when modal opens
  useEffect(() => {
    if (open && question) {
      setTitle(question.title?.text || "");
      setTitleImagePreview(question.title?.image || null);

      const loadedOptions = question.options?.map((opt: any, idx: number) => ({
        label: String.fromCharCode(65 + idx),
        text: opt.text || "",
        image: opt.image || null,
        imageFile: null,
      })) || [
        { label: "A", text: "", image: null, imageFile: null },
        { label: "B", text: "", image: null, imageFile: null },
        { label: "C", text: "", image: null, imageFile: null },
        { label: "D", text: "", image: null, imageFile: null },
      ];
      setOptions(loadedOptions);

      setCorrectAnswer(
        question.correctAnswer !== undefined
          ? String.fromCharCode(65 + question.correctAnswer)
          : "A"
      );

      setExplanation(question.explanation?.text || "");
      setExplanationImagePreview(question.explanation?.image || null);
      setTags(question.tags?.join(", ") || "");
      setCategory(question.category || "General");
      setDifficulty(question.difficulty || 3);
    }
  }, [open, question]);

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

    if (!title.trim() && !titleImage && !titleImagePreview) {
      newErrors.push("Question title must have text or image");
    }

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
      const hasFiles =
        titleImage ||
        explanationImage ||
        options.some((opt: any) => opt.imageFile);

      if (hasFiles) {
        const formData = new FormData();

        formData.append("titleText", title);
        if (titleImage) {
          formData.append("titleImage", titleImage);
        }

        options.forEach((opt: any, idx: number) => {
          formData.append(`optionText${idx}`, opt.text);
          if (opt.imageFile) {
            formData.append(`optionImage${idx}`, opt.imageFile);
          }
        });

        const answerIndex = correctAnswer.charCodeAt(0) - 65;
        formData.append("correctAnswer", answerIndex.toString());

        if (explanation) {
          formData.append("explanationText", explanation);
        }
        if (explanationImage) {
          formData.append("explanationImage", explanationImage);
        }

        if (tags.trim()) {
          formData.append("tags", tags);
        }

        formData.append("category", category);
        formData.append("difficulty", difficulty.toString());

        await updateQuestionWithFiles(question._id, formData);
      } else {
        const updateData: any = {};

        if (title !== question.title?.text) {
          updateData.title = { text: title };
        }

        const optionsChanged = options.some(
          (opt: any, idx: number) => opt.text !== question.options?.[idx]?.text
        );
        if (optionsChanged) {
          updateData.options = options.map((opt: any) => ({
            text: opt.text,
            image: opt.image || "",
          }));
        }

        const answerIndex = correctAnswer.charCodeAt(0) - 65;
        if (answerIndex !== question.correctAnswer) {
          updateData.correctAnswer = answerIndex;
        }

        if (explanation !== question.explanation?.text) {
          updateData.explanation = { text: explanation };
        }

        const newTags = tags.trim()
          ? tags
              .split(",")
              .map((t: string) => t.trim())
              .filter(Boolean)
          : [];
        if (JSON.stringify(newTags) !== JSON.stringify(question.tags)) {
          updateData.tags = newTags;
        }

        if (category !== question.category) {
          updateData.category = category;
        }

        if (difficulty !== question.difficulty) {
          updateData.difficulty = difficulty;
        }

        await updateQuestion(question._id, updateData);
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating question:", error);
      setErrors(["Failed to update question. Please try again."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription>
            Make changes to the question. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        {errors.length > 0 && (
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
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
                className="gap-2"
                onClick={() =>
                  document.getElementById("edit-title-image")?.click()
                }
              >
                <Upload className="w-4 h-4" />
                Image
              </Button>
              <input
                id="edit-title-image"
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
                      src={option.image}
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
                    className="gap-2"
                    onClick={() =>
                      document.getElementById(`edit-upload-${idx}`)?.click()
                    }
                  >
                    <Upload className="w-4 h-4" />
                    Image
                  </Button>
                  <input
                    id={`edit-upload-${idx}`}
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

          {/* Explanation */}
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
                className="gap-2"
                onClick={() =>
                  document.getElementById("edit-explanation-image")?.click()
                }
              >
                <Upload className="w-4 h-4" />
                Image
              </Button>
              <input
                id="edit-explanation-image"
                type="file"
                accept="image/*"
                onChange={handleExplanationImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Tags */}
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

          {/* Category and Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Science, History, Math"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(parseInt(e.target.value, 10))}
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
