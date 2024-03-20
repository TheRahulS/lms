const express = require('express');
const UserRoute = express.Router(); 
const {CreateUser,getAllUser,loginUser,SingleUser,otpSend,verifyOtp} = require('../Controller/userController')
const verifyToken =require('../Utils/auth')
UserRoute.post('/user',CreateUser);
UserRoute.get('/user',getAllUser)
UserRoute.post('/login',loginUser)
UserRoute.get('/:id',SingleUser)
UserRoute.post('/sendotp',otpSend)
UserRoute.post('/verifyotp',verifyOtp)
module.exports=UserRoute;

