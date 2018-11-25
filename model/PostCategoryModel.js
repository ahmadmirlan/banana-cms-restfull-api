const mongoose = require('mongoose');
const Joi = require('joi');
//Convert _id to id
mongoose.plugin(require('meanie-mongoose-to-json'));

/* PostCategoryModel Schema */
const postCategorySchema = new mongoose.Schema({
    postCategory: {
        type: String,
        unique: true,
        required: true,
        minlength: 2,
        maxlength: 20
    },
});

const PostCategory = mongoose.model('PostCategory', postCategorySchema);

function validateSchema(postCategory) {
    const schema = {
        postCategory: Joi.string().min(2).required()
    };
    return Joi.validate(postCategory, schema);
}

exports.postCategorySchema = postCategorySchema;
exports.PostCategory = PostCategory;
exports.validate = validateSchema;