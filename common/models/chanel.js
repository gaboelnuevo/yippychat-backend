module.exports = function(Chanel) {
  Chanel.nearby = function(here,cb){
    Chanel.find({where: {location: {near: here}}, limit:100}, function(err, nearbyPlaces) {
      cb(null, nearbyPlaces);
    });
  };

  Chanel.remoteMethod('nearby', {
    accepts: [
        {arg: 'here', type: 'GeoPoint', required: true, description: 'geo location (lat & lng)'}
       ],
      returns: {arg: 'chanels', root: true},
      http: {path:'/nearby', verb: 'post'}
    });
};
