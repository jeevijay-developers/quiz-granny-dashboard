"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Upload } from "lucide-react"

interface Question {
  id: number
  title: string
  correctAnswer: string
  options: Array<{ label: string; text: string; image?: string }>
}

interface QuestionModalProps {
  question: Question
  onSave: (question: Question) => void
  onClose: () => void
}

export default function QuestionModal({ question, onSave, onClose }: QuestionModalProps) {
  const [title, setTitle] = useState(question.title)
  const [options, setOptions] = useState(question.options)
  const [correctAnswer, setCorrectAnswer] = useState(question.correctAnswer)

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...question,
      title,
      options,
      correctAnswer,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Edit Question</h2>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Question Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Question Title</label>
            <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full" />
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
                    value={option.text}
                    onChange={(e) => handleOptionChange(idx, "text", e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 bg-transparent"
                    onClick={() => document.getElementById(`modal-upload-${idx}`)?.click()}
                  >
                    <Upload className="w-4 h-4" />
                    Image
                  </Button>
                  <input
                    id={`modal-upload-${idx}`}
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

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
