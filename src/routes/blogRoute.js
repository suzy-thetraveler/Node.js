const { Router } = require('express');
const blogRouter = Router();
const { commentRouter } = require('./commentRoute')
const mongoose = require('mongoose');
const { Blog, User } = require('../models');





// 하위 comment Route 
blogRouter.use('/:blogId/comment', commentRouter);

// blog post 생성
blogRouter.post('/', async (req, res) => {
    try {
        const { title, content, islive, userId } = req.body;
        if (!title) return res.status(400).send({ err: 'Title is required' });
        if (!content) return res.status(400).send({ err: 'Content is required' });
        if (typeof islive !== 'boolean') return res.status(400).send({ err: 'islive must be a boolean type' });
        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ err: 'Invalid userId' });

        let user = await User.findById(userId);
        if (!user) return res.status(400).send({ err: 'user does not exist' });

        let blog = new Blog({ ...req.body, user });
        await blog.save();
        return res.send({ blog });
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err: err.message });
    }
});

// blog 게시글 불러오기
blogRouter.get('/', async (req, res) => {
    try {
        let blogs = await Blog.find({}).limit(200);
        // .populate([
        //     {path: 'user'}, 
        //     {path: 'comments', 
        //     populate: {path: 'user'}}]);
        
        return res.send({ blogs });
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err: err.message });
    }
});

// blog 특정 게시글 조회
blogRouter.get('/:blogId', async (req, res) => {
    try {
        const { blogId } = req.params;
        if (!blogId) return res.status(400).send({ err: 'blogId is required' });
        if (!mongoose.isValidObjectId(blogId)) return res.status(400).send({ err: 'Invalid BlogId' });

        const blog = await Blog.findById(blogId);
        return res.send({ blog });

    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err: err.message });
    }
});

// blog 특정 게시글 수정
blogRouter.put('/:blogId', async (req, res) => {
    try {
        const { blogId } = req.params;
        if (!blogId) return res.status(400).send({ err: 'blogId is required' });
        if (!mongoose.isValidObjectId(blogId)) return res.status(400).send({ err: 'Invalid BlogId' });

        const { title, content } = req.body;
        if (!title && !content) return res.status(400).send({ err: 'Either one of the elements is required!' })

        let updateBody = {};
        if (title) updateBody.title = title;
        if (content) updateBody.content = content;

        const blog = await Blog.findOneAndUpdate(blogId, updateBody, { new: true });
        return res.send({ blog });


    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err: err.message });
    }
});

// blog 특정 항목 수정
blogRouter.patch('/:blogId/live', async (req, res) => {
    try {
        const { blogId } = req.params;
        if (!blogId) return res.status(400).send({ err: 'blogId is required' });
        if (!mongoose.isValidObjectId(blogId)) return res.status(400).send({ err: 'Invalid BlogId' });

        const { islive } = req.body;
        if (typeof islive !== 'boolean') return res.status(400).send({ err: 'islive is required!' })


        const blog = await Blog.findOneAndUpdate(blogId, { islive }, { new: true });
        return res.send({ blog });

    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err: err.message });
    }
});


module.exports = { blogRouter };
