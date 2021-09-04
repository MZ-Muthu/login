let express = require('express');
const bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var session = require('express-session');
let bcrypt = require('bcrypt');
const saltRounds = 10;
let app = express();
let url = 'mongodb+srv://mz_muthu:muthu@cluster0.brwdb.mongodb.net/login?retryWrites=true&w=majority'
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/signup', (req, res) => {
    let name = req.body.Name;
    let email = req.body.email;
    let password = req.body.pswd;
    bcrypt.hash(password, saltRounds, function (err, hash) {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db("User_Registration");
            var myobj = { name: name, email: email, password: hash };
            dbo.collection("customers").find({}).toArray(function (err, result) {
                if (err) throw err;

                if (result.length != 0) {
                    for (let i = 0; i < result.length; i++) {
                        // console.log(result[i].email == email)
                        if (result[i].email == email) {
                            res.redirect('/error');
                            break;
                        }
                        else if (i == result.length - 1 && result[i].email != email) {
                            // console.log(result[i]);
                            // console.log(email)
                            dbo.collection("customers").insertOne(myobj, function (err, res) {
                                if (err) throw err;
                                // console.log("1 document inserted");

                                db.close();
                            });
                            res.redirect(req.get('referer'));
                        }

                    }
                } else {
                    dbo.collection("customers").insertOne(myobj, function (err, res) {
                        if (err) throw err;
                        // console.log("1 document inserted");

                        db.close();
                    });
                    res.redirect(req.get('referer'));
                }


            });


        });
    });
});

app.post('/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.pswd;
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("User_Registration");
        dbo.collection("customers").find({}).toArray(function (err, result) {
            if (err) throw err;
            for (let j = 0; j < result.length; j++) {
                if (email == result[j].email) {
                    bcrypt.compare(password, result[j].password, function (err, result) {

                        if (!result) { return res.redirect('/not_registered'); }
                        return res.redirect('/success');
                    });

                }
                else if (j == result.length - 1) {
                    return res.redirect('/not_registered');
                }
            }
            db.close();
        });
    });
});




app.get('/success', (req, res) => {
    res.sendFile(__dirname + '/success.html');
});
app.get('/not_registered', (req, res) => {
    res.sendFile(__dirname + '/notre.html');
});
app.get('/error', (req, res) => {
    res.sendFile(__dirname + '/err.html');
});
app.get('/logout', (req, res) => {

    res.redirect('/')
})
app.listen(8081);