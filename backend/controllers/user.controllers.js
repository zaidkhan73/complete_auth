import { loginSchema, registerSchema } from "../config/zod.js"
import { redisClient } from "../index.js";
import asyncHandler from "../middlewares/asyncHandler.js"
import sanitize from "mongo-sanitize"
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt"
import crypto from "crypto"
import sendMail from "../config/sendMail.js";
import { getOtpHtml, getVerifyEmailHtml } from "../config/html.js";
import { generateAccessToken, generateToken, verifyRefreshToken } from "../config/generateToken.js";

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


export const loginUser = asyncHandler(async(req,res)=>{
    const sanitizedBody = sanitize(req.body);

    const validation = loginSchema.safeParse(sanitizedBody);

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

    const {  email, password } = validation.data;

    const rateLimitKey = `login-rate-limit:${req.ip}:${req.email}`

    if (await redisClient.get(rateLimitKey)) {
        return res.status(429).json({
            message: "Too many requests"
        })
    }

    const user = await User.findOne({email})

    if(!user){
        return res.status(400).json({
            message:"Invalid credentials"
        })
    }

    const comparedPassword = await bcrypt.compare(password,user.password)

    if(!comparedPassword){
        return res.status(400).json({
            message:"Invalid credentials"
        })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    const otpKey = `otp:${email}`;

    await redisClient.set(otpKey,JSON.stringify(otp),{EX:300});

    const subject = "otp for verification"

    const html = getOtpHtml({email,otp})

    await sendMail({email, subject, html})

    await redisClient.set(rateLimitKey,"true",{EX:60})

    res.json({
        message:"if your email is valid, an otp is send, it will be valid for 5 minute"
    })
})

export const verifyOtp = asyncHandler(async(req,res)=>{
    const {email,otp} = req.body;

    if(!email || !otp){
        return res.status(400).json({
            message:"please provide all details for verification"
        })
    }

    const otpKey = `otp:${email}`

    const storedOtpString = await redisClient.get(otpKey)

    if(!storedOtpString){
        return res.status(400).json({
            message:"otp expired"
        })
    }

    const storedOtp = JSON.parse(storedOtpString)

    if(storedOtp !== otp){
        return res.status(400).json({
            message:"invalid otp"
        })
    }

    await redisClient.del(otpKey)

    let user = await User.findOne({email})

    //once 2FA is done by verifying otp give the user token
    const tokenData = await generateToken(user._id, res);

    res.status(200).json({
        message:`welcome ${user.name}`,
        user,

    })

})

export const myProfile = asyncHandler(async(req,res)=>{
    const user = req.user

    res.json(user)
})

export const refreshToken = asyncHandler(async(req,res)=>{
    const refreshToken = req.cookies.refreshToken;


    
    if(!refreshToken){
        return res.status(400).json({
            message:"Invalid refresh token"
        })
    }

    const decode = await verifyRefreshToken(refreshToken)

    if(!decode){
        return res.status(400).json({
            message:"Invalid refresh token 111"
        })
    }

    generateAccessToken(decode.id,res);

    res.status(200).json({
        message:"token refreshed"
    })
})

export const revokeRefreshToken = asyncHandler(async(userId)=>{
    await redisClient.del(`refresh_token:${userId}`)
})

export const logoutUser = asyncHandler(async(req,res)=>{
    const userId = req.user._id;

    await revokeRefreshToken(userId);

    res.clearCookie("refreshToken")
    res.clearCookie("accessToken")

    await redisClient.del(`user:${userId}`)

    res.json({
        message:"logged out successfully"
    })
})