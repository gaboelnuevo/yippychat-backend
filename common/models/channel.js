'use strict';
module.exports = function(Channel) {
  Channel.nearby = function(here, cb) {
    Channel.find({
      where: {
        location: {
          near: here,
        },
      },
      limit: 100,
    },
    function(err, nearby) {
      cb(null, nearby);
    });
  };

  Channel.remoteMethod('nearby', {
    accepts: [{
      arg: 'here',
      type: 'GeoPoint',
      required: true,
      description: 'geo location (lat & lng)',
    }],
    returns: {
      arg: 'channels',
      root: true,
    },
    http: {
      path: '/nearby',
      verb: 'post',
    },
  });
};
