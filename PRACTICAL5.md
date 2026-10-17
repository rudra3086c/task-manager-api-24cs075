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

The server connects to MongoDB before it starts listening on port `5000`.

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

## Server-side caching

The authenticated `GET /tasks` endpoint uses an in-memory `node-cache`
instance with a 60-second TTL. The first request queries MongoDB and returns
`X-Cache: MISS`; subsequent requests within the TTL return the cached result
with `X-Cache: HIT`. Successful POST, PUT, and DELETE operations invalidate
the `all_tasks` cache key before returning their response.

Install the cache dependency with:

```bash
npm install
```

### Measuring the impact

1. Log in and copy the JWT into Postman's Bearer Token authorization.
2. Send `GET http://localhost:5000/tasks` three times without writing any
   tasks. Record Postman's **Time** value and the `X-Cache` response header.
   The first request should be `MISS`; the next two should be `HIT`.
3. Create, update, or delete a task, then send `GET /tasks` again. It should
   be `MISS`, demonstrating invalidation.
4. For an uncached comparison, restart the server before each request (which
   clears the in-memory cache), or temporarily disable the cache lookup and
   `cache.set` lines while recording three readings. Restore caching afterward.

Record at least three samples in the lab journal:

| Condition | Reading 1 | Reading 2 | Reading 3 | Average |
| --- | ---: | ---: | ---: | ---: |
| Uncached (`X-Cache: MISS`) | ___ ms | ___ ms | ___ ms | ___ ms |
| Cached (`X-Cache: HIT`) | ___ ms | ___ ms | ___ ms | ___ ms |

This cache is process-local and is suitable for this lab, but it is not a
shared cache for a multi-server deployment. Multiple instances can each hold
different values; a shared store such as Redis would be needed at scale.
