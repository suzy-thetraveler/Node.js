const express = require('express');
const app = express();
const mongoose = require('mongoose');
const { User } = require('./models/User');


const MONGO_URI = 'mongodb://devUser:mobius1234@docdb-onem2mcore-dev-konai.cluster-cj1svc98utto.ap-northeast-2.docdb.amazonaws.com/sjlee_test?retryWrites=true&w=majority'



const server = async () => {

    try {

        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDB connected');

        app.use(express.json());

        app.get('/user', async (req, res) => {
            try {
                const users = await User.find({});
                return res.send({ users });

            }
            catch (err) {
                console.log(err);
                return res.status(500).send({ err: err.message });

            }
        })

        app.post('/user', async (req, res) => {
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


        app.get('/user/:id', async (req, res) => {
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


        app.delete('/user/:id', async (req, res) => {
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

        app.put('/user/:id', async (req, res) => {
            try {
                let { id } = req.params;
                if (!id) return res.status(400).send({ err: 'id is required' });
                if (!mongoose.isValidObjectId(id)) return res.status(400).send({ err: 'Invalid UserId' });

                let { age, name } = req.body;
                if(!age && !name) return res.status(400).send({ err: 'Either one of age or name is required'});
                if (isNaN(age)) return res.status(400).send({ err: 'age should be a Number' });
                
                let updateBody = {};
                if(age) updateBody.age = age;
                if(name) updateBody.name = name;
                
                const user = await User.findByIdAndUpdate(id, updateBody, { new: true });
                return res.send({ user });
            }
            catch (err) {
                console.log(err);
                return res.status(500).send({ err: err.message });
            }
        })

        app.listen(3000, () => console.log('server listening on port 3000!'))

    }
    catch (err) {
        console.log(err);
    }



}

server();
