// server.js (or index.js)

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Timestamp } = require('mongodb');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());


// Define a schema for your package
const orderSchema = new mongoose.Schema({

    eventid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "events",
    },
    name: {
        type: String
    },
    address: {
        type: String
    },
    phone: {
        type: Number
    },
    quantity: {
        type: Number
    },
    
    date: {
        type: Date
    },
    time: {
        
    },
    status:{
        type:String
    },

});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order