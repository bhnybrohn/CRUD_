const express = require("express")
const app = express()
const joi = require("joi")
const mongoose = require("mongoose")
const morgan  = require("morgan")
const Model = require('./model')

 const connectDB = async()=>{

     await mongoose.connect('mongodb://localhost/my_database', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    },()=>{
        console.log('Connected To Databaase ')
    });
 }
 connectDB()


app.use(morgan("dev"));
app.use(express.json()); // body request parser
app.use(express.urlencoded({ extended: true }))

const validation = (data) => {
    const SignupSchema = Joi.object({
      email: Joi.string().min(6).required().email(),
      name: Joi.string().required(),
      phone: Joi.string().min(6).required()
    });
    return SignupSchema.validate(data);
  };


app.post('/createuser',async(req,res)=>{
    const {email,name,phone} = req.body

    const { error } = validation(req.body);
    if (error)
      return res.status(422).send({
        status: false,
        msg: error.details[0].message,

      });
    try {
        const findUser = await Model.findOne({ email: email})
        if(findUser)res.status(402).send({
            status:false,
            msg:"User already exist"
        })
        if(!findUser){
            const newuser = new Model({
                email:email,
                name:name,
                phone:phone
            })
            if(newuser)res.status(201).send({
                status:true,
                msg:"New user created"
            })
        }
    } catch (error) {
        res.status(500).send({msg:error.message}) 
    }
})

app.get('/getalluser',async(req,res) => {
    
    try {
        const getalluser = await Model.find({})
        if(getalluser)res.status(200).send({
            status:true,
            msg:"User fetched succesfully",
            data:getalluser})
    } catch (error) {
        res.status(500).send({msg:error.message}) 
    }
})


app.get('/getalluser/:id',async(req,res) => {
    const {id} = req.params
    
    try {
        const getalluser = await Model.findOne({_id:id})
        if(getalluser)res.status(200).send({
            status:true,
            msg:"User fetched succesfully",
            data:getalluser})
    } catch (error) {
        res.status(500).send({msg:error.message}) 
    }
})

app.post('/edituser/:id',async(req,res) => {
    const {id} = req.params
    const {email,name,phone} = req.body
    
    try {
        const findUser = await Model.findOne({_id:id})

        const getalluser = await Model.findOneAndUpdate({_id:id},{$set:{
            email:email || findUser.email,
            phone:phone || findUser.phone,
            name:name || findUser.name
        }})
        
        if(getalluser)res.status(200).send({
            status:true,
            msg:"User detail edited succesfully",
           })
    } catch (error) {
        res.status(500).send({msg:error.message}) 
    }
})

app.delete('/delete/:id',async(req,res)=>{
    const {id} = req.params

    try {
        const deleteUser = await Model.findOneAndDelete({_id:id})
        if(deleteUser) res.status(200).send({
            status:true,
            msg:"User deleted succesfully"
        })
        
    } catch (error) {
        res.status(500).send({msg:error.message}) 
    }
})



const Port = process.env.PORT || 8090

app.listen(Port,()=>{
 console.log("Sample crud listening")
})
