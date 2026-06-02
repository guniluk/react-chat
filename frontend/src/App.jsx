import { Routes, Route } from 'react-router-dom';
import { Login } from './pages/login/Login';
import { Signup } from './pages/signup/Signup';
import Home from './pages/home/Home';

function App() {
  return (
    <div className="p-4 flex items-center justify-center min-h-screen">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
