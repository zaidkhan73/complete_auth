import { registerSchema } from "../config/zod.js"
import { redisClient } from "../index.js";
import asyncHandler from "../middlewares/asyncHandler.js"
import sanitize from "mongo-sanitize"
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt"
import crypto from "crypto"
import sendMail from "../config/sendMail.js";
import { getVerifyEmailHtml } from "../config/html.js";

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

    const rateLimitKey = `register-rate-limit:${req.ip}:${email}`;

    if (await redisClient.get(rateLimitKey)) {
        return res.status(429).json({
            message: "Too many requests"
        })
    }

    const existingUser = await User.findOne({ email })

    if (existingUser) {
        return res.status(400).json({
            message: "user already exists"
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const verifyToken = crypto.randomBytes(32).toString("hex")

    const verifyKey = `verify:${verifyToken}`

    const dataToStore = JSON.stringify({
        name,
        email,
        password: hashedPassword
    })

    await redisClient.set(verifyKey, dataToStore, { EX: 300 }) //stored in redis for 5 mins

    const subject = "verify your email for account creation"

    const html = getVerifyEmailHtml({
        email,
        token: verifyToken
    });


    await sendMail({ email, subject, html })

    await redisClient.set(rateLimitKey, "true", { EX: 60 })

    res.json({
        message: "if your email is valid, a varification email has been send. It will expire in 5 minutes"
    });
});

export const verifyUser = asyncHandler(async(req,res)=>{
    const {token} = req.params

    if(!token){
        return res.status(400).json({
            message:"verification token in required"
        })
    }

    const verifyKey = `verify:${token}`;
    
    const userDataJson = await redisClient.get(verifyKey)

    if(!userDataJson){
        return res.status(400).json({
            message: "verification link is expired"
        })
    }

    await redisClient.del(verifyKey)

    const userData = JSON.parse(userDataJson)

    const newUser = await User.create({
        name: userData.name,
        email: userData.email,
        password: userData.password,
    })

    res.status(201).json({
        message:"Email verified!!! your account has been created",
        user: {_id: newUser._id, name: newUser.name, email: newUser.email}
    })
})

