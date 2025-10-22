"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Upload } from "lucide-react"

interface QuestionFormProps {
  onSave?: () => void
  initialData?: any
}

export default function QuestionForm({ onSave, initialData }: QuestionFormProps) {
  const [title, setTitle] = useState(initialData?.title || "")
  const [options, setOptions] = useState(
    initialData?.options || [
      { label: "A", text: "", image: null },
      { label: "B", text: "", image: null },
      { label: "C", text: "", image: null },
      { label: "D", text: "", image: null },
    ],
  )
  const [correctAnswer, setCorrectAnswer] = useState(initialData?.correctAnswer || "A")
  const [errors, setErrors] = useState<string[]>([])

  const handleOptionChange = (index: number, field: string, value: any) => {
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], [field]: value }
    setOptions(newOptions)
  }

  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        handleOptionChange(index, "image", event.target?.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    const newErrors: string[] = []
    if (!title.trim()) newErrors.push("Question title is required")
    options.forEach((opt, idx) => {
      if (!opt.text.trim()) newErrors.push(`Option ${opt.label} text is required`)
    })
    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSave?.()
      setTitle("")
      setOptions([
        { label: "A", text: "", image: null },
        { label: "B", text: "", image: null },
        { label: "C", text: "", image: null },
        { label: "D", text: "", image: null },
      ])
    }
  }

  return (
    <Card className="p-8 max-w-2xl">
      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
          {errors.map((error, idx) => (
            <div key={idx} className="flex gap-3 mb-2 last:mb-0">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Title */}
        <div>
          <label className="block text-sm font-medium mb-2">Question Title</label>
          <div className="flex gap-4">
            <Input
              type="text"
              placeholder="Enter your question"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1"
            />
            <Button type="button" variant="outline" className="gap-2 bg-transparent">
              <Upload className="w-4 h-4" />
              Upload Image
            </Button>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <label className="block text-sm font-medium">Options</label>
          {options.map((option, idx) => (
            <div key={idx} className="p-4 bg-secondary rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-primary w-8">Option {option.label}</span>
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
                  onChange={(e) => handleOptionChange(idx, "text", e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 bg-transparent"
                  onClick={() => document.getElementById(`upload-${idx}`)?.click()}
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
          <label className="block text-sm font-medium mb-2">Correct Answer</label>
          <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.label} value={opt.label}>
                  Option {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2"
        >
          Save Question
        </Button>
      </form>
    </Card>
  )
}
