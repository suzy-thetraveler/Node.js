const express = require('express');
const app = express();
const mongoose = require('mongoose');
const { userRouter } = require('./routes/userRoute');
const { blogRouter } = require('./routes/blogRoute');

const MONGO_URI = 'mongodb://devUser:mobius1234@docdb-onem2mcore-dev-konai.cluster-cj1svc98utto.ap-northeast-2.docdb.amazonaws.com/sjlee_test?retryWrites=true&w=majority'



const server = async () => {

    try {

        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDB connected');

        app.use(express.json());
        
        app.use('/user', userRouter);
        app.use('/blog', blogRouter);

        app.listen(3000, () => console.log('server listening on port 3000!'))

    }
    catch (err) {
        console.log(err);
    }



}

server();
