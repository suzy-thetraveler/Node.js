const { Router } = require('express');
const commentRouter = Router({ mergeParams: true });
const { Comment, Blog, User } = require('../models');
const { isValidObjectId } = require('mongoose');


commentRouter.post('/', async (req, res) => {
    try {
        const { blogId } = req.params;
        if (!isValidObjectId(blogId)) return res.status(400).send({ err: 'Invalid blogId' });

        const { content, userId } = req.body;
        if (!isValidObjectId(userId)) return res.status(400).send({ err: 'Invalid userId' });
        if (!content) return res.status(400).send({ err: 'content is required' });

        const [blog, user] = await Promise.all([
            Blog.findById(blogId),
            User.findById(userId),
            ]);
        if (!blog || !user) return res.status(400).send({ err: 'Either one of blog and user is required' });

        if (!blog.islive) return res.status(400).send({ err: 'this post has not been posted' });
        const comment = new Comment({ content, user, blog });
        await comment.save();
        return res.send({ comment });
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err: err.message });
    }
});

commentRouter.get('/', async (req, res) => {
    try {
        const { blogId } = req.params;
        if (!isValidObjectId(blogId)) return res.status(400).send({ err: 'Invalid blogId' });

        const comments = await Comment.find({ blog: blogId });
        return res.send({ comments });
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err: err.message });
    }
})

module.exports = { commentRouter };
