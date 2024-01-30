import React, { useEffect, useState } from 'react'
import axios from "axios"
import { getUserDetailsURL } from '../../api';
import {headers} from "../../utils/Header"

const Message = ({chat,currentUser,isActive}) => {
    
    
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


  
  return !user? <h5>Loading conversation</h5> :  (
    <div className={`flex items-center mb-2 ${isActive ? 'active' : ''}`}>
    <img src={user.avatar} className="rounded-full mr-2 h-8 w-8" alt="avatar" />
    <span className="text-xs text-gray-700">{user.username}</span>
  </div>
  )
}

export default Message