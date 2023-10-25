const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.static('dist'));

app.listen(PORT, () => {
    console.log(`Eye disease prediction system ${process.env.NODE_ENV} app listening on port:${PORT}`);
    console.log(`Click to open: http://localhost:${PORT}`);
});