import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
    autoConnect: false,
});

export const connectSocket = () => {
    const token = localStorage.getItem("token");

    socket.auth = {
        token,
    };

    socket.connect();
};

export default socket;
