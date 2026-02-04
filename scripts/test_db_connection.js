const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

console.log('Connecting to:', process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@')); // hiding password

client.connect()
    .then(() => {
        console.log('Connected successfully!');
        return client.query('SELECT NOW()');
    })
    .then(res => {
        console.log('Query result:', res.rows[0]);
        return client.end();
    })
    .catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });
