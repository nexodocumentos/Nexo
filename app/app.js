var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var url = require('url');
var jwt = require('jsonwebtoken');
var apiRoutes = express.Router();
var app = express();

var lSession = require('./Logic/LSession');
var lDocuments = require('./Logic/LDocuments');
var ut = require('./utils');


app.use(express.static('assets'));
app.use(express.static('Web'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('superSecret', 'secretTokenNexo');


//Server
var server = app.listen(8085, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Nexo app listening at http://%s:%s", host, port)
})

//General
app.get('/', function (req, res) {
  res.sendFile(__dirname + "/" + "../index");
})
app.post('/authenticate', function (req, res) {

  // find the user
  User.findOne({
    name: req.body.name
  }, function (err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

        // if user is found and password is right
        // create a token
        var token = jwt.sign(user, app.get('superSecret'), {
          expiresInMinutes: 1440 // expires in 24 hours
        });

        // return the information including token as JSON
        res.json({
          success: true, message: 'Enjoy your token!', token: token
        });
      }

    }

  });
});
app.get('/api/my_secret_page', function (req, res) {
  res.send('if you are viewing this page it means you are logged in');
});


// Auth routes
apiRoutes.use(function (req, res, next) {
  // check header or url parameters or post parameters for token
  var token = ut.getToken(req);
  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function (err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.', error:'TokenExpiredError' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });
  }
});
app.use('/api', apiRoutes);
//Session

app.post('/registerUser', function (req, res) {
  var post = req.body;
  if (ut.empty(post.ci) || ut.empty(post.name) || ut.empty(post.email) || ut.empty(post.phone) || ut.empty(post.password)) {
    res.json({
      success: false,
      message: 'Document, name, email or password empty.'
    });
  } else {
    lSession.registerUser(post, function (err, result) {
      if (!err) {
        res.json({
          success: true
        });
      } else {
        res.json({
          success: false,
          message: err
        });
      }
    })
  };
});

app.post('/login', function (req, res) {
  var post = req.body;
  if (ut.empty(post.email) || ut.empty(post.password)) {
    res.json({
      success: false,
      message: 'Email or password empty.'
    });
  } else {
    lSession.logIn(post.email, post.password, function (err, result) {
      if (!err) {
        if (result) {
          var token = jwt.sign({ exp: Math.floor(Date.now() / 1000) + (60 * 60), data: post.email }, app.get('superSecret'));
          res.json({
            success: true,
            ok: true,
            token: token,
            data: result
          });

        } else {
          res.json({
            success: true,
            ok: false,
            message: 'Wrong email or password.'
          });
        }
      } else {
        res.json({
          success: false,
          message: err
        });
      }
    })
  };
});

//Documents
app.get('/findDocument', function (req, res) {
  var query = url.parse(req.url, true).query;
  if (ut.empty(query.type) || ut.empty(query.number)) {
    res.json({
      success: false,
      message: 'Type or number empty.'
    });
  } else {
    lDocuments.findDocument(query.type, query.number, function (err, result) {
      if (err) {
        res.json({
          success: false,
          data: err
        });
      } else {
        res.json({
          success: true,
          data: result
        });
      }
    })
  };
});

app.post('/publishFoundDocument', function (req, res) {
  var post = req.body;
  if (ut.empty(post.type) || ut.empty(post.number) || ut.empty(post.finder) || ut.empty(post.finder.phone) || ut.empty(post.finder.name)) {
    res.json({
      success: true,
      message: 'Document type, number, finder name or phone empty.'
    });
  } else {
    lDocuments.publishFoundDocument(post, function (error, data) {
      if (error) {
        res.json({
          success: false,
          message: error
        });
      } else {
        res.json({
          success: true,
          message: data
        });
      }
    })
  };
});

//con auth
apiRoutes.route('/publishLossedDocument')
  .post(function (req, res) {
    var post = req.body;
    if (ut.empty(post.type) || ut.empty(post.number)) {
      res.json({
        success: true,
        message: 'Document type or number empty.'
      });
    } else {
      lDocuments.publishLossedDocument(req, post, function (error, data) {
        if (error) {
          res.json({
            success: false,
            message: error
          });
        } else {
          res.json({
            success: true,
            data: data
          });
        }
      })
    };
  });

