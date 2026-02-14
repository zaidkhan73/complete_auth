import React from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import { ToastContainer } from 'react-toastify'
import VerifyOtp from './pages/VerifyOtp'

export const App = () => {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/verifyOtp" element={<VerifyOtp/>}/>
      </Routes>
      <ToastContainer/>
    </BrowserRouter>
    </>
  )
}
