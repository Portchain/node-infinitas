module.exports = {
  db: {
    host:     process.env.INFINITAS_DB_HOST || '127.0.0.1',
    port:     process.env.INFINITAS_DB_PORT || 5432,
    name:     process.env.INFINITAS_DB_NAME || 'infinitas',
    user:     process.env.INFINITAS_DB_USER || 'infinitas',
    password: process.env.INFINITAS_DB_PWD
  }
}
