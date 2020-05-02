const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
var path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });

const homeRouter = require('./routes/index');

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', homeRouter);

app.listen(PORT, () => {
	console.log(`server is running on port ${PORT}`);
});
