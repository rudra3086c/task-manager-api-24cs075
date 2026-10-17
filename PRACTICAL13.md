# Practical 13: Responsible AI Task Assistance

## Feature

Authenticated users can enter a task title and select **Generate
description** in the task form. The React client sends only the title to the
Express backend. The backend calls OpenAI and returns an editable description
suggestion.

This implementation uses Groq's OpenAI-compatible chat-completions API. The
API key is read only from the backend environment:

```env
GROQ_API_KEY=your_key_here
GROQ_MODEL=openai/gpt-oss-20b
```

Never put the key in `frontend/.env`, source code, browser JavaScript, or
committed files. The root `.env` file is ignored by Git. The frontend does not
need to know which AI provider is being used.

## Endpoint

```http
POST /api/ai/generate-description
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "title": "Prepare Docker practical screenshots"
}
```

The endpoint returns a description and an AI review message. It also limits
requests to one suggestion per user and task title per minute.

## Graceful degradation

If `GROQ_API_KEY` is not configured, the provider times out, or the provider
returns an error, the API responds with HTTP 200 and a fallback message. The
task form remains usable and the user can enter a description manually. A
missing title returns HTTP 400, and a repeated request within the rate limit
returns HTTP 429.

## Responsible AI use

- Treat the generated text as a suggestion, not an authoritative answer.
- Review and edit the suggestion before saving the task.
- Do not send passwords, tokens, personal data, confidential records, or
  sensitive institutional information to the provider.
- Keep the API key server-side and avoid logging prompts, keys, or provider
  responses unnecessarily.
- Tell users clearly that the content is AI-generated.
