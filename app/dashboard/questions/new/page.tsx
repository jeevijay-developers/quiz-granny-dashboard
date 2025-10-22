"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"

interface QuestionFormData {
  question: string
  options: string[]
  correctAnswer: number
  difficulty: "easy" | "medium" | "hard"
  category: string
}

export default function NewQuestionPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<QuestionFormData>({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    difficulty: "medium",
    category: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, question: e.target.value })
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
  }

  const handleAddOption = () => {
    setFormData({ ...formData, options: [...formData.options, ""] })
  }

  const handleRemoveOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index)
      setFormData({
        ...formData,
        options: newOptions,
        correctAnswer: formData.correctAnswer >= newOptions.length ? 0 : formData.correctAnswer,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate form
    if (!formData.question.trim()) {
      alert("Please enter a question")
      setIsSubmitting(false)
      return
    }

    if (formData.options.some((opt) => !opt.trim())) {
      alert("Please fill in all options")
      setIsSubmitting(false)
      return
    }

    if (!formData.category.trim()) {
      alert("Please select a category")
      setIsSubmitting(false)
      return
    }

    // Simulate API call
    setTimeout(() => {
      // Store in localStorage for demo
      const questions = JSON.parse(localStorage.getItem("questions") || "[]")
      questions.push({
        id: Date.now(),
        ...formData,
      })
      localStorage.setItem("questions", JSON.stringify(questions))

      router.push("/dashboard/questions")
    }, 500)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/questions">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create New Question</h1>
          <p className="text-muted-foreground mt-1">Add a new question to your quiz database</p>
        </div>
      </div>

      {/* Form */}
      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question */}
          <div>
            <label className="block text-sm font-medium mb-2">Question</label>
            <textarea
              value={formData.question}
              onChange={handleQuestionChange}
              placeholder="Enter your question here..."
              className="w-full px-4 py-3 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={4}
            />
          </div>

          {/* Category and Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Science, History, Math"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    difficulty: e.target.value as "easy" | "medium" | "hard",
                  })
                }
                className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium mb-4">Answer Options</label>
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={formData.correctAnswer === index}
                    onChange={() => setFormData({ ...formData, correctAnswer: index })}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1"
                  />
                  {formData.options.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveOption(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleAddOption}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-transparent"
            >
              <Plus className="w-4 h-4" />
              Add Option
            </Button>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-6 border-t border-border">
            <Link href="/dashboard/questions" className="flex-1">
              <Button type="button" variant="outline" className="w-full bg-transparent">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? "Creating..." : "Create Question"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
