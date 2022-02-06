const express=require('express');
const http = require("http");
const cors = require("cors");
const socketio = require('socket.io');
const path=require("path")
const env=require('dotenv')
env.config();


const app=express();
app.use(cors());
//creating the server
const server = http.createServer(app);
const io = socketio(server);


let players = [];
let gameStarted=false;
let mode=null;
let randomWord;
let image;
let points=0;


//run when a client connects
io.on('connection',(socket)=> {


    socket.on("user",(username,callback) => {
    
    //Taking the user who entered their name and put it in a state in the frontend as well
    //This also helps the define the drawer 
    const user= {name:username, id:socket.id, isAdmin:!gameStarted ,point:points}
    
    // each player is pushed into the players list
    players.push(user);
    
    if(!gameStarted) {
      gameStarted=true
    }
    
    //console.log(players,"players")
    //sending user and players to the frontend
    callback(players,user)
    
    socket.broadcast.emit("welcome", `${username} is the guesser.`)
    

  });



  //setting the mode
  socket.on("mode", (data)=> {
    mode=data
  })

 
  socket.on("word", (word) => {
    io.emit("word", `${word}`);
  });


  socket.on("picture", (data)=> {
    image=data
    socket.broadcast.emit("picture", image)
  })

  
  // send chat messages
  socket.on("message", (message) => {
    io.emit("message", `${message}`);
  });
 
});

app.use(express.static(path.join(__dirname, "/client/build")));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/build', 'index.html'));
});
  

app.listen(process.env.PORT || 5002,()=> {
  console.log(`the server is running on port` + process.env.PORT)
})