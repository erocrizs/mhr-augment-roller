const express = require('express');
const app = express();
const router = require('./router');

app.use('/api', router);

app.listen(5000, () => {
    console.log("Server started at port 5000");
});
