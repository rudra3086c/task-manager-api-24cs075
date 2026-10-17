const taskEvents = require("./events");

taskEvents.on("task-created", (payload) => {
    try {
        const { task, assignedUser } = payload || {};
        console.log(
            `[Notification] Handler started at ${new Date().toISOString()} for task "${task?.title || "unknown"}"`
        );

        setTimeout(() => {
            try {
                if (!task || !task.title) {
                    throw new Error("Task-created notification is missing a task title");
                }

                console.log(
                    `[Notification] Task "${task.title}" created at ${new Date().toISOString()}`
                );
                console.log(`[Notification] Assigned user: ${assignedUser}`);
                console.log(
                    `[Notification] Handler completed at ${new Date().toISOString()}`
                );
            } catch (error) {
                taskEvents.emit("error", error);
            }
        }, 2000);
    } catch (error) {
        taskEvents.emit("error", error);
    }
});

taskEvents.on("task-deleted", ({ task, assignedUser }) => {
    console.log(
        `[Notification] Task "${task.title}" deleted at ${new Date().toISOString()} by user ${assignedUser}`
    );
});

taskEvents.on("error", (error) => {
    console.error("[Notification] Background task error:", error);
});
