'use strict';
var loopback = require('loopback');

module.exports = function(AppUser) {
  AppUser.joinchannel = function(channelId, cb) {
    var ctx = loopback.getCurrentContext();
    var currentUser = ctx && ctx.get('currentUser');
    if (currentUser) {
      AppUser.app.models.Channel.findById(channelId, function(err, channel) {
        currentUser.joinedchannels.add(channel, function(err, res) {
          cb();
        });
      });
    } else {
      cb();
    }
  };

  AppUser.remoteMethod('joinchannel', {
    accepts: [
      {arg: 'channelId', type: 'string'},
    ],
    returns: {arg: 'success', type: 'boolean'},
    http: {path: '/joinchannel', verb: 'post'},
  });
};
