const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 3000;
const app = express()
require('dotenv').config()

//middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.xweyicz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Blogs collections
        const blogCollection = client.db('DevNookDB').collection('blogs')
        const wishlistCollection = client.db('DevNookDB').collection('wishlist')
        const commentCollection = client.db('DevNookDB').collection('comments')
        //Blogs collection
        await blogCollection.createIndex({ title: 'text', short_description: 'text' })
        app.post('/blogs', async (req, res) => {
            const blogs = req.body;
            const result = await blogCollection.insertOne(blogs)
            res.send(result)
        })
        app.get('/blogs', async (req, res) => {
            const cursor = blogCollection.find().sort({ _id: -1 })
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/blogs/:id',async(req,res)=>{
            const id = req.params;
            const query = {_id: new ObjectId(id)}
            const result = await blogCollection.findOne(query)
            res.send(result)
        })
        app.patch('/blogs/:id', async(req,res)=>{
            const id = req.params
            const blog = req.body
            filter = {_id:new ObjectId(id)}
            const updateDoc = {
                $set:{
                    title:blog.title,
                    image:blog.image, 
                    category:blog.category, 
                    short_description:blog.short_description, 
                    long_description:blog.long_description
                }
            }
            const result = await blogCollection.updateOne(filter,updateDoc)
            res.send(result)
        })

        app.get('/search', async (req, res) => {
            const text = req.query.text;
            const cursor = blogCollection.find({ $text: { $search: text } })
            const result = await cursor.toArray()
            res.send(result)
        })

        //comment collection 
        app.post('/comments', async(req,res)=>{
            const comment = req.body;
            const result = await commentCollection.insertOne(comment)
            res.send(result)
        })

        app.get('/comments', async(req,res)=>{
            const query = {id:req.query.id}
            const cursor = commentCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })


        //wishlist collection
        app.post('/wishlist', async (req, res) => {
            const wishlistBlogs = req.body;
            const result = await wishlistCollection.insertOne(wishlistBlogs)
            res.send(result)
        })

        app.get('/wishlist', async (req, res) => {
            let query = {}
            if (req.query?.email) {
                query = { user_email: req.query.email }
            }
            const cursor = wishlistCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.delete('/wishlist/:id', async(req,res)=>{
            const id = req.params;
            const filter = {_id: new ObjectId(id)}
            const result = await wishlistCollection.deleteOne(filter)
            res.send(result)
        })


        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Dev Nook Server Is Running')
})
app.listen(port, () => {
    console.log('Dev Nook Server Running on:', port);
})