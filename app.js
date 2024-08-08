const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fileUpload = require('express-fileupload');
const cors = require('cors');

app.use(
    fileUpload({
        limits: {
            fileSize: 10000000,
        },
        abortOnLimit: true,
    })
);

app.use(cors());
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

app.use(express.static('public'));
  
app.get('/', (req, res) => {
res.json({'message': 'ok'});
})

const authRoute = require('./routes/auth.route');
app.use('/auth', authRoute);

const membersRoute = require('./routes/members.route');
app.use('/members', membersRoute);

const booksRoute = require('./routes/books.route');
app.use('/books', booksRoute);

app.listen(8080, ()=> {
    console.log("Server is running on port 8080");
});