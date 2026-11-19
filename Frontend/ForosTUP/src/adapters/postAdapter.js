export const postFromApi = (post) => ({
  id: post.id,
  userId: post.poster,
  forumId: post.forum,
  postDate: post.date,
  edited: post.edited,
  hidden: post.invisible,
  body: post.body,
});

export const newPostToApi = ({ body, forumId }) => ({
  forum: forumId,
  body: body.trim(),
});
