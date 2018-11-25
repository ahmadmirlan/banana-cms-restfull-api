const { Post } = require("../model/PostModel");

/**
 * Police for Deleting Post
 * Owner of this or ADMIN role can pass this middleware
 **/
const deletePost = async (req, res, next) => {
  // 401 Unauthorized
  // 403 Forbidden
  let post = await Post.findById(req.params.id).select("author");
  if (!post) res.status(404).send({error: "Post Not Found"});

  if (
    !(
      JSON.stringify(req.user._id) === JSON.stringify(post.author._id) ||
      req.user.role === "ADMIN"
    )
  )
    return res.status(403).send({ error: "Access denied." });
  next();
};

/**
* Police for updating post,
 * Just Owner of this post can pass this middle ware
* */
const updatePost = async (req, res, next) => {
  let post = await Post.findById(req.params.id).select("author");
  if (!post) return res.status(404).send({error: "Post Not Found."});

  if (!(JSON.stringify(req.user._id) === JSON.stringify(post.author._id)))
    return res.status(403).send({ error: "Access denied." });
  next();
};

exports.policyDelete = deletePost;
exports.policyUpdate = updatePost;