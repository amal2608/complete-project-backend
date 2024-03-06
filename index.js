const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose")
const multer = require('multer');
const bcrypt = require('bcrypt');


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const loginModel = require("./model/login");
const eventmodel = require("./model/event");
const foodModel = require("./model/food");


const collection = require("./model/user");

const Order = require('./model/Order');
const adminlogin = require("./model/login");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// DB Connection 
mongoose.connect("mongodb+srv://amalbabu2806:123@cluster0.ghwi5ll.mongodb.net/eventmgt?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => { console.log("DB connected") })
    .catch(err => console.log(err));

// API creation
app.get('/', (request, response) => {
    response.send("Hai");
});

// to add new event
app.post('/Eventnew', upload.single('Eventimage'), async (request, response) => {
    try {
        const {Eventid,Eventname, Amount, Description,Eventtype,Status} = request.body;
        // console.log(request.body)
        // console.log(request.file)

        const newevent = new eventmodel({
            Eventid,
            Eventname,
             Amount, 
             Description,
             Eventtype,
             Status,
            Eventimage: {
                data: request.file.buffer,
                contentType: request.file.mimetype,
            }
        });
        await newevent.save();

        response.status(200).json({ message: 'Event  added successfully' });
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});

// Event view
app.get('/eventview', async (request, response) => {
    try {
        // console.log("dfkl")
        var data = await eventmodel.find();
        response.send(data);
    } 
    catch (error) {
        console.error(error);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});


//For update status of event -delete
app.put('/eventupdatestatus/:id',async(request,response)=>{
    let id = request.params.id
    // console.log(id)
    await eventmodel.findByIdAndUpdate(id,{$set:{Status:"INACTIVE"}})
    response.send("Record Deleted")
})

//to edit event
app.put('/Eventedit/:id', upload.single('Eventimage'), async (request, response) => {
   
        try {
            const id = request.params.id;
            const { Eventid,Eventname, Amount, Description,Eventtype,Status } = request.body;
            let updatedData = {
                Eventid,
                Eventname, 
                Amount, 
                Description,
                Eventtype,
                Status
            };
            if (request.file) {
                updatedData.Eventimage = {
                    data: request.file.buffer,
                    contentType: request.file.mimetype,
                };
            }
            const result = await eventmodel.findByIdAndUpdate(id, updatedData);
            if (!result) {
                return response.status(404).json({ message: 'Event not found' });
            }
            response.status(200).json({ message: 'Event updated successfully', data: result });
        } catch (error) {
            console.error(error);
            response.status(500).json({ error: 'Internal Server Error' });
        }
    });



 // Food Items save
 app.post('/foodnew', upload.single('Foodimage'), async (request, response) => {
    try {
        console.log("food")
        const {Foodname,Foodtype,Amount, Description,Eventid,Status } = request.body;
        console.log(request.body)
        const newFoodItem = new foodModel({
            Foodname,
            Foodtype,
            Amount,
             Description,
             Eventid,
             Status,             
             Foodimage:{
                data :  request.file.buffer,
                contentType: request.file.String,    
    }   
        });
        await newFoodItem.save();

        response.status(200).json({ message: 'Food item added successfully' });
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});


// Food view
app.get('/foodview', async (request, response) => {

    const result = await foodModel.aggregate([
      {
        $lookup: {
          from: 'events', // Name of the other collection
          localField: 'Eventid', // field of item
          foreignField: '_id', //field of category
          as: 'food',
        },
      },
    ]);
  
    response.send(result)
  })

// Food Details
app.get('/fooddetails/:id', async (request, response) => {
         // console.log("dfkl")
         const id = request.params.id;
         try
         {
         var data = await foodModel.find({Eventid:id});
        //  console.log(data)
         response.send(data);
        } 
     catch (error) {
         console.error(error);
         response.status(500).json({ error: 'Internal Server Error' });
     }
  })

  //to edit food
app.put('/Foodedit/:id', upload.single('Foodimage'), async (request, response) => {
   
    try {
        const id = request.params.id;
        console.log(request.body)
        console.log(request.file)

        const {Foodname,Foodtype,Amount, Description,Eventid,Status} = request.body;

        let updatedData = {
            Foodname,
            Foodtype,
            Amount,
            Description,
            Eventid,
            Status
        };
        if (request.file)
         {
            updatedData.Foodimage = {
                data: request.file.buffer,
                contentType: request.file.mimetype,
            };
        }
        const result = await foodModel.findByIdAndUpdate(id, updatedData);
        if (!result) {
            return response.status(404).json({ message: 'Food not found' });
        }
        response.status(200).json({ message: 'Food updated successfully', data: result });
    } 
    catch (error) {
        console.error(error);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});

//For update status of food -delete
app.put('/foodupdatestatus/:id',async(request,response)=>{
    let id = request.params.id
    // console.log(id)
    await foodModel.findByIdAndUpdate(id,{$set:{Status:"INACTIVE"}})
    response.send("Record Deleted")
})




//User Side
app.post("/userlogin", async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await collection.findOne({ email: email })
        // console.log(user)
        if (user) {
           
            if (password === user.password) {
                res.json("exist")
            } 
            else {
                res.json("notexist")
            }
        } 
        else 
        {
            res.json("notexist")
        }
       
    }
    catch (e) {
        res.json("fail")
    }

})



app.post("/signup", async (req, res) => {
    const { email, password } = req.body

    const data = {
        email: email,
        password: password
    }

    try {
        const check = await collection.findOne({ email: email })

        if (check) {
            res.json("exist")
        }
        else {
            res.json("notexist")
            await collection.insertMany([data])
        }

    }
    catch (e) {
        res.json("fail")
    }

})


// Assign port
app.listen(4005, () => {
    console.log("Port is running on 4005");
});

//save address

app.post('/cnew', async (request, response) => {
    try {
        new addressdetailsmodel(request.body).save();
        response.send("Record saved Sucessfully")
    }
    catch (error) {
        response.status(500).json({ error: 'Internal Server Error' });
    }
}
)

//address view

app.get('/addressview', async (req, res) => {
    // var data = await Order.find()
    // response.send(data)

    Order.aggregate([
        {
            $lookup: {
                from: "events",
                localField: "eventid",
                foreignField: "_id",
                as: "eventdet"
            }
        },
        // {

        //     $unwind: "$packages",
        // }
    ]).then(response => {
        console.log(response)
        res.status(200).json({ response })
    })

})



// Route to save the order
app.post('/saveOrder', async (req, res) => {
    try {

        console.log(req.body)

        const newOrder = new Order(req.body)

        newOrder.save().then(data => {
            console.log(data)
        })

        res.status(201).json({ message: 'orders saved successfully', });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', error });
    }
});

//adimlogin
app.post("/admlogin", async (req, res) => {
    const { email, password } = req.body

    try {
        const check = await adminlogin.find({ email: email,password:password })

        if (check) {
            res.json("exist")
        }
        else {
            res.json("notexist")
        }

    }
    catch (e) {
        res.json("fail")
    }

})



app.post("/register", async (req, res) => {
    const { email, password } = req.body

    const data = {
        email: email,
        password: password
    }

    try {
        const check = await adminlogin.find({ email:email,password:password })

        if (check) {
            res.json("exist")
        }
        else {
            res.json("notexist")
            await adminlogin.insertMany([data])
        }

    }
    catch (e) {
        res.json("fail")
    }

})

// update  order status
app.put('/orderupdatestatus/:id', async (request, response) => {
    let id = request.params.id
    console.log(request.body)
    await addressdetailsmodel.findByIdAndUpdate(id, { $set: { Status: request.body.status } })
    response.send("Record Updated")
})





