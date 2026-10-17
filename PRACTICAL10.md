# Practical 10: Asynchronous Task Notifications

## Event flow

The API uses Node.js's built-in `EventEmitter` in [events.js](./events.js).
The listeners are registered once when [app.js](./app.js) starts:

1. `POST /tasks` saves the task in MongoDB.
2. The API sends the `201` response and logs its response timestamp.
3. The route emits `task-created` with the saved task and authenticated user
   ID.
4. The listener schedules a two-second notification task and returns
   immediately. Its completion timestamp appears later.
5. `DELETE /tasks/:id` emits `task-deleted` and logs a separate message.

The `error` listener in [listeners.js](./listeners.js) logs failures from the
background notification handler. These events are process-local and are not
durable, so a persistent queue or event broker would be more suitable for
high-volume production workloads.

## Expected log order

```text
[API] Response sent at 2026-...
[Notification] Handler started at 2026-...
[Notification] Task "..." created at 2026-...
[Notification] Assigned user: ...
[Notification] Handler completed at 2026-...
```

The first two lines are produced during the request, while the notification
completion lines appear after the simulated two-second delay. The response
does not wait for that delay.
