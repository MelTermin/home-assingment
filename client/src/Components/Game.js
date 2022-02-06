import React,{useEffect,useState} from 'react';
import io from "socket.io-client";
import {useHistory} from "react-router-dom"
import queryString from "query-string";
import GameOver from './GameOver';


const socket = io.connect("http://localhost:5002");



function Game({location}) {

  
  const {word:queryWord} = queryString.parse(location.search);
  console.log(queryWord,"query")
 
  const[image,setImage]=useState("")
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [word,setWord]=useState(queryWord || "" )
  const [isFinished,setIsFinished]=useState(false);
  

  const history=useHistory();



     useEffect(() => {
      
    //adding event listerners with socket.on, useEffect create event listeners
    socket.on("picture",setImage)
    
    return ()=> {
      //remove event listeners when components remounts I will not have more than one
      //specifiying the function name is setImage1 and event is picture//
      socket.off("picture", setImage)
    
    }
   
    }, []);



    useEffect(() => {
      socket.on("word", (word)=>{
      console.log(word)
      setWord(word)
      })
    }, []);
    
    useEffect(() => {
      socket.on("welcome", (message) => {
        setMessageList((list) => [...list, message]);
      });
    }, []);

  
    useEffect(() => {
      socket.on("message", (message) => {
        setMessageList((list) => [...list, message]);
      });
    }, []);

  

    const submitHandler= (e) => {
      e.preventDefault();
      socket.emit("message",currentMessage)
      setCurrentMessage("")

      
      if(currentMessage===word || currentMessage===queryWord) {
          history.push("/gameover")
           setIsFinished(true) 
      } 

    }

    const homePage =()=>{
      history.push("/")
    }



  return <div className='game-container'>
            
            {!image ? (
              <div className='waiting-container'>
                <p className='waiting-text'>Waiting for drawer to send the picture</p>
                <p className='waiting-text'>Thank you for your patience</p>
                <div className='loader'></div>
              </div>):( 
                   <>
                {!isFinished ? (                <div className='game-views' >
                  <div className='image-container'>
                    <div className='title'>   
                       <h2>Here is Drawer's Picture</h2>
                    </div>
                    <img alt="" src={image}></img>
                  </div>
                  
                  <div className="chatContainer">
                    <h2>ChatBox</h2>
                    <div className="chat">
                        {messageList.map((msg, i) => (
                          <li key={i}> {msg}</li>
                        ))}
                    </div>
                    <form className='form-wrapper'  onSubmit={submitHandler}>
                     
                      <input className='chatbox-input' placeholder='Please type your guesses in capital letters' autoComplete="off" type="text" value={currentMessage} onChange={(event) => {
                      setCurrentMessage(event.target.value); }}/>
                      <button className='btn-guess' >Send</button>
                      <button onClick={homePage} className='btn-guess' >Go to home Page</button>
                     
                    </form>
                  </div>
              </div>  ) :(<GameOver></GameOver>)}  
       
 
              </> )}

           

        </div>;
}

export default Game;