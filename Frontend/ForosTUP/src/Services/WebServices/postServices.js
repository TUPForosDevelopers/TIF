import { getPost, updatePostBody, deletePost } from "../postService.js";
import { getForum } from "../forumService.js";
import { getUser } from "../userService.js";

export const fetchPost = async (postId) => {
  const post = await getPost(postId);
  const [author, forum] = await Promise.allSettled([
    getUser(post.userId),
    getForum(post.forumId),
  ]);
  return {
    ...post,
    Person: author.status === "fulfilled" ? author.value : null,
    Forum: forum.status === "fulfilled" ? forum.value : null,
  };
};

export const updatePost = (postId, { body }, token) =>
  updatePostBody(postId, body, token);

export { deletePost };
