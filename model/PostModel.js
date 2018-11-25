const PostCategory = require("./PostCategoryModel");

const mongoose = require("mongoose");
const Joi = require("joi");
//Convert _id to id
mongoose.plugin(require("meanie-mongoose-to-json"));

const Post = mongoose.model(
  "Post",
  new mongoose.Schema({
    title: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 50
    },
    cover: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 255
    },
    content: {
      type: String,
      required: true,
      maxlength: 500
    },
    status: {
      type: String,
      enum: ["PUBLISHED", "DRAFT"],
      required: true
    },
    publishDate: {
      type: Date,
      required: true
    },
    author: {
      type: {},
      required: true
    },
    categories: [
      {
        type: mongoose.Schema({
          _id: false,
          postCategory: {
            type: String,
            maxlength: 50,
            minlength: 2,
            required: true
          }
        })
      }
    ]
  })
);

function validateSchema(post) {
  const schema = {
    title: Joi.string()
      .min(2)
      .required(),
    cover: Joi.string()
      .min(5)
      .required(),
    content: Joi.string()
      .min(50)
      .required(),
    status: Joi.string()
      .valid(["PUBLISHED", "DRAFT"])
      .required(),
    categories: Joi.array()
      .items(
        Joi.object().keys({
          postCategory: Joi.string().required()
        })
      )
      .required()
  };
  return Joi.validate(post, schema);
}

// exports.postSchema = postSchema;
exports.Post = Post;
exports.validate = validateSchema;
