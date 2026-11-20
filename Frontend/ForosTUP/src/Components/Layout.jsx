import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Footer from "./Footer.jsx";
import Header from "./Header.jsx";
import "../styles/salvia.css";

export default function Layout({ salvia = false }) {
  const content = (
    <>
      <Header salvia={salvia} />
      <Outlet />
      {!salvia && <Footer />}
      <ToastContainer position="top-center" autoClose={3000} pauseOnHover theme="colored" />
    </>
  );

  return salvia ? <div className="salvia-layout">{content}</div> : content;
}
