const { Router } = require('express');
const userRoute = Router();
const mongoose = require('mongoose');
const { User } = require('../models/User');

userRoute.get('/', async (req, res) => {
    try {
        const users = await User.find({});
        return res.send({ users });

    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err: err.message });

    }
})

userRoute.post('/', async (req, res) => {
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


userRoute.get('/:id', async (req, res) => {
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


userRoute.delete('/:id', async (req, res) => {
    try {
        let { id } = req.params;
        if (!id) return res.status(400).send({ err: 'id is required' });
        if (!mongoose.isValidObjectId(id)) return res.status(400).send({ err: 'Invalid UserId' });

        const user = await User.findOneAndDelete({ _id: id });
        return res.send({ user });

    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err: err.message });
    }
})

userRoute.put('/:id', async (req, res) => {
    try {
        let { id } = req.params;
        if (!id) return res.status(400).send({ err: 'id is required' });
        if (!mongoose.isValidObjectId(id)) return res.status(400).send({ err: 'Invalid UserId' });

        let { age, name } = req.body;
        if (!age && !name) return res.status(400).send({ err: 'Either one of age or name is required' });
        if (isNaN(age)) return res.status(400).send({ err: 'age should be a Number' });

        let updateBody = {};
        if (age) updateBody.age = age;
        if (name) updateBody.name = name;

        const user = await User.findByIdAndUpdate(id, updateBody, { new: true });
        
        {/*
        
        또 다른 방법 -> DB를 두 번 왔다갔다하지만, 인스턴스 구조가 복잡하거나, 세부적으로 수정사항이 있을 경우 사용.
        
        const user = await User.findById(id);
        if (age) user.age = age;
        if (name) user.name = name;
        
        await user.save();
        
        */}
        return res.send({ user });
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err: err.message });
    }
})


module.exports = userRoute;