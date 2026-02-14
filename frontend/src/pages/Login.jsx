import axios from 'axios'
import React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { server } from '../main'
import { toast } from 'react-toastify'

const Login = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [btnLoading, setBtnLoading] = useState(false)
    const navigate = useNavigate()

    const submitHandler = async (e) => {

        e.preventDefault()
        setBtnLoading(true)
        try {
            const { data } = await axios.post(`${server}/api/v1/login`, { email, password })
            toast.success(data.message)
            localStorage.setItem("email",email)
            navigate("/verifyOtp")
        } catch (error) {
            console.log(error)
        } finally {
            setBtnLoading(false)
        }
    }
    return (
        <section className="text-gray-600 body-font">
            <div className="container px-5 py-24 mx-auto flex flex-wrap items-center">
                <form onSubmit={submitHandler} className="lg:w-2/6 md:w-1/2 bg-gray-100 rounded-lg p-8 flex flex-col md:ml-auto w-full mt-10 md:mt-0">
                    <h2 className="text-gray-900 text-lg font-medium title-font mb-5">Sign Up</h2>
                    <div className="relative mb-4">
                        <label htmlFor="email" className="leading-7 text-sm text-gray-600">Email</label>
                        <input type="email" id="email" name="email" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required />
                    </div>
                    <div className="relative mb-4">
                        <label htmlFor="password" className="leading-7 text-sm text-gray-600">Password</label>
                        <input type="password" id="password" name="password" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required />
                    </div>
                    <button
                        type="submit"
                        disabled={btnLoading}
                        className={`text-white bg-indigo-500 py-2 px-8 rounded text-lg ${btnLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-600"
                            }`}
                    >
                        {btnLoading ? "Submitting..." : "Submit"}
                    </button>
                    <p className="text-xs text-gray-500 mt-3">Don't have an account? <Link className="text-xs text-blue-500 mt-3" to={"/register"}>Sign up</Link></p>
                </form>
            </div>
        </section>
    )
}

export default Login