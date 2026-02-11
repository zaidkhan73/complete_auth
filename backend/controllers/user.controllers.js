import { registerSchema } from "../config/zod.js"
import asyncHandler from "../middlewares/asyncHandler.js"
import sanitize from "mongo-sanitize"

export const registerUser = asyncHandler(async (req, res) => {

    const sanitizedBody = sanitize(req.body);

    const validation = registerSchema.safeParse(sanitizedBody);

    if (!validation.success) {

        const allErrors = validation.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
            code: issue.code
        }));

        return res.status(400).json({
            message: allErrors[0]?.message || "Validation error",
            errors: allErrors
        });
    }

    const { name, email, password } = validation.data;

    res.json({
        name,
        email,
        password
    });
});
