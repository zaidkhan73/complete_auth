import React from 'react'
import { useState} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { server } from '../main'
import { toast } from 'react-toastify'

const VerifyOtp = () => {

    const [otp, setOtp] = useState("")
    const [btnLoading, setBtnLoading] = useState(false)
    const navigate = useNavigate()


    const submitHandler = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    const email = localStorage.getItem("email");

    try {
        const { data } = await axios.post(
            `${server}/api/v1/verify`,
            { email, otp },
            { withCredentials: true }
        );

        toast.success(data.message);
        localStorage.removeItem("email");
        navigate("/login");

    } catch (error) {
        toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
        setBtnLoading(false);
    }
};

  return (
     <section className="text-gray-600 body-font">
            <div className="container px-5 py-24 mx-auto flex flex-wrap items-center">
                <form onSubmit={submitHandler} className="lg:w-2/6 md:w-1/2 bg-gray-100 rounded-lg p-8 flex flex-col md:ml-auto w-full mt-10 md:mt-0">
                    <h2 className="text-gray-900 text-lg font-medium title-font mb-5">Verify otp</h2>
                    <div className="relative mb-4">
                        <label htmlFor="otp" className="leading-7 text-sm text-gray-600">Otp</label>
                        <input type="number" id="otp" name="otp" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
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
                    <Link className="text-xs text-blue-500 mt-3" to={"/login"}>Go to login page</Link>
                </form>
            </div>
        </section>
  )
}

export default VerifyOtp