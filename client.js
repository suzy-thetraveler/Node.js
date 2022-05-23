console.log('client code running');
const axios = require('axios'); //rest API 사용시 자주 사용하는 middleware

const URI = 'http://15.165.99.93:3000'

const test = async () => {
    try {
        console.time("loading time: ");
         await axios.get(`${URI}/blog`);
        
        console.timeEnd("loading time: ");
    }
    catch (err) {
        console.log(err);
    }
};

const testGroup = async () => {
    await test();
    await test();
    await test();
    await test();
    await test();
    await test();
}

testGroup();
/*
                blogs = await Promise.all(
                    blogs.map(async (blog) => {
                        const [res_user, res_comment] = await Promise.all([
                            axios.get(`${URI}/user/${blog.user}`), 
                            axios.get(`${URI}/blog/${blog._id}/comment`)
                            ]);
                        blog.user = res_user.data.user;
                        blog.comments = await Promise.all(
                            res_comment.data.comments.map(async comment => {
                            const { 
                                data: { user } 
                            } = await axios.get(`${URI}/user/${comment.user}`);
                            
                            comment.user = user;
                            return comment;
                        }));
                        return blog;
                    })
                );
                
                */
        // console.dir(blogs[0], {depth: 10});