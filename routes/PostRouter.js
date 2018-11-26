const { Post, validate } = require("../model/PostModel");
const _ = require("lodash");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { User } = require("../model/UserModel");
const PageBuilder = require("../library/PageBuilder");
const validateId = require("../middleware/validateObjectId");
const { policyUpdate, policyDelete } = require("../middleware/postPolicy");
const isAdmin = require("../middleware/admin");

/*POST create new Post | (Authentication) is required*/
router.post("/", [auth], async (req, res) => {
  const body = req.body;
  const { error } = validate(body);

  // If error spotted, return this
  if (error) return res.status(400).send({ error: error.details[0].message });

  // Check categories, is have value??
  if (body.categories.length <= 0)
    return res
      .status(400)
      .send({ error: "Categories should have at least one value" });
  /******************************************************************/

  let post = Post(
    _.pick(req.body, ["title", "cover", "content", "categories", "status"])
  );

  /*Find Author By Id from Token*/
  const author = await User.findById(req.user._id).select("name");

  post["publishDate"] = Date.now();
  post["author"] = author;
  post
    .save()
    .then(post => res.send(post))
    .catch(error => res.status(400).send({ error: error }));
});

/*
 **GET Find All Post || Expose For Public purpose,
 **no sensitive data should be there
 **/
router.get("/", async (req, res) => {
  let size = req.query.size ? parseInt(req.query.size) : 10;
  let page = req.query.page ? parseInt(req.query.page) : 0;
  let category = req.query.category ? req.query.category : "";
  let totalElement =
    category === ""
      ? await Post.countDocuments({ status: "PUBLISHED" })
      : await Post.countDocuments({
          status: "PUBLISHED",
          categories: { postCategory: category }
        });

  let post =
    category !== ""
      ? await Post.find({
          status: "PUBLISHED",
          categories: { postCategory: category }
        })
          .limit(size)
          .skip(page * size)
          .sort("-publishDate")
      : await Post.find({ status: "PUBLISHED" })
          .limit(size)
          .skip(page * size)
          .sort("-publishDate");
  const pb = new PageBuilder(post, size, totalElement, page);
  post
    ? res.send(pb.renderData)
    : res.status(500).send({ error: "Opps.. Something Went Wrong" });
});

/*GET Find All Post Without limits || {Role:ADMIN} is required*/
router.get("/all", [auth, isAdmin], async (req, res) => {
  let statusPost = req.query.status ? req.query.status : "";
  let size = req.query.size ? parseInt(req.query.size) : 10;
  let page = req.query.page ? parseInt(req.query.page) : 0;
  let totalElement = 0;

  statusPost === ""
    ? (totalElement = await Post.countDocuments())
    : (totalElement = await Post.countDocuments({ status: statusPost }));

  let post =
    statusPost === ""
      ? await Post.find()
          .limit(size)
          .skip(page * size)
          .sort("-publishDate")
      : await Post.find({ status: statusPost })
          .limit(size)
          .skip(page * size)
          .sort("-publishDate");

  let pb = new PageBuilder(post, size, totalElement, page);

  post
    ? res.send(pb.renderData)
    : res.status(500).send({ error: "Opps.. Something Went Wrong!" });
});

router.get("/category/:cat", [auth, isAdmin], async (req, res) => {
  let statusPost = req.query.status ? req.query.status : "";
  let size = req.query.size ? parseInt(req.query.size) : 10;
  let page = req.query.page ? parseInt(req.query.page) : 0;
  let totalElement = 0;

  statusPost === ""
    ? (totalElement = await Post.countDocuments({
        categories: { postCategory: req.params.cat }
      }))
    : (totalElement = await Post.countDocuments({
        status: statusPost,
        categories: { postCategory: req.params.cat }
      }));

  let post =
    statusPost === ""
      ? await Post.find({ categories: { postCategory: req.params.cat } })
          .limit(size)
          .skip(size * page)
          .sort("-publishDate")
      : await Post.find({
          status: statusPost,
          categories: { postCategory: req.params.cat }
        })
          .limit(size)
          .skip(size * page)
          .sort("-publishDate");

  const pb = new PageBuilder(post, size, totalElement, page);

  res.send(pb.renderData);
});

/*
 **GET Find Post By Id || Expose For Public,
 **no sensitive data should be there
 **/
router.get("/:id", [validateId], async (req, res) => {
  Post.findOne({ _id: req.params.id, status: "PUBLISHED" })
    .then(post => {
      if (post) {
        return res.send({ data: post });
      } else {
        return res.status(404).send({ error: "Post Not Found" });
      }
    })
    .catch(err => {
      return res.status(404).send({ error: err });
    });
});

/*
 * PUT update post || {Owner Of This Post} is required
 * */
router.put("/:id", [validateId, auth, policyUpdate], async (req, res) => {
  const body = req.body;
  const { error } = validate(body);
  if (error) return res.status(400).send({ error: error.details[0].message });
  let post = await Post.findById(req.params.id);

  /*Initialize new value to existing post*/
  post.title = body.title;
  post.cover = body.cover;
  post.content = body.content;
  post.status = body.status;
  post.categories = body.categories;

  post.save();
  if (!post)
    return res.status(500).send({ error: "Opps.. Something Went Wrong" });
  return res.send(post);
});

/*
 * DELETE post by id || {Owner || Role:ADMIN} is required
 * */
router.delete("/:id", [validateId, auth, policyDelete], async (req, res) => {
  Post.findByIdAndDelete(req.params.id)
    .then(() => {
      return res.send({ message: "Post Deleted." });
    })
    .catch(err => res.status(500).send(err));
});

module.exports = router;
