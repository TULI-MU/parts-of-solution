const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion,ObjectId} = require('mongodb'); 
const app = express();
const port = process.env.PORT || 5000;


// const corsConfig = {
//   origin: true,
//   credentials: true,
// };
// app.use(cors(corsConfig));
// app.options("*", cors(corsConfig));

app.use(express.json())
app.use(cors());
/* app.use(
  cors({
    origin: true,
    optionsSuccessStatus: 200,
    credentials: true,
  })
); */
// app.use((req, res, next) => {
//   res.header({"Access-Control-Allow-Origin": "*"});
//   next();
// })

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ixstg.mongodb.net/?retryWrites=true&w=majority`;
const uri2 = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.ixstg.mongodb.net:27017,cluster0-shard-00-01.ixstg.mongodb.net:27017,cluster0-shard-00-02.ixstg.mongodb.net:27017/?ssl=true&replicaSet=atlas-bobdnl-shard-0&authSource=admin&retryWrites=true&w=majority`;

const client = new MongoClient(uri2, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'UnAuthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' })
    }
    req.decoded = decoded;
    next();
  });
}

async function run(){
try{
await client.connect();
const toolsCollection = client.db('parts_of_solution').collection('tools');
const userCollection = client.db('parts_of_solution').collection('users');
const ordersCollection = client.db('parts_of_solution').collection('orders');
// const userCollection = client.db('parts_of_solution').collection('users');
// const userCollection = client.db('parts_of_solution').collection('users');




  app.get("/tool", async (req, res) => {
    const query = {};
    const cursor = toolsCollection.find(query);
    const tools = await cursor.toArray();
    res.send(tools);
  });

  app.get('/user', verifyJWT, async (req, res) => {
    const users = await userCollection.find().toArray();
    res.send(users);
  });
  // singleItem by id

  app.get("/tool/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const tool = await toolsCollection.findOne(query);
      res.send(tool);
    });
    app.get("/orders", async (req, res) => {
      const orders = await ordersCollection.find().toArray();
      res.send(orders);
    });


    app.post("/orders", async (req, res) => {
      const orders = req.body;
      console.log(orders);
      const result = await ordersCollection.insertOne(orders);
      res.send(result);
    });
  

  app.put('/user/:email', async (req, res) => {
    const email = req.params.email;
    const user = req.body;
    const filter = { email: email };
    const options = { upsert: true };
    const updateDoc = {
      $set: user,
    };
    const result = await userCollection.updateOne(filter, updateDoc, options);
    const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
    res.send({ result, token });
  });

console.log('Database Connected');
}


finally{
}
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello from Parts Of Solution!')
})
app.get('/', (req, res) => {
  res.send('Hello from Dhaka!')
})

app.listen(port, () => {
  console.log(` Solution is listening on port ${port}`)
})