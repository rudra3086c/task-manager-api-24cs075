const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
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
