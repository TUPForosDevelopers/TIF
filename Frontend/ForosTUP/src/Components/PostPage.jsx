import { useParams } from "react-router-dom";
import Post from "./Post.jsx";

const PostPage = () => {
  const { postId } = useParams();

  return <Post key={postId} postId={postId} />;
};

export default PostPage;