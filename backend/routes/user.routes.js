import express from "express"
import { loginUser, registerUser, verifyOtp, verifyUser } from "../controllers/user.controllers.js"

const userRouter = express.Router()

userRouter.post("/register",registerUser)
userRouter.post("/verify/:token",verifyUser)
userRouter.post("/login",loginUser)
userRouter.post("/verify",verifyOtp)

export default userRouter