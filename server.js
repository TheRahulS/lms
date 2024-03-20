const express= require('express');
const app= express();

const session = require('express-session');

const UserRoute = require('./Routes/userRoute')
const db = require('./dbconfig/db_Setting');
const PORT=4000
app.use(session({
    secret: '98765678yhgfghg',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Adjust options as needed
}));
app.use(express.json())
app.use('/api/v1',UserRoute)

app.listen(PORT,()=>{
    console.log(`the port is running on port no ${PORT}`)
})
