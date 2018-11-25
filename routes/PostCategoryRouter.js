const { PostCategory, validate } = require("../model/PostCategoryModel");
const _ = require("lodash");
const express = require("express");
const router = express.Router();
const validateId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");
const isCM = require("../middleware/contentManagement");
const PageBuilder = require("../library/PageBuilder");

/*POST create new Post Category | (Role: ADMIN|CM) is required*/
router.post("/", [auth, isCM], async (req, res) => {
  const { error } = validate(req.body);
  /* If error spotted, return this*/
  if (error) return res.status(400).send({error: `${error.details[0].message}`});

  let postCategory = new PostCategory(_.pick(req.body, ["postCategory"]));
  postCategory
    .save()
    .then(postCat => {
      return res.send(postCat);
    })
    .catch(error => {
      if (error.code === 11000)
        return res
          .status(400)
          .send({ error: `${req.body.postCategory} Already Used` });
      else
        return res.status(400).send({ error: "Opps.. Something Went Wrong" });
    });
});

/*Get All Post Category*/
router.get("/", async (req, res) => {
  req.setTimeout(10000);
  let size = req.query.size ? parseInt(req.query.size) : 10;
  let page = req.query.page ? parseInt(req.query.page) : 0;

  let postCategories = await PostCategory.find()
    .limit(size)
    .skip(page * size);
  let totalElements = await PostCategory.countDocuments();

  let pb = new PageBuilder(postCategories, size, totalElements, page);
  res.send(pb.renderData);
});

/*Delete Post Category By Id || (ROLE: ADMIN||CM) is required */
router.delete("/:id", [auth, isCM, validateId], async (req, res) => {
  PostCategory.findById(req.params.id)
    .then(postCategory => {
      postCategory.delete();
      res.send({ message: `Post Category Successfully Deleted` });
    })
    .catch(() => res.status(400).send({ error: "The Given Id Not Found" }));
});

/*Get Post Category By Id*/
router.get("/:id", [validateId], async (req, res) => {
  let postCategory = await PostCategory.findById(req.params.id);
  if (!postCategory) res.status(404).send({ error: "Post Category Not Found" });
  res.send(postCategory);
});

/*PUT update Post Category | {Role: ADMIN|CS} is required*/
router.put("/:id", [auth, isCM, validateId], async (req, res) => {
  const body = req.body;
  const { error } = validate(body);
  if (error) return res.status(400).send({ error: error.details[0].message });
  // Looking for Post Cat By Id -> Not Found Return 404
  let postCategoryById = await PostCategory.findById(req.params.id);
  if (!postCategoryById) res.status(404).send({ message: "Not Found" });

  //Looking Post Cat By postCategory
  let postCatByName = await PostCategory.findOne({
    postCategory: body.postCategory
  });

  // If postCatByName is exist, then execute this line code
  if (postCatByName) {
    // If postCatByName is equal with postCatById then allow save with the same value
    if (JSON.stringify(postCategoryById) === JSON.stringify(postCatByName)) {
      postCatByName
        .save()
        .then(postCat => {
          return res.send(postCat);
        })
        .catch(() => {
          return res
            .status(400)
            .send({ error: "Opps.., Something Went Wrong" });
        });
    } else
      return res.status(400).send({ error: "Post Category Already Exist" });
    /*If postCatByName is exist but the id is different with postCatById return this
     * Because the value is already exist on different object id
     * */
  } else {
    postCategoryById.postCategory = body.postCategory;
    postCategoryById
      .save()
      .then(saveCat => res.send(saveCat))
      .catch(() => {
        return res.status(400).send({ error: "Opps.. Something Went Wrong" });
      });
  }
});

module.exports = router;
