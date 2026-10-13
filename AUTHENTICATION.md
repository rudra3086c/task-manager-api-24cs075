# Authentication and validation

The API uses JWT bearer authentication for task routes.

## Configuration

Add these values to `.env`:

```env
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=use-a-long-random-secret
```

Install the server dependencies with `npm install`, then start the API with
`npm start`.

## Authentication endpoints

| Method | Path | Description |
| --- | --- | --- |
| POST | `/auth/register` | Create an account with `email` and a password of at least six characters |
| POST | `/auth/login` | Verify credentials and return a JWT valid for one hour |
| GET | `/auth/me` | Return the logged-in user's id and email |

Send the token to protected endpoints as:

```text
Authorization: Bearer <token>
```

All `/tasks` endpoints require this header. Missing, invalid, or expired
tokens return `401`. Task create and update requests validate the title,
description, priority, and completed fields before reaching MongoDB.
