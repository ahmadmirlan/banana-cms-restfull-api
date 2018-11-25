/* All Route Is Called From Here Through Rest API  */

/* Import The Route Model */
const express = require('express');
const homeRouter = require('./HomeRouter');
const authRouter = require('./AuthRouter');
const userRouter = require('./UsersRouter');
const postCategoryRouter = require('./PostCategoryRouter');
const postRouter = require('./PostRouter');
const docRouter = require('./DocRouter');

/* Declare The Route, Make Accessible From Rest API*/
module.exports = (app) => {
    app.use(express.json());
    app.use('/', homeRouter);
    app.use('/api/doc', docRouter);
    app.use('/api/auth/', authRouter);
    app.use('/api/users', userRouter);
    app.use('/api/postcategories', postCategoryRouter);
    app.use('/api/posts', postRouter);
};