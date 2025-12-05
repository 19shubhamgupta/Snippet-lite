import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import { Toaster } from "react-hot-toast";
import NavBar from "./Components/NavBar";

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <NavBar/>
      <Outlet />

    </>
  );
}

export default App;
