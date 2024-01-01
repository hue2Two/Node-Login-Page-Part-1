const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

exports.register = (req, res) => {
    console.log(`FORM DATA: ${JSON.stringify(req.body)}`);

    // Using JavaScript destructuring to simplify statement
    const { name, email, password, passwordConfirm } = req.body;

    // Import and query the database
    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
        if (error) {
            console.log(`ERROR IN CONTROLLER: ${error}`);
        }

        if (results.length > 0) {
            return res.render('register', {
                message: 'That email is already in use'
            });
        } else if (password !== passwordConfirm) {
            return res.render('register', {
                message: 'Passwords do not match'
            });
        }

        // Encrypt the password
        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(`HASHED PW: ${hashedPassword}`);

        // Insert information into the database
        db.query('INSERT INTO users SET ?', { name: name, email: email, password: hashedPassword }, (error, results) => {
            if (error) {
                console.log(`ERROR WHEN QUERYING: ${error}`);
            } else {
                console.log(`RESULTS WHEN QUERYING: ${results}`);
                return res.render('register', {
                    message: 'User Registered'
                });
            }
        });
    });

    // Additional code or function end
};
