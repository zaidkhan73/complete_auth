import express from "express";
import dotenv from "dotenv"
import connectDb from "./config/db.js";
import userRouter from "./routes/user.routes.js";
import {createClient} from "redis"
import cookieParser from "cookie-parser";

dotenv.config()

await connectDb()

const redisUrl = process.env.REDIS_URL

if(!redisUrl){
    console.log("missing redis url")
    process.exit(1)
}

export const redisClient = createClient({
    url:redisUrl
})

redisClient.connect().then(()=>console.log("connected to redis")).catch(console.error)

const app = express()

app.use(express.json())
app.use(cookieParser())

app.use("/api/v1",userRouter)

const PORT = process.env.PORT || 5000

app.listen(PORT,()=>{
    console.log(`server is listening on PORT: ${PORT} `)
})