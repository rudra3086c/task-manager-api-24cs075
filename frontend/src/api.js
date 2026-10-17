const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    },
    ...options
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("auth-expired"));
    }
    const validationMessage = payload.errors?.map((error) => error.message).join(", ");
    throw new Error(validationMessage || payload.message || "The request failed.");
  }

  return payload;
}

export const getTasks = () => request("/tasks");

export const createTask = (task) =>
  request("/tasks", {
    method: "POST",
    body: JSON.stringify(task)
  });

export const updateTask = (id, task) =>
  request(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(task)
  });

export const deleteTask = (id) =>
  request(`/tasks/${id}`, {
    method: "DELETE"
  });

export const register = (credentials) =>
  request("/auth/register", {
    method: "POST",
    body: JSON.stringify(credentials)
  });

export const login = (credentials) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials)
  });

export const getCurrentUser = () => request("/auth/me");

export const generateTaskDescription = (title) =>
  request("/api/ai/generate-description", {
    method: "POST",
    body: JSON.stringify({ title })
  });
