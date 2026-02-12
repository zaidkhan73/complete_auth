import express from "express"
import { loginUser, logoutUser, myProfile, refreshToken, registerUser, verifyOtp, verifyUser } from "../controllers/user.controllers.js"
import { isAuth } from "../middlewares/isAuth.js"

const userRouter = express.Router()

userRouter.post("/register",registerUser)
userRouter.post("/verify/:token",verifyUser)
userRouter.post("/login",loginUser)
userRouter.post("/verify",verifyOtp)
userRouter.get("/me",isAuth,myProfile)
userRouter.post("/refresh",refreshToken)
userRouter.post("/logout",isAuth,logoutUser)

export default userRouter