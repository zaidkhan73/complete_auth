import {z} from "zod";

export const registerSchema = z.object({
    name: z.string().min(3,"Name must be atleart three character long"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(8,"password must be atleast 8 characters long")
})

export const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(8,"password must be atleast 8 characters long")
})