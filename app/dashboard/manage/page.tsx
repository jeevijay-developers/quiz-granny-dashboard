"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import QuestionModal from "@/components/dashboard/question-modal"

interface Question {
  id: number
  title: string
  correctAnswer: string
  options: Array<{ label: string; text: string; image?: string }>
}

export default function ManageQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      title: "What is the capital of France?",
      correctAnswer: "A",
      options: [
        { label: "A", text: "Paris" },
        { label: "B", text: "London" },
        { label: "C", text: "Berlin" },
        { label: "D", text: "Madrid" },
      ],
    },
    {
      id: 2,
      title: "Which planet is known as the Red Planet?",
      correctAnswer: "B",
      options: [
        { label: "A", text: "Venus" },
        { label: "B", text: "Mars" },
        { label: "C", text: "Jupiter" },
        { label: "D", text: "Saturn" },
      ],
    },
  ])

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const totalPages = Math.ceil(questions.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const paginatedQuestions = questions.slice(startIdx, startIdx + itemsPerPage)

  const handleEdit = (question: Question) => {
    setEditingQuestion(question)
    setShowModal(true)
  }

  const handleDelete = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const handleSave = (updatedQuestion: Question) => {
    if (editingQuestion) {
      setQuestions(questions.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q)))
    }
    setShowModal(false)
    setEditingQuestion(null)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Manage Questions</h1>
        <p className="text-muted-foreground">View, edit, and delete quiz questions</p>
      </div>

      {/* Questions Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Correct Answer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Preview</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedQuestions.map((question) => (
                <tr key={question.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4 text-sm">{question.title}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded font-medium">
                      {question.correctAnswer}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      {question.options.slice(0, 2).map((opt) => (
                        <div
                          key={opt.label}
                          className="w-8 h-8 bg-secondary rounded text-xs flex items-center justify-center font-medium"
                        >
                          {opt.label}
                        </div>
                      ))}
                      {question.options.length > 2 && (
                        <div className="w-8 h-8 bg-secondary rounded text-xs flex items-center justify-center font-medium">
                          +{question.options.length - 2}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(question)} className="gap-2">
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(question.id)}
                        className="gap-2 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIdx + 1} to {Math.min(startIdx + itemsPerPage, questions.length)} of {questions.length}{" "}
            questions
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Edit Modal */}
      {showModal && editingQuestion && (
        <QuestionModal
          question={editingQuestion}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false)
            setEditingQuestion(null)
          }}
        />
      )}
    </div>
  )
}
