const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/admin");
const { User } = require("../model/UserModel");
const PageBuilder = require("../library/PageBuilder");

/* GET all users || (ROLE: Admin) is required. */
router.get("/", [auth, isAdmin], async (req, res) => {
  let size = req.query.size ? parseInt(req.query.size) : 10;
  let page = req.query.page ? parseInt(req.query.page) : 0;
  let totalElements = await User.countDocuments();

  User.find().limit(size).skip(page * size)
    .select("-password")
    .then(users => {
        const pb = new PageBuilder(users, size, totalElements, page);
        res.send(pb.renderData);
    })
    .catch(error => res.status(500).send({ error: error }));
});

router.get("/me", [auth], (req, res) => {
  User.findById(req.user._id)
    .select("-password")
    .then(user => res.send(user))
    .catch(() => res.status(500).send({ error: "Unexpected Error" }));
});

module.exports = router;
