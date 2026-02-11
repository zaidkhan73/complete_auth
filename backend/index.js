import express from "express";
import dotenv from "dotenv"
import connectDb from "./config/db.js";
import userRouter from "./routes/user.routes.js";

dotenv.config()

await connectDb()

const app = express()

app.use(express.json())

app.use("/api/v1",userRouter)

const PORT = process.env.PORT || 5000

app.listen(PORT,()=>{
    console.log(`server is listening on PORT: ${PORT} `)
})