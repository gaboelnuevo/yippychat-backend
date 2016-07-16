'use strict';

module.exports = function(app) {
  var Role = app.models.Role;
  var User = app.models.AppUser;

  function checkIsMember(userId, channelId, cb) {
    User.findById(userId, function(err, user) {
      user.joinedchannels(
        {where: {id: channelId}, limit: 1},
        function(err, channels) {
          if (err) {
            console.log(err);
            return cb(null, false);
          }
          cb(null, channels.length > 0); // true = is a member
        });
    });
  }

  function checkIsAdmin(userId, channel, cb) {
    cb(null, channel.ownerId === userId);
  }

  Role.registerResolver('channelMember', function(role, context, cb) {
    function reject() {
      process.nextTick(function() {
        cb(null, false);
      });
    }

    // if the target model is not channel
    if (context.modelName !== 'Channel') {
      return reject();
    }

    // do not allow anonymous users
    var userId = context.accessToken.userId;
    if (!userId) {
      return reject();
    }

    context.model.findById(context.modelId, function(err, channel) {
      if (err || !channel)
        return reject();

      return checkIsMember(userId, context.modelId, cb);
    });
  });

  Role.registerResolver('channelAdmin', function(role, context, cb) {
    function reject() {
      process.nextTick(function() {
        cb(null, false);
      });
    }

    if (context.modelName !== 'Channel') {
      return reject();
    }

    var userId = context.accessToken.userId;
    if (!userId) {
      return reject();
    }

    context.model.findById(context.modelId, function(err, channel) {
      if (err || !channel)
        return reject();

      return checkIsMember(userId, modelId, function(err, response) {
        if (err || !response)
          return reject();
        return checkIsAdmin(userId, channel, cb);
      });
    });
  });
};
