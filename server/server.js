var loopback = require('loopback');
var boot = require('loopback-boot');

var app = module.exports = loopback();

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// -- Add your pre-processing middleware here --
app.use(loopback.context());
app.use(loopback.token());
app.use(function setCurrentUser(req, res, next) {
  if (!req.accessToken) {
    return next();
  }
  app.models.AppUser.findById(req.accessToken.userId, function(err, user) {
    if (err) {
      return next(err);
    }
    if (user) {
      var loopbackContext = loopback.getCurrentContext();
      if (loopbackContext) {
        loopbackContext.set('currentUser', user);
      }
    }else{
      return next(new Error('No user with this access token was found.'));
    }
    next();
  });
});

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module){
    //app.start();
    app.io = require('socket.io')(app.start());
    require('socketio-auth')(app.io, {
    authenticate: function (socket, value, callback) {

        var AccessToken = app.models.AccessToken;
        //get credentials sent by the client
        var token = AccessToken.find({
          where:{
            and: [{ userId: value.userId }, { id: value.id }]
          }
        }, function(err, tokenDetail){
          if (err) throw err;
          if(tokenDetail.length){
            callback(null, true);
          } else {
            callback(null, false);
          }
        }); //find function..
      }, //authenticate function..
      postAuthenticate: function (socket, data) {
        var userId = data.userId;
        var accessTokenId = data.id;

        socket.credentials = data;
        // auto subscribe chanels here
      }

    });

    app.io.on('connection', function(socket){
      console.log('a user connected');

      socket.on('subscribe', function(chanel) {
          console.log('joining chanel', chanel);
          socket.join(chanel);
      });

      socket.on('unsubscribe', function(chanel) {
          console.log('joining chanel', chanel);
          socket.leave(chanel);
      });

      socket.on('receive message', function(data) {
          console.log(socket.credentials.userId + ' received message '+ data.chanelId);
      });

      socket.on('disconnect', function(){
        console.log('user disconnected');
      });
    });
  }
});
