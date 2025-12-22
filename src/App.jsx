import { Route, Routes } from "react-router-dom"
import './App.css';
import Navbar from "./component/common/Navbar";

import Home from "./pages/Home"
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import About from "./pages/About";
import VerifyEmail from "./pages/VerifyEmail";


function App() {

  return (
    <div className="w-screen min-h-screen bg-richblack-900 flex flex-col font-inter">
      
          <Navbar/>

          <Routes>
              <Route path="/" element= {<Home/> } />
              <Route path="/login" element= {<Login/>} />
              <Route path="/signup" element= {<Signup/>} />
              <Route path="/about" element= {<About/>} />
              <Route path="/verify-email" element={<VerifyEmail />} />

              <Route path="dashboard/my-profile" element={<MyProfile/>} />

          </Routes>

    </div>
  )
}

export default App
