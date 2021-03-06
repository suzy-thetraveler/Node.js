const { Router } = require('express');
const userRouter = Router();
const mongoose = require('mongoose');
const { User, Blog, Comment } = require('../models');

userRouter.get('/', async (req, res) => {
    try {
        let { page } = req.query;
        page = parseInt(page);
        const users = await User.find({}).sort({ updatedAt: -1 }).skip(page * 3).limit(200);;
        return res.send({ users });

    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err: err.message });

    }
})

userRouter.post('/', async (req, res) => {
    try {
        let { username, name } = req.body;
        if (!username) return res.status(400).send({ err: "username required" });
        if (!name || !name.first || !name.last) return res.status(400).send({ err: "full name required!" });

        const user = new User(req.body);
        await user.save();
        return res.send({ user });
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err: err.message });
    }

});

userRouter.get('/:id', async (req, res) => {
    try {
        let { id } = req.params;
        if (!id) return res.status(400).send({ err: 'id is required' });
        if (!mongoose.isValidObjectId(id)) return res.status(400).send({ err: 'Invalid UserId' });

        const user = await User.findOne({ _id: id });
        return res.send({ user });

    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err: err.message });
    }
})

userRouter.delete('/:id', async (req, res) => {
    try {
        let { id } = req.params;
        if (!id) return res.status(400).send({ err: 'id is required' });
        if (!mongoose.isValidObjectId(id)) return res.status(400).send({ err: 'Invalid UserId' });

        const [user] = await Promise.all([
            User.findOneAndDelete({ _id: id }),
            Blog.deleteMany({ 'user._id': id }),
            Blog.updateMany({ 'comments.user': id }, { $pull: { comments: { user: id } } }),
            Comment.deleteMany({ user: id }),
            ]);

        return res.send({ user });

    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err: err.message });
    }
})

userRouter.put('/:id', async (req, res) => {
    try {
        let { id } = req.params;
        if (!id) return res.status(400).send({ err: 'id is required' });
        if (!mongoose.isValidObjectId(id)) return res.status(400).send({ err: 'Invalid UserId' });

        let { age, name } = req.body;
        if (!age && !name) return res.status(400).send({ err: 'Either one of age or name is required' });
        if (isNaN(age)) return res.status(400).send({ err: 'age should be a Number' });

        let updateBody = {};
        if (age) updateBody.age = age;
        if (name) {
            updateBody.name = name;
            await Blog.updateMany({ 'user._id': id }, { 'user.name': name });
            await Blog.updateMany({}, { 'comments.$[comment].userFullName': `${name.first} ${name.last}` }, {
                arrayFilters: [{ 'comment.user': id }]
            });
        }

        const user = await User.findByIdAndUpdate(id, updateBody, { new: true });

        {
            /*
                    
                    ??? ?????? ?????? -> DB??? ??? ??? ?????????????????????, ???????????? ????????? ???????????????, ??????????????? ??????????????? ?????? ?????? ??????.
                    
                    const user = await User.findById(id);
                    if (age) user.age = age;
                    if (name) user.name = name;
                    
                    await user.save();
                    
                    */
        }
        return res.send({ user });
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err: err.message });
    }
})


module.exports = { userRouter };
