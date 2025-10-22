"use client"

import { useState } from "react"
import { CheckCircle } from "lucide-react"
import QuestionForm from "@/components/dashboard/question-form"

export default function CreateQuestionPage() {
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSave = () => {
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Create Question</h1>
        <p className="text-muted-foreground">Add a new quiz question with options and images</p>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3 items-center">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700">Question saved successfully!</p>
        </div>
      )}

      <QuestionForm onSave={handleSave} />
    </div>
  )
}
