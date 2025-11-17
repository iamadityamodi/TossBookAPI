const express = require("express");
const multer = require('multer')
const path = require('path')
const mysql = require('mysql2/promise')
const bodyParser = require('body-parser')
const cors = require('cors');

const app = express()

app.use(cors());
app.use(express.json()); // ✅ Parse application/json
app.use(express.urlencoded({ extended: true })); // ✅ Parse form-data

// EJS for HTML rendering
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Static folder for uploads
app.use('/upload', express.static(path.join(__dirname, 'upload')));

const goldRoutes = require("./routes/tossbookroute");
const PORT = process.env.PORT || 8080;
app.use('/api/v1/tossbook', goldRoutes);

app.get('/get', (req, res) =>{
    res.status(200).send('<h1>Working fine now</h1>')

})
 

app.listen(PORT,()=>{
    console.log('Server running')
})