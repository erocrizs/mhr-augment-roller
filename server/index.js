require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const router = require('./router');

app.use(cors({
    origin: process.env.FRONTEND_DOMAIN,
    optionsSuccessStatus: 200
}));
app.use('/api', router);

app.listen(5000, () => {
    console.log("Server started at port 5000");
});
