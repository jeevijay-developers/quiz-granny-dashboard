import axiosInstance from "./axiosInstance";

// ============ Question API Methods ============

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

export const getQuestionsByDateRange = async (fromDate, toDate) => {
  try {
    const response = await axiosInstance.get(`/api/questions/filter-by-date`, {
      params: { fromDate, toDate },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error in getting questions by date range ${fromDate} - ${toDate}:`,
      error
    );
    throw error;
  }
};

export const toggleQuestionApproval = async (id, isApproved, approvedBy) => {
  try {
    const response = await axiosInstance.patch(
      `/api/questions/${id}/approval`,
      {
        isApproved,
        approvedBy,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error in toggling question approval ${id}:`, error);
    throw error;
  }
};

export const bulkUploadQuestions = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post(
      "/api/questions/upload-csv-questions",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error in bulk uploading questions:", error);
    throw error;
  }
};

export const exportQuestions = async () => {
  try {
    const response = await axiosInstance.get("/api/questions/export", {
      responseType: "blob", // Important for file download
    });
    return response.data;
  } catch (error) {
    console.error("Error in exporting questions:", error);
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

// ============ User API Methods ============

export const loginUser = async (credentials) => {
  try {
    const response = await axiosInstance.post("/api/users/login", credentials, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in logging in:", error);
    throw error;
  }
};

export const getAllUsers = async (userId) => {
  try {
    const response = await axiosInstance.get("/api/users", {
      headers: {
        "x-admin-id": userId,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in getting all users:", error);
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error in getting user ${id}:`, error);
    throw error;
  }
};

export const createUser = async (userData, userId) => {
  try {
    const response = await axiosInstance.post("/api/users", userData, {
      headers: {
        "Content-Type": "application/json",
        "x-admin-id": userId,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in creating user:", error);
    throw error;
  }
};

export const updateUser = async (id, updateData, userId) => {
  try {
    const response = await axiosInstance.put(`/api/users/${id}`, updateData, {
      headers: {
        "Content-Type": "application/json",
        "x-admin-id": userId,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error in updating user ${id}:`, error);
    throw error;
  }
};

export const deleteUser = async (id, userId) => {
  try {
    const response = await axiosInstance.delete(`/api/users/${id}`, {
      headers: {
        "x-admin-id": userId,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error in deleting user ${id}:`, error);
    throw error;
  }
};

export const userRole = () => {
  const role = window.localStorage.getItem("userRole");
  return role;
};
