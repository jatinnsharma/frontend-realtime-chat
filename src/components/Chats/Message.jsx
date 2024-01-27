import React, { useEffect, useState } from 'react'
import axios from "axios"
import { getUserDetailsURL } from '../../api';
import {headers} from "../../utils/Header"

const Message = ({chat,currentUser}) => {
    
    
    const [user,setUser] = useState(null);
   

    useEffect(() => {
        const friendId = chat.members.find((m) => m !== currentUser?._id);
        
        const getUser = async () =>{
          const res = await axios.get(`${getUserDetailsURL}/${friendId}`, { headers })
          .then((result) => {
            console.log(result?.data?.response[0]?.user)
            setUser(result?.data?.response[0]?.user);
          })
          .catch((error) => {
            console.log(error);
          })
        }
        getUser()
    }, [currentUser,chat]);


  
  return !user? <h1>Hello world</h1> :  (
    <div className="flex items-center mb-2">
    <img src={user.avatar} className="rounded-full mr-2" height="40" width="40" alt="avatar" />
    <span className="text-lg font-semibold">{user.username}</span>
  </div>
  )
}

export default Message