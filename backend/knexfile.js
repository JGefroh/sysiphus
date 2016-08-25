module.exports = {
  development: {
    client: 'pg',
    connection: 'sysiphus_dev'
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 0,
      max: 10
    }
  }
}
