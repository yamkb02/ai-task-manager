"use client";

import React, { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import TaskForm from "@/components/TaskForm";
import { Toast } from "primereact/toast";
import axios from "axios";

const CreateTaskPage: React.FC = () => {
  const toast = useRef<Toast>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await axios.get("/api/session", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
        } else {
          throw new Error("Failed to fetch user session.");
        }
      } catch (error) {
        console.error("Error fetching user session:", error);
        toast.current?.show({
          severity: "error",
          summary: "Session Error",
          detail: "Unable to fetch user session. Please log in again.",
          life: 3000,
        });
        localStorage.removeItem("authToken");
        router.push("/");
      }
    };

    fetchUserId();
  }, [router]);

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/session", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = "Failed to fetch user session.";
        if (response.status === 401) {
          errorMessage = errorData.message || "Unauthorized. Please log in again.";
        } else if (response.status === 404) {
          errorMessage = errorData.message || "User not found.";
        }
        throw new Error(errorMessage);
      }

      const { user } = await response.json();
      return user.id; // Return the user ID
    } catch (error: any) {
      console.error("Error fetching user session:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to fetch user session.",
        life: 5000,
      });
      window.location.href = "/"; // Redirect to home page
    }
  };

  const handleTaskSubmit = async (data: any) => {
    try {
      const userId = await fetchUser(); // Fetch user session to get user ID

      const payload = {
        ...data,
        userId, // Include the user ID in the payload
      };

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessage = "Failed to create task.";
        if (response.status === 400) {
          errorMessage = responseData.message || "Invalid task data provided.";
        } else if (response.status === 401) {
          errorMessage = "Unauthorized. Please log in again.";
        } else if (response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }
        throw new Error(errorMessage);
      }

      // Show success toast and navigate back
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Task created successfully.",
        life: 3000,
      });

      setTimeout(() =>  router.push(document.referrer), 3000);
    } catch (error: any) {
      console.error("Error creating task:", error);

      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "An unexpected error occurred.",
        life: 5000,
      });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--background-color)",
        padding: "24px 0",
        height: "87vh",
      }}
    >
      {/* Toast for notifications */}
      <Toast ref={toast} />
      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          backgroundColor: "#fff",
          borderRadius: "8px",
          padding: "24px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <a
          style={{
            display: "inline-block",
            marginBottom: "16px",
            fontSize: "0.875rem",
            color: "var(--primary-color)",
            cursor: "pointer",
            textDecoration: "none",
          }}
          onClick={() => router.back()}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
        >
          &larr; Back
        </a>

        {/* Page Header */}
        <h2
          style={{
            textAlign: "center",
            color: "var(--primary-color)",
            fontSize: "1.5rem",
            fontWeight: "600",
            marginBottom: "32px",
          }}
        >
          Create Task
        </h2>

        {/* Task Form */}
        <TaskForm onSubmit={handleTaskSubmit} />
      </div>
    </div>
  );
};

export default CreateTaskPage;
