# Practical 5: Task Manager API with MongoDB and Mongoose

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env`.
3. Replace `MONGO_URI` with a MongoDB Atlas connection string. Do not commit
   the `.env` file.
4. Start the API:

   ```bash
   npm start
   ```

The server connects to MongoDB before it starts listening on port `3000`.

## Task schema

The `Task` model stores:

- `title`: required trimmed string
- `description`: optional trimmed string
- `completed`: boolean defaulting to `false`
- `priority`: `low`, `medium`, or `high`, defaulting to `medium`
- `createdAt`: date defaulting to the current time

Validation runs before a document is saved. Update requests also use
`runValidators: true`.

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/tasks` | Return all tasks |
| GET | `/tasks/:id` | Return one task or a JSON 404 |
| POST | `/tasks` | Create a task |
| PUT | `/tasks/:id` | Update a task and validate the result |
| DELETE | `/tasks/:id` | Delete a task |

Example create request:

```json
{
  "title": "  Complete Practical 5  ",
  "description": "Connect Express to MongoDB",
  "priority": "high"
}
```

The stored title is trimmed and `completed` defaults to `false`.

## Validation response

Sending a request without `title`, or with an invalid `priority`, returns
structured JSON instead of the raw Mongoose error:

```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

Use the MongoDB Atlas database view or MongoDB Compass to confirm that
created tasks remain available after restarting the server.
