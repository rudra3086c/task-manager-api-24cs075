const allowedFields = ["title", "description", "completed", "priority"];

function validateTask(req, res, next) {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
        return res.status(400).json({ message: "Request body must be a JSON object" });
    }

    const unknownFields = Object.keys(req.body).filter((field) => !allowedFields.includes(field));
    if (unknownFields.length > 0) {
        return res.status(400).json({
            message: "Request contains unsupported fields",
            fields: unknownFields
        });
    }

    if (typeof req.body.title !== "string" || !req.body.title.trim()) {
        return res.status(400).json({
            message: "Validation failed",
            errors: [{ field: "title", message: "Title is required" }]
        });
    }

    if (req.body.title.trim().length > 120) {
        return res.status(400).json({
            message: "Validation failed",
            errors: [{ field: "title", message: "Title must be 120 characters or fewer" }]
        });
    }

    if (req.body.description !== undefined && typeof req.body.description !== "string") {
        return res.status(400).json({
            message: "Validation failed",
            errors: [{ field: "description", message: "Description must be a string" }]
        });
    }

    if (req.body.priority !== undefined && !["low", "medium", "high"].includes(req.body.priority)) {
        return res.status(400).json({
            message: "Validation failed",
            errors: [{ field: "priority", message: "Priority must be low, medium, or high" }]
        });
    }

    if (req.body.completed !== undefined && typeof req.body.completed !== "boolean") {
        return res.status(400).json({
            message: "Validation failed",
            errors: [{ field: "completed", message: "Completed must be a boolean" }]
        });
    }

    req.body.title = req.body.title.trim();
    if (typeof req.body.description === "string") {
        req.body.description = req.body.description.trim();
    }
    next();
}

module.exports = validateTask;
