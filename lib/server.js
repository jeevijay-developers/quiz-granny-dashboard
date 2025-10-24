import axiosInstance from "./axiosInstance";

export const getAllQuestions = async () => {
  try {
    const response = await axiosInstance.get("/api/questions");
    return response.data;
  } catch (error) {
    console.error("Error in getting all questions:", error);
    throw error;
  }
};

export const getQuestionById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/questions/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error in getting question ${id}:`, error);
    throw error;
  }
};

export const createQuestion = async (questionData) => {
  try {
    const response = await axiosInstance.post("/api/questions", questionData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in creating question:", error);
    throw error;
  }
};

export const createQuestionWithFiles = async (formData) => {
  try {
    const response = await axiosInstance.post("/api/questions", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in creating question with files:", error);
    throw error;
  }
};

export const updateQuestion = async (id, updateData) => {
  try {
    const response = await axiosInstance.put(
      `/api/questions/${id}`,
      updateData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error in updating question ${id}:`, error);
    throw error;
  }
};

export const updateQuestionWithFiles = async (id, formData) => {
  try {
    const response = await axiosInstance.put(`/api/questions/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error in updating question ${id} with files:`, error);
    throw error;
  }
};

export const deleteQuestion = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/questions/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error in deleting question ${id}:`, error);
    throw error;
  }
};

export const getQuestionsByTag = async (tag) => {
  try {
    const response = await axiosInstance.get(`/api/questions/tag/${tag}`);
    return response.data;
  } catch (error) {
    console.error(`Error in getting questions by tag ${tag}:`, error);
    throw error;
  }
};

// ============ Category API Methods ============

export const getAllCategories = async () => {
  try {
    const response = await axiosInstance.get("/api/categories");
    return response.data;
  } catch (error) {
    console.error("Error in getting all categories:", error);
    throw error;
  }
};

export const getCategoryById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error in getting category ${id}:`, error);
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await axiosInstance.post("/api/categories", categoryData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in creating category:", error);
    throw error;
  }
};

export const updateCategory = async (id, updateData) => {
  try {
    const response = await axiosInstance.put(
      `/api/categories/${id}`,
      updateData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error in updating category ${id}:`, error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error in deleting category ${id}:`, error);
    throw error;
  }
};
