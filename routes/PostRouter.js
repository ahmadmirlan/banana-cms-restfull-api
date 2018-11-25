const { Post, validate } = require("../model/PostModel");
const _ = require("lodash");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { User } = require("../model/UserModel");
const PageBuilder = require("../library/PageBuilder");

/*POST create new Post | (Role: Auth) is required*/
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

  /***********************Validate Author****************************/
  const author = await User.findById(req.user._id).select("name");
  console.log(author);
  /*******************************************************************/
  post["publishDate"] = Date.now();
  post["author"] = author;
  post
    .save()
    .then(post => res.send(post))
    .catch(error => res.status(400).send({ error: error }));
});

router.get("/", async (req, res) => {
  let size = req.query.size ? parseInt(req.query.size) : 10;
  let page = req.query.page ? parseInt(req.query.page) : 0;
  let totalElement = await Post.countDocuments();
  Post.find({ status: "PUBLISHED" })
    .limit(size)
    .skip(page * size)
    .then(post => {
      const pb = new PageBuilder(post, size, totalElement, page);
      res.send(pb.renderData);
    })
    .catch(error => res.status(500).send({ error: error }));
});

module.exports = router;
