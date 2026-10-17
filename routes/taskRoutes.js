const express = require("express");
const Task = require("../models/Task");
const validateTask = require("../middleware/validateTask");
const cache = require("../utils/cache");
const taskEvents = require("../events");

const router = express.Router();
const ALL_TASKS_CACHE_KEY = "all_tasks";

// GET
router.get("/", async (req, res, next) => {
    try {
        const cachedTasks = cache.get(ALL_TASKS_CACHE_KEY);
        if (cachedTasks !== undefined) {
            res.set("X-Cache", "HIT");
            return res.status(200).json(cachedTasks);
        }

        const tasks = await Task.find().sort({ createdAt: -1 });
        cache.set(ALL_TASKS_CACHE_KEY, tasks);
        res.set("X-Cache", "MISS");
        res.status(200).json(tasks);
    } catch (error) {
        next(error);
    }
});

// POST
router.post("/", validateTask, async (req, res, next) => {
    try {
        const task = await Task.create(req.body);
        cache.del(ALL_TASKS_CACHE_KEY);
        res.status(201).json({
            message: "Task created successfully",
            task
        });
        console.log(`[API] Response sent at ${new Date().toISOString()}`);
        taskEvents.emit("task-created", {
            task,
            assignedUser: req.user.id
        });
    } catch (error) {
        next(error);
    }
});

// GET by ID
router.get("/:id", async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.status(200).json(task);
    } catch (error) {
        next(error);
    }
});

// PUT
router.put("/:id", validateTask, async (req, res, next) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        cache.del(ALL_TASKS_CACHE_KEY);
        res.status(200).json({
            message: "Task updated successfully",
            task
        });
    } catch (error) {
        next(error);
    }
});

// DELETE
router.delete("/:id", async (req, res, next) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        cache.del(ALL_TASKS_CACHE_KEY);
        res.status(200).json({
            message: "Task deleted successfully"
        });
        taskEvents.emit("task-deleted", {
            task,
            assignedUser: req.user.id
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
