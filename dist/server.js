"use strict";
// Note: I'm learning javascript so the comments aren't AI!!
// It just means I'm trying to understand everything!!
// Normally I dont care about making comments otherwise
Object.defineProperty(exports, "__esModule", { value: true });
const PORT = process.env.PORT || 3000; // This will mean if in a server, use its port, and if it can't find anyting, use default port 3000
const express = require('express'); // Get the Express.js package
const app = express(); // Create a new express app instance
const http = require('http'); // Get the HTTP package
const server = http.createServer(app); // Create an HTTP server using the new express app as its handler
const { Server } = require("socket.io"); // Get the Socket.IO package
const io = new Server(server, process.env.NODE_ENV !== 'production' ? { cors: {
        origin: "http://localhost:5173"
    }
} : { cors: {} }); // Create a new Socket.IO instance using the created HTTP server
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.emit('get user id', getRandomInt(100000)); // TODO: login flow. this is temp
    socket.on('message sent', (msg) => {
        console.log("message sent");
        io.emit('client receive message', msg); // Emit it to everyone else!
    });
    socket.on('disconnect', (reason) => {
        console.log(`User disconnected because: ${reason}`);
    });
});
server.listen(PORT, () => {
    console.log('listening on *:3000');
});
