import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { createTask, deleteTask, getCurrentUser, getTasks, login, register, updateTask } from "./api";

const emptyForm = { title: "", description: "", priority: "medium" };

function lazyWithMinimumDelay(importPage, delay = 300) {
  return lazy(() => Promise.all([
    importPage(),
    new Promise((resolve) => window.setTimeout(resolve, delay))
  ]).then(([module]) => module));
}

const Projects = lazyWithMinimumDelay(() => import("./pages/Projects"));
const Contact = lazyWithMinimumDelay(() => import("./pages/Contact"));

function Toast({ toast }) {
  if (!toast) return null;
  return <div className={`toast ${toast.type}`}>{toast.message}</div>;
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const result = mode === "login"
        ? await login({ email, password })
        : await register({ email, password });
      if (mode === "register") {
        setMode("login");
        setPassword("");
        setError("Registration successful. You can now log in.");
      } else {
        localStorage.setItem("token", result.token);
        onAuthenticated(result.user);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page auth-page">
      <header>
        <p className="eyebrow">FULL-STACK TASK MANAGER</p>
        <h1>{mode === "login" ? "Welcome back." : "Create your account."}</h1>
        <p className="subtitle">Sign in to manage your tasks securely.</p>
      </header>
      <section className="panel auth-panel">
        <h2>{mode === "login" ? "Log in" : "Register"}</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength="6" required /></label>
          {error && <p className="error" role="alert">{error}</p>}
          <button disabled={submitting}>{submitting ? "Please wait..." : mode === "login" ? "Log in" : "Register"}</button>
        </form>
        <button className="link-button auth-switch" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
          {mode === "login" ? "Need an account? Register" : "Already have an account? Log in"}
        </button>
      </section>
    </main>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [route, setRoute] = useState(window.location.pathname);
  const [routeLoading, setRouteLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      setTasks([]);
      setError("Your session has expired. Please log in again.");
    };
    window.addEventListener("auth-expired", handleExpired);
    if (localStorage.getItem("token")) {
      getCurrentUser().then(setUser).catch(() => setUser(null));
    }
    return () => window.removeEventListener("auth-expired", handleExpired);
  }, []);

  useEffect(() => {
    const handleNavigation = () => setRoute(window.location.pathname);
    window.addEventListener("popstate", handleNavigation);
    return () => window.removeEventListener("popstate", handleNavigation);
  }, []);

  const navigate = (path) => {
    if (path === route) return;

    window.history.pushState({}, "", path);
    setRouteLoading(true);
    window.setTimeout(() => {
      setRoute(path);
      setRouteLoading(false);
    }, 600);
  };

  const notify = (message, type = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3200);
  };

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setTasks(await getTasks());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadTasks();
  }, [loadTasks, user]);

  if (!user) {
    return <AuthScreen onAuthenticated={setUser} />;
  }

  const routeContent = route === "/projects"
    ? <Projects />
    : route === "/contact"
      ? <Contact />
      : null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const taskData = {
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority
    };

    if (!taskData.title) {
      setError("A title is required.");
      setSaving(false);
      return;
    }

    try {
      if (editingId) {
        const result = await updateTask(editingId, {
          ...taskData,
          completed: tasks.find((task) => task._id === editingId)?.completed ?? false
        });
        setTasks((current) =>
          current.map((task) => (task._id === editingId ? result.task : task))
        );
        notify("Task updated successfully.");
      } else {
        const temporaryId = `temporary-${Date.now()}`;
        const optimisticTask = {
          ...taskData,
          _id: temporaryId,
          completed: false,
          createdAt: new Date().toISOString(),
          optimistic: true
        };
        setTasks((current) => [optimisticTask, ...current]);
        try {
          const result = await createTask(taskData);
          setTasks((current) =>
            current.map((task) => (task._id === temporaryId ? result.task : task))
          );
          notify("Task created successfully.");
        } catch (requestError) {
          setTasks((current) => current.filter((task) => task._id !== temporaryId));
          throw requestError;
        }
      }
      setForm(emptyForm);
      setEditingId(null);
    } catch (requestError) {
      setError(requestError.message);
      notify(requestError.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (task) => {
    setEditingId(task._id);
    setForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority
    });
    setError("");
  };

  const toggleCompleted = async (task) => {
    setUpdatingId(task._id);
    setError("");
    try {
      const result = await updateTask(task._id, {
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        completed: !task.completed
      });
      setTasks((current) =>
        current.map((item) => (item._id === task._id ? result.task : item))
      );
      notify(result.task.completed ? "Task completed." : "Task marked incomplete.");
    } catch (requestError) {
      setError(requestError.message);
      notify(requestError.message, "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setDeletingId(task._id);
    setError("");
    try {
      await deleteTask(task._id);
      setTasks((current) => current.filter((item) => item._id !== task._id));
      notify("Task deleted successfully.");
    } catch (requestError) {
      setError(requestError.message);
      notify(requestError.message, "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="page">
      <Toast toast={toast} />
      <header>
        <p className="eyebrow">FULL-STACK TASK MANAGER</p>
        <h1>Plan the work. Finish the work.</h1>
        <p className="subtitle">Tasks are persisted through your Express and MongoDB API.</p>
        <nav className="main-nav" aria-label="Main navigation">
          <button className={route === "/" ? "nav-active" : "link-button"} onClick={() => navigate("/")}>Tasks</button>
          <button className={route === "/projects" ? "nav-active" : "link-button"} onClick={() => navigate("/projects")}>Projects</button>
          <button className={route === "/contact" ? "nav-active" : "link-button"} onClick={() => navigate("/contact")}>Contact</button>
          <button className="secondary" onClick={() => {
            localStorage.removeItem("token");
            setUser(null);
            setTasks([]);
          }}>Log out</button>
        </nav>
      </header>

      {routeLoading ? (
        <div className="route-loading" role="status">
          Loading page...
        </div>
      ) : (
        <Suspense fallback={<div className="route-loading" role="status">Loading page...</div>}>
          {routeContent}
        </Suspense>
      )}

      {!routeContent && <section className="panel">
        <h2>{editingId ? "Edit task" : "Create a task"}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Title
            <input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="What needs to be done?"
              maxLength="120"
            />
          </label>
          <label>
            Description
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Add useful context (optional)"
              rows="3"
            />
          </label>
          <label>
            Priority
            <select
              value={form.priority}
              onChange={(event) => setForm({ ...form, priority: event.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <div className="form-actions">
            <button disabled={saving}>{saving ? "Saving..." : editingId ? "Save changes" : "Add task"}</button>
            {editingId && (
              <button type="button" className="secondary" onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}>Cancel</button>
            )}
          </div>
        </form>
      </section>}

      {!routeContent && <section className="tasks-section">
        <div className="section-heading">
          <h2>Your tasks</h2>
          <span>{tasks.filter((task) => !task.completed).length} open</span>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        {loading ? <p className="status">Loading tasks...</p> : tasks.length === 0 ? (
          <p className="status">No tasks yet. Create your first one above.</p>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <article className={`task-card ${task.completed ? "completed" : ""}`} key={task._id}>
                <div className="task-check">
                  <input type="checkbox" checked={task.completed} onChange={() => toggleCompleted(task)} disabled={task.optimistic || updatingId === task._id} />
                </div>
                <div className="task-content">
                  <div className="task-title-row">
                    <h3>{task.title}</h3>
                    <span className={`priority ${task.priority}`}>{task.priority}</span>
                  </div>
                  {task.description && <p>{task.description}</p>}
                  {task.optimistic && <small>Saving to server...</small>}
                </div>
                <div className="task-actions">
                  <button className="link-button" onClick={() => startEditing(task)} disabled={task.optimistic}>Edit</button>
                  <button className="link-button danger" onClick={() => handleDelete(task)} disabled={deletingId === task._id || task.optimistic}>
                    {deletingId === task._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>}
    </main>
  );
}

export default App;
