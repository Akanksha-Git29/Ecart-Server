const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
const connectDB = require('./config/db')
const PORT = process.env.PORT || 5000 //process.env checks for environmental prot like in gcloud



app.use(cors()) //will give POST http://localhost:5000/api/users net::ERR_CONNECTION_REFUSED err if not run
app.use(morgan("dev"))
//connecting mongoDB
connectDB()

//defining restApi and middlewares
app.use(express.json({extends:false}))
app.use("/api/users",require("./routes/userApi"))
app.use("/api/products",require("./routes/productsApi"))
app.use("/api/auth",require("./routes/authApi"))
app.use("/api/profile",require("./routes/profileApi"))
app.use("/api/cart",require("./routes/cartApi"))
app.use("/api/payment", require("./routes/paymentApi"))

app.get("/",(req,res)=>{
    res.send("My App Begins")
})

app.listen(PORT,()=>{
    console.log(`server is listenning at port ${PORT}`)
}) //akan123

//mongodb+srv://akan123:<password>@cluster0.kvuno.mongodb.net/myFirstDatabase?retryWrites=true&w=majority