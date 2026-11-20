import { Outlet } from "react-router-dom";
import Footer from "./Footer.jsx";
import Header from "./Header.jsx";
import "../styles/salvia.css";

export default function Layout({ salvia = false }) {
  const content = (
    <>
      <Header salvia={salvia} />
      <Outlet />
      {!salvia && <Footer />}
    </>
  );

  return salvia ? <div className="salvia-layout">{content}</div> : content;
}
