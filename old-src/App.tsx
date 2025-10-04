import { Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import InputArchive from "./components/InputArchive";
import SignUp from "./pages/SignUp";
import SignUp1 from "./pages/SignUp1";
import BusinessDashboard from "./pages/BusinessDashboard";
import BusinessSignUp from "./pages/BusinessSignUp";
import InfluencerSignUp from "./pages/InfluencerSignUp";
// import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/inputarchive" element={<InputArchive />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signup1" element={<SignUp1 />} />
      <Route path="/businesssignup" element={<BusinessSignUp />} />
      <Route path="/influencersignup" element={<InfluencerSignUp />} />
      <Route path="/businessdashboard" element={<BusinessDashboard />} />
      {/* <Route path="/dashboard" element={<Dashboard />} /> */}
    </Routes>
  );
}

export default App;
