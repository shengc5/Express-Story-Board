const express = require('express');
const mongoose = require('mongoose');
const port = process.env.PORT || 5000;
const passport = require('passport');
const keys = require('./config/keys');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');


const {
    truncate, stripTags,formatDate,select, editIcon
} = require('./helpers/hbs.js');
//load user model
require('./models/user');
require('./models/story');

//Passport config
require('./config/passport')(passport);


//load routes 
const index = require('./routes/index');
const auth = require('./routes/auth');
const stories = require('./routes/stories');

mongoose.Promise = global.Promise;
// mongoose connect
mongoose.connect(keys.mongoURI, {

}).then( ()=> console.log('mongodb is running'))
	.catch(err => console.log(err));

const app = express();

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

app.engine('handlebars', exphbs({
	helpers: {
        truncate: truncate,
        stripTags: stripTags,
        formatDate: formatDate,
        select: select,
        editIcon:editIcon
    },
    defaultLayout:'main'

}));
app.set('view engine', 'handlebars');



app.use(cookieParser());
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
}))


app.use(passport.initialize());
app.use(passport.session());


app.use((req,res,next) => {
	res.locals.user = req.user || null;
	next();
})

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);


app.use('/auth', auth);

app.use('/stories', stories)

app.listen(port, () => {
	console.log('server is up and running at port ' + port);
})