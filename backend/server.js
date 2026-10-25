const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.get("/",(req,res)=>{
      res.send("stock low API is working")    
});

app.listen(PORT,()=>{
    console.log(`Seever is running on ${PORT}`)      
})