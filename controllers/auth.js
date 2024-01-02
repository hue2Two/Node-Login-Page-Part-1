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

// exports.login = () => {
//     console.log("testing login route");
// }

exports.login = async (req, res) => {
    console.log(`LOG IN ROUTE`)
    try {
        const { email, password } = req.body; //grab info from form 

        //check if someone is trying to subit w/out email or pw
        if (!email || !password) {
            return res.status(400).render('login', {
                message: 'please provide an email and password'
            })
        }

        db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
            console.log(`RESULTS IN LOGIN: ${JSON.stringify(results)}`)
            if(!results || !(await bcrypt.compare(password, results[0].password))) {
                res.status(401).render('login', {
                    message: 'email or password is incorrect'
                })
            } else {
                const id = results[0].id;
                const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
                    //when token is expiring
                    expiresIn: process.env.JWT_EXPIRES_IN
                });

                console.log(`CHECKING TOKEN: ${token}`);
                //now set token into cookies

                const cookiesOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60
                    ),
                    httpOnly: true
                }

                //setup cookie in browser with name
                res.cookie('jwt', token, cookiesOptions); 
                res.status(200).redirect("/");
            }
        })
    }   
    catch (error) {
        console.log(`TRY CATCH ERROR: ${error}`)
    }
}
