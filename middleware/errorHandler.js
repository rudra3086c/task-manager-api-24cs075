function errorHandler(err, req, res, next) {
    console.error(err);

    if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map((fieldError) => ({
            field: fieldError.path,
            message: fieldError.message
        }));

        return res.status(400).json({
            message: "Validation failed",
            errors
        });
    }

    if (err.name === "CastError") {
        return res.status(400).json({
            message: `Invalid ${err.path}`
        });
    }

    res.status(500).json({
        message: "Internal Server Error"
    });
}

module.exports = errorHandler;
