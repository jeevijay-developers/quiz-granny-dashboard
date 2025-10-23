/**
 * Usage examples for server.js API methods
 * Import these methods in your React components
 */

import {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  createQuestionWithFiles,
  updateQuestion,
  updateQuestionWithFiles,
  deleteQuestion,
  getQuestionsByTag,
} from "./server";

// ============================================
// EXAMPLE 1: Get All Questions
// ============================================
async function exampleGetAllQuestions() {
  try {
    const questions = await getAllQuestions();
    console.log("All questions:", questions);
    return questions;
  } catch (error) {
    console.error("Failed to fetch questions:", error);
  }
}

// ============================================
// EXAMPLE 2: Get Question by ID
// ============================================
async function exampleGetQuestionById() {
  try {
    const questionId = "507f1f77bcf86cd799439011";
    const question = await getQuestionById(questionId);
    console.log("Question:", question);
    return question;
  } catch (error) {
    console.error("Failed to fetch question:", error);
  }
}

// ============================================
// EXAMPLE 3: Create Question (JSON - No Files)
// ============================================
async function exampleCreateQuestion() {
  try {
    const questionData = {
      title: {
        text: "What is 2+2?",
        image: "",
      },
      options: [
        { text: "3", image: "" },
        { text: "4", image: "" },
        { text: "5", image: "" },
        { text: "6", image: "" },
      ],
      correctAnswer: 1,
      explanation: {
        text: "Basic addition: 2+2 equals 4",
        image: "",
      },
      tags: ["mathematics", "arithmetic"],
      createdBy: null,
    };

    const newQuestion = await createQuestion(questionData);
    console.log("Created question:", newQuestion);
    return newQuestion;
  } catch (error) {
    console.error("Failed to create question:", error);
  }
}

// ============================================
// EXAMPLE 4: Create Question with Files (FormData)
// ============================================
async function exampleCreateQuestionWithFiles(files) {
  try {
    const formData = new FormData();

    // Add text fields
    formData.append("titleText", "What is this shape?");
    formData.append("optionText0", "Circle");
    formData.append("optionText1", "Square");
    formData.append("optionText2", "Triangle");
    formData.append("optionText3", "Rectangle");
    formData.append("correctAnswer", "2");
    formData.append("explanationText", "This is a triangle with three sides");
    formData.append("tags", JSON.stringify(["geometry", "shapes"]));

    // Add file uploads (if available)
    if (files.titleImage) {
      formData.append("titleImage", files.titleImage);
    }
    if (files.optionImage0) {
      formData.append("optionImage0", files.optionImage0);
    }
    if (files.explanationImage) {
      formData.append("explanationImage", files.explanationImage);
    }

    const newQuestion = await createQuestionWithFiles(formData);
    console.log("Created question with files:", newQuestion);
    return newQuestion;
  } catch (error) {
    console.error("Failed to create question with files:", error);
  }
}

// ============================================
// EXAMPLE 5: Update Question (JSON - No Files)
// ============================================
async function exampleUpdateQuestion() {
  try {
    const questionId = "507f1f77bcf86cd799439011";
    const updateData = {
      title: {
        text: "What is 3+3?",
      },
      correctAnswer: 2,
      tags: ["mathematics", "addition"],
    };

    const updatedQuestion = await updateQuestion(questionId, updateData);
    console.log("Updated question:", updatedQuestion);
    return updatedQuestion;
  } catch (error) {
    console.error("Failed to update question:", error);
  }
}

// ============================================
// EXAMPLE 6: Update Question with Files (FormData)
// ============================================
async function exampleUpdateQuestionWithFiles(questionId, files) {
  try {
    const formData = new FormData();

    // Add only fields you want to update
    formData.append("titleText", "Updated question text");
    formData.append("correctAnswer", "3");

    // Add new images (optional)
    if (files.titleImage) {
      formData.append("titleImage", files.titleImage);
    }
    if (files.optionImage1) {
      formData.append("optionImage1", files.optionImage1);
    }

    const updatedQuestion = await updateQuestionWithFiles(questionId, formData);
    console.log("Updated question with files:", updatedQuestion);
    return updatedQuestion;
  } catch (error) {
    console.error("Failed to update question with files:", error);
  }
}

// ============================================
// EXAMPLE 7: Delete Question
// ============================================
async function exampleDeleteQuestion() {
  try {
    const questionId = "507f1f77bcf86cd799439011";
    const result = await deleteQuestion(questionId);
    console.log("Delete result:", result);
    return result;
  } catch (error) {
    console.error("Failed to delete question:", error);
  }
}

// ============================================
// EXAMPLE 8: Get Questions by Tag
// ============================================
async function exampleGetQuestionsByTag() {
  try {
    const tag = "mathematics";
    const questions = await getQuestionsByTag(tag);
    console.log(`Questions with tag '${tag}':`, questions);
    return questions;
  } catch (error) {
    console.error("Failed to fetch questions by tag:", error);
  }
}

// ============================================
// REACT COMPONENT EXAMPLE
// ============================================
/*
import { useState, useEffect } from 'react';
import { getAllQuestions, deleteQuestion } from '@/lib/server';

function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await getAllQuestions();
      setQuestions(data);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteQuestion(id);
      // Refresh the list
      loadQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {questions.map((q) => (
        <div key={q._id}>
          <h3>{q.title.text}</h3>
          <button onClick={() => handleDelete(q._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
*/
