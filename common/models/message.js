'use strict';
var loopback = require('loopback');

module.exports = function(Message) {
  Message.sendmessage = function(message, cb) {
    var ctx = loopback.getCurrentContext();
    var currentUser = ctx && ctx.get('currentUser');
    if (currentUser) {
      currentUser.joinedchannels(
        {where: {chanelId: message.channelId}, limit: 1},
        function(err, records) {
          if (records.length) {
            Message.create({
              'content': message.content,
              'userId': currentUser.id,
              'channelId': message.channelId,
              'posted_at': new Date(),
            },
            function(err, mess) {
              Message.findById(mess.id, {
                include: {
                  relation: 'user',
                },
              }, function(err, data) {
                Message.app.io.to(data.channelId).emit('message', data);
                if (err) {
                  cb();
                } else {
                  cb(null, data);
                }
              });
            });
          } else {
            cb();
          }
        }
      );
    } else {
      cb();
    }
  };

  Message.remoteMethod('sendmessage', {
    accepts: [{
      arg: 'message',
      type: 'object',
      http: {
        source: 'body',
      },
    }],
    returns: {
      arg: 'success',
      type: 'object',
      root: true,
    },
    http: {
      path: '/sendmessage',
      verb: 'post',
    },
  });
};
