const { Router } = require('express');
const commentRouter = Router({ mergeParams: true });
const { Comment, Blog, User } = require('../models');
const { isValidObjectId, startSession } = require('mongoose');


commentRouter.post('/', async (req, res) => {
    const session = await startSession;
    let comment;
    try {
        await session.withTransaction(async () => {
            const { blogId } = req.params;
            if (!isValidObjectId(blogId)) return res.status(400).send({ err: 'Invalid blogId' });

            const { content, userId } = req.body;
            if (!isValidObjectId(userId)) return res.status(400).send({ err: 'Invalid userId' });
            if (!content) return res.status(400).send({ err: 'content is required' });


            const [blog, user] = await Promise.all([
            Blog.findById(blogId, {}, { session }),
            User.findById(userId, {}, { session }),
            ]);
            if (!blog || !user) return res.status(400).send({ err: 'Either one of blog and user is required' });

            if (!blog.islive) return res.status(400).send({ err: 'this post has not been posted' });
            comment = new Comment({ content, user, userFullName: `${user.name.first} ${user.name.last}`, blog: blogId });
            // await Promise.all([
            //     comment.save(),
            //     Blog.updateOne({ _id: blogId }, { $push: { comments: comment } })
            //     ]);
            blog.commentCount++;
            blog.comments.push(comment);
            if (blog.commentCount > 3) return blog.comments.shift();
            await Promise.all([comment.save({ session }), blog.save()
        // Blog.updateOne({ _id: blogId }, { $inc: { commentCount: 1 } })
            ])
        })
        return res.send({ comment });
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err: err.message });
    }
    finally {
        await session.endSession();
    }
});

commentRouter.get('/', async (req, res) => {
    try {
        let { page = 0 } = req.query;
        page = parseInt(page);
        const { blogId } = req.params;
        if (!isValidObjectId(blogId)) return res.status(400).send({ err: 'Invalid blogId' });

        const comments = await Comment.find({ blog: blogId }).sort({ createdAt: -1 }).skip(page * 3).limit(3);
        return res.send({ comments });
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err: err.message });
    }
});

commentRouter.patch('/:commentId', async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    if (typeof content !== 'string') return res.status(400).send({ err: 'content is required' });

    const [comment] = await Promise.all([
        Comment.findOneAndUpdate({ _id: commentId }, { content }, { new: true }),
        Blog.updateOne({ 'comments._id': commentId }, { 'comments.$.content': content })
        ])
});

commentRouter.delete('/:commentId', async (req, res) => {
    const { commentId } = req.params;
    const comment = await Comment.findOneAndDelete({ _id: commentId });
    await Blog.updateOne({ 'comments._id': commentId }, { $pull: { comments: { _id: commentId } } });
    return res.send({ comment });
})

module.exports = { commentRouter };
