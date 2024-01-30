export const baseURL = "http://localhost:8000/api/v1" 

// auth
export const loginURL =`${baseURL}/auth/login-user`
export const checkLoggedInStatusUrl = `${baseURL}/auth/login-status`
export const loggoutUrl = `${baseURL}/auth/logout`


export const getConversationURL = `${baseURL}/chat`
export const getUserDetailsURL = `${baseURL}/get-user-details`
export const getMessagesURL = `${baseURL}/message`
export const addNewMessageURL = `${baseURL}/message`

export const sendImageURL = `${baseURL}/message`