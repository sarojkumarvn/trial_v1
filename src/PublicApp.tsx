import "./index.css";
import App from "./App.tsx";
import Login from "./Login.tsx";

import Signup from "./Signup";

const path = window.location.pathname.replace(/\/$/, "");
export default function PublicApp() {
  return path === "/signup" ? (
    <Signup />
  ) : path === "/login" ? (
    <Login />
  ) : (
    <App />
  );
}
