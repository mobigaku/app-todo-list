import { Task } from "@prisma/client";

export async function getTasks(categoryId?: string) {
  const url = categoryId
    ? `/api/tasks?categoryId=${categoryId}`
    : "/api/tasks";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }
  return response.json();
}

export async function getTask(id: string) {
  const response = await fetch(`/api/tasks/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch task");
  }
  return response.json();
}

export async function createTask(data: Partial<Task>) {
  const response = await fetch("/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to create task");
  }
  return response.json();
}

export async function updateTask(id: string, data: Partial<Task>) {
  const response = await fetch(`/api/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update task");
  }
  return response.json();
}

export async function deleteTask(id: string) {
  const response = await fetch(`/api/tasks/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete task");
  }
  return response.json();
}

export async function getCategories() {
  const response = await fetch("/api/categories");
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  return response.json();
}

export async function createCategory(name: string) {
  const response = await fetch("/api/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    throw new Error("Failed to create category");
  }
  return response.json();
} 