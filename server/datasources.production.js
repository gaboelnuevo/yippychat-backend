module.exports = {
  db: {
    defaultForType: 'mongodb',
    connector: 'loopback-connector-mongodb',
    url: process.env.MONGODB_URI
  }
}
