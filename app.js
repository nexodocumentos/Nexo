require('dotenv').config()
var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var url = require('url');
var jwt = require('jsonwebtoken');
var emailValidator = require("email-validator");

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
var server = app.listen(process.env.SERVER_PORT, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Nexo app listening at http://%s:%s", host, port)
})

//General
app.get('/', function (req, res) {
  res.sendFile(__dirname + "/" + "../index");
})


// Auth routes
apiRoutes.use(function (req, res, next) {
  // check header or url parameters or post parameters for token
  var token = ut.getToken(req);
  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function (err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.', error: 'TokenExpiredError' });
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
  if (ut.empty(post.ci) || ut.empty(post.name) || ut.empty(post.email) || ut.empty(post.phone) || ut.empty(post.password) || ut.empty(post.password1)) {
    res.json({
      success: true,
      ok:false,
      message: 'No pueden haber valores vacios.'
    });
  } else {
    post.ci = ut.getIdentNumber(post.ci);
    var msg;
    if (!(post.password == post.password1)) {
      msg = 'Contraseñas no coinciden.'
    } else
      if (!emailValidator.validate(post.email)) {
        msg = 'Email inválido'
      } else
        if ((post.ci).length < 7) {
          msg = 'Número identificador no válido'
        }else
        if ((post.password).length < 8) {
          msg = 'Contraseña muy corta, largo mínimo 8.'
        }
    if (msg) {
      res.json({
        success: true,
        ok:false,
        message: msg
      });
    } else {
      lSession.registerUser(post, function (err,exists) {
        if (!err) {
          res.json({
            success: true,
            ok:true,
            exists:exists
          });
        } else {
          res.json({
            success: false,
            message: err
          });
        }
      })
    }
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
  if (ut.empty(post.type) || ut.empty(post.number) || ut.empty(post.phone) || ut.empty(post.email) || ut.empty(post.name)) {
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
          data: data
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

