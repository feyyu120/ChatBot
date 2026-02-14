import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/register";
import Bot from "./components/bot";
import Admin from "./components/admin";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
       <Route path="/bot" element={<Bot />} />
        <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}

export default App;
