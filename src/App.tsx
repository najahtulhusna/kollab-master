import { Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import InputArchive from "./components/InputArchive";
// import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/inputarchive" element={<InputArchive />} />
      {/* <Route path="/dashboard" element={<Dashboard />} /> */}
    </Routes>
  );
}

export default App;
