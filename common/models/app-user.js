'use strict';
var loopback = require('loopback');

module.exports = function(AppUser) {
  AppUser.joinchannel = function(channelId, cb) {
    var ctx = loopback.getCurrentContext();
    var currentUser = ctx && ctx.get('currentUser');
    if (currentUser) {
      AppUser.app.models.Channel.findById(channelId, function(err, channel) {
        if (channel && (channel.public || channel.ownerId == currentUser.id)) {
          currentUser.joinedchannels.add(channel, function(err, res) {
            if (!err) {
              channel.people++;
              channel.save({skipPropertyFilter: true});
            }
            cb();
          });
        } else {
          cb(null, false);
        }
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
