"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Edit,
  Trash2,
  Plus,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { FcApproval } from "react-icons/fc";
import { MdPending } from "react-icons/md";
import {
  getAllQuestions,
  deleteQuestion,
  getAllCategories,
  getQuestionsByDateRange,
  toggleQuestionApproval,
} from "@/lib/server";
import toast from "react-hot-toast";
import EditQuestionModal from "@/components/dashboard/edit-question-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { userRole } from "@/lib/server";

export default function AllQuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dateFilterActive, setDateFilterActive] = useState(false);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [togglingApproval, setTogglingApproval] = useState(null);
  const questionsPerPage = 20;

  useEffect(() => {
    loadQuestions();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat._id === categoryId);
    return category ? category.name : categoryId;
  };

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllQuestions();
      setQuestions(data);
    } catch (err) {
      console.error("Error loading questions:", err);
      setError("Failed to load questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = async () => {
    if (!fromDate || !toDate) {
      toast.error("Please select both from and to dates");
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      toast.error("From date cannot be after to date");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getQuestionsByDateRange(fromDate, toDate);
      setQuestions(response.questions || response);
      setDateFilterActive(true);
      toast.success(`Loaded ${response.count || response.length} questions`);
    } catch (err) {
      console.error("Error loading questions by date range:", err);
      setError("Failed to load questions by date range. Please try again.");
      toast.error("Failed to filter questions by date");
    } finally {
      setLoading(false);
    }
  };

  const handleClearDateFilter = async () => {
    setFromDate("");
    setToDate("");
    setDateFilterActive(false);
    await loadQuestions();
  };

  const handleDelete = async (id) => {
    try {
      setDeleting(id);
      await deleteQuestion(id);
      // Remove from local state
      setQuestions(questions.filter((q) => q._id !== id));
      setDeleteDialogOpen(false);
      setQuestionToDelete(null);
      toast.success("Question deleted successfully!");
    } catch (err) {
      console.error("Error deleting question:", err);
      toast.error("Failed to delete question. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  // Get unique categories from questions
  const uniqueCategories = [
    ...new Set(
      questions.flatMap((q) => {
        if (q.categories && Array.isArray(q.categories)) {
          return q.categories.map((catId) => {
            if (typeof catId === "string") {
              return getCategoryName(catId);
            }
            return catId.name || catId;
          });
        }
        return q.category ? [q.category] : [];
      })
    ),
  ].filter(Boolean);

  // Filter questions based on search and filters
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      (q.title?.text || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.categories &&
        Array.isArray(q.categories) &&
        q.categories.some((catId) => {
          const catName =
            typeof catId === "string"
              ? getCategoryName(catId)
              : catId.name || catId;
          return catName?.toLowerCase().includes(searchTerm.toLowerCase());
        })) ||
      (q.category || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === "all" ||
      (q.categories &&
        Array.isArray(q.categories) &&
        q.categories.some((catId) => {
          const catName =
            typeof catId === "string"
              ? getCategoryName(catId)
              : catId.name || catId;
          return catName === filterCategory;
        })) ||
      q.category === filterCategory;

    const matchesDifficulty =
      filterDifficulty === "all" ||
      q.difficulty?.toString() === filterDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
  const startIndex = (currentPage - 1) * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterDifficulty, dateFilterActive]);

  const handleDeleteClick = (question) => {
    setQuestionToDelete(question);
    setDeleteDialogOpen(true);
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
  };

  const handleEditSuccess = async () => {
    // Reload questions after successful edit
    await loadQuestions();
  };

  const handleApprovalToggle = async (questionId, currentStatus) => {
    try {
      setTogglingApproval(questionId);
      const userId = window.localStorage.getItem("userId");

      if (!userId) {
        toast.error("User not logged in");
        return;
      }

      const newStatus = !currentStatus;
      const response = await toggleQuestionApproval(
        questionId,
        newStatus,
        newStatus ? userId : null
      );

      // Update the question in local state
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q._id === questionId
            ? {
                ...q,
                isApproved: newStatus,
                approvedBy: response.question.approvedBy,
              }
            : q
        )
      );

      toast.success(
        newStatus
          ? "Question approved successfully!"
          : "Question disapproved successfully!"
      );
    } catch (err) {
      console.error("Error toggling approval:", err);
      toast.error("Failed to update approval status. Please try again.");
    } finally {
      setTogglingApproval(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Questions</h1>
          <p className="text-muted-foreground mt-1">
            {filteredQuestions.length} of {questions.length} questions
          </p>
        </div>
        <Link href="/dashboard/questions">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Question
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Date Range Filter */}
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">
                From Date
              </label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">To Date</label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleDateFilter}
                disabled={!fromDate || !toDate}
                className="whitespace-nowrap"
              >
                Apply Date Filter
              </Button>
              {dateFilterActive && (
                <Button
                  onClick={handleClearDateFilter}
                  variant="outline"
                  className="whitespace-nowrap"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Search and Other Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search questions or categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Difficulties</option>
              <option value="1">1 - Very Easy</option>
              <option value="2">2 - Easy</option>
              <option value="3">3 - Medium</option>
              <option value="4">4 - Hard</option>
              <option value="5">5 - Very Hard</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Questions Table */}
      <Card className="overflow-hidden">
        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              {questions.length === 0
                ? "No questions found. Create your first question to get started."
                : "No questions match your filters."}
            </p>
            <Link href="/dashboard/questions">
              <Button>Create Question</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                    #
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                    Question
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                    Category
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                    Difficulty
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                    Correct Answer
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                    Created By
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                    Created At
                  </th>
                  {userRole() === "user" && (
                    <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                      Status
                    </th>
                  )}
                  {userRole() === "admin" && (
                    <>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                        Approved By
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                        Approval
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                        Actions
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedQuestions.map((question, index) => (
                  <tr
                    key={question._id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-muted-foreground text-center">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md mx-auto">
                        <p className="text-sm font-medium text-foreground line-clamp-2 text-start">
                          {question.title?.text || "No title"}
                        </p>
                        {question.title?.image && (
                          <span className="text-xs text-muted-foreground">
                            📷 Has image
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {question.categories &&
                        question.categories.length > 0 ? (
                          question.categories.map((catId, i) => {
                            const categoryName =
                              typeof catId === "string"
                                ? getCategoryName(catId)
                                : catId.name || catId;
                            return (
                              <span
                                key={i}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                              >
                                {categoryName}
                              </span>
                            );
                          })
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {question.category || "No category"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 justify-center">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${
                              i < (question.difficulty || 1)
                                ? "text-yellow-500"
                                : "text-gray-300"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm flex justify-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Option {(question.correctAnswer || 0) + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-muted-foreground text-center">
                        {question.createdBy?.username || "Unknown"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-muted-foreground text-center">
                        {new Date(question.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    {userRole() === "user" && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-center">
                          {question.isApproved ? (
                            <>
                              <FcApproval className="w-5 h-5" />
                              <span className="text-sm text-green-600 font-medium">
                                Approved
                              </span>
                            </>
                          ) : (
                            <>
                              <MdPending className="w-5 h-5 text-yellow-600" />
                              <span className="text-sm text-yellow-600 font-medium">
                                Pending
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                    {userRole() === "admin" && (
                      <>
                        <td className="px-6 py-4">
                          <div className="text-sm text-muted-foreground text-center">
                            {question.isApproved && question.approvedBy
                              ? question.approvedBy.username
                              : "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <button
                              onClick={() =>
                                handleApprovalToggle(
                                  question._id,
                                  question.isApproved
                                )
                              }
                              disabled={togglingApproval === question._id}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                                question.isApproved
                                  ? "bg-green-600"
                                  : "bg-gray-300"
                              } ${
                                togglingApproval === question._id
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  question.isApproved
                                    ? "translate-x-6"
                                    : "translate-x-1"
                                }`}
                              />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(question)}
                              className="flex items-center gap-1 hover:bg-gray-800/10"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(question)}
                              disabled={deleting === question._id}
                              className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              {deleting === question._id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                              Delete
                            </Button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {filteredQuestions.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredQuestions.length)} of{" "}
            {filteredQuestions.length} question
            {filteredQuestions.length !== 1 ? "s" : ""}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => {
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-10"
                      >
                        {page}
                      </Button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span key={page} className="px-2 text-muted-foreground">
                        ...
                      </span>
                    );
                  }
                  return null;
                }
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Summary */}
      {filteredQuestions.length > 0 && totalPages <= 1 && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredQuestions.length} of {questions.length} question
          {questions.length !== 1 ? "s" : ""}
        </div>
      )}

      {/* Edit Question Modal */}
      {editingQuestion && (
        <EditQuestionModal
          open={!!editingQuestion}
          onOpenChange={(open) => !open && setEditingQuestion(null)}
          question={editingQuestion}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              question "{questionToDelete?.title?.text || "this question"}" from
              the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                questionToDelete && handleDelete(questionToDelete._id)
              }
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
