import { io } from "socket.io-client"
import store from "./redux/store"
import { logoutUser } from "./redux/actions/user";
import { toast } from "react-toastify";

const socket = io.connect(process.env.REACT_APP_SERVER);

socket.on('connect', () => {
    console.log("connected")
})

socket.on('logout', () => {
    toast.error("Session was closed by telegram")
    store.dispatch(logoutUser(true))
})

export default socket;
