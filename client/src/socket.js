import { io } from "socket.io-client"
import store from "./redux/store"
import { logoutUser } from "./redux/actions/user";
import { addNewSignal, closeNewSignal } from "./redux/actions/signals";
import { toast } from "react-toastify";

const socket = io.connect(process.env.REACT_APP_SERVER);

socket.on('connect', () => {
    console.log("connected")
})

socket.on('logout', () => {
    toast.error("Session was closed by telegram")
    store.dispatch(logoutUser(true))
})

socket.on('newSignal', (signal) => {
    toast.dark(`New ${signal.strategyName} signal, ${signal.position} ${signal.crypto}`)
    if (window.location.pathname === "/signals")
        store.dispatch(addNewSignal(signal))
})

socket.on('closeSignal', (signal) => {
    if (signal.profit > 0)
        toast.success(`${signal.strategyName} signal exit, ${signal.position} ${signal.crypto} | + ${signal.profit}$`)
    else
        toast.warn(`${signal.strategyName} signal exit, ${signal.position} ${signal.crypto} | - ${signal.profit}$`)
    if (window.location.pathname === "/signals")
        store.dispatch(closeNewSignal(signal))
})

socket.on('deleteSignal', (signalId) => {
    console.log(signalId)
})

export default socket;
