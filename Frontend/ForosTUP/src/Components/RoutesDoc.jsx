import { BrowserRouter, Route, Routes } from "react-router-dom";

import "react-toastify/dist/ReactToastify.css";
import "../styles/toast.css";
import { ToastContainer } from "react-toastify";
import Layout from "./Layout.jsx";
import Protected from "./Protected.jsx";
import PublicOnly from "./PublicOnly.jsx";
import ProtectedOnlyAdmin from "./ProtectedOnlyAdmin.jsx";
import MainPage from "./MainPage.jsx";
import LogIn from "./LogIn.jsx";
import Register from "./Register.jsx";
import NotFound from "./NotFound.jsx";
import ForumListPage from "./ForumListPage.jsx";
import ForumPage from "./ForumPage.jsx";
import PostPage from "./PostPage.jsx";
import NewForum from "./NewForum.jsx";
import NewPost from "./NewPost.jsx";
import Bans from "./Bans.jsx";
import NewBans from "./NewBans.jsx";
import UserEdit from "./UserEdit.jsx";

export default function RoutesDoc() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout salvia />}>
          <Route path="/" element={<MainPage />} />
          <Route path="/main" element={<MainPage />} />
          <Route path="/home" element={<MainPage />} />
          <Route path="/foros" element={<ForumListPage />} />
          <Route path="/forum/:forumId" element={<ForumPage />} />
          <Route path="/post/:postId" element={<PostPage />} />

          <Route element={<PublicOnly />}>
            <Route path="/login" element={<LogIn />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route element={<Protected />}>
            <Route path="/forums/:forumId/posts/new" element={<NewPost />} />
            <Route element={<ProtectedOnlyAdmin />}>
              <Route path="/newforum" element={<NewForum />} />
            </Route>
          </Route>
        </Route>

        <Route element={<Layout />}>
          <Route element={<Protected />}>
            <Route path="/user/edit" element={<UserEdit />} />
            <Route element={<ProtectedOnlyAdmin />}>
              <Route path="/bans" element={<Bans />} />
              <Route path="/newban" element={<NewBans />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer position="top-center" autoClose={3000} pauseOnHover theme="light" toastClassName="salvia-toast" icon={false} />
    </BrowserRouter>
  );
}
