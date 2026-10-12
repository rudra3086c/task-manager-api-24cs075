# Task Manager frontend

This React/Vite app is the browser client for the Express API in the parent
directory. It supports creating, viewing, editing, completing, and deleting
tasks. Create operations use an optimistic list entry and roll it back if the
API rejects the request. Every read and write displays an error state when it
fails, and successful or failed operations display a toast.

## Run locally

From the repository root:

```bash
npm install
npm start
```

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The frontend calls
`http://localhost:5000` by default. To use another API URL, create
`frontend/.env` with:

```text
VITE_API_URL=http://localhost:5000
```

The backend requires `MONGO_URI` in the root `.env` file. It accepts
`FRONTEND_ORIGIN` to replace the default CORS origin
(`http://localhost:5173`).
