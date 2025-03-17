// app.js
const express = require('express');
const morgan = require('morgan');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const path = require('path');
const nodemailer = require('nodemailer');
const db = require('./db');

const app = express();


// 1) Create MySQL Pool
// const db = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: 'barby100',
//   database: 'my_recipes',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

// // 2) Test the DB
// db.getConnection((err, connection) => {
//   if (err) console.error('DB connection error:', err);
//   else {
//     console.log('Connected to MySQL Database!');
//     connection.release();
//   }
// });

// 3) Middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4) CORS (allow all origins)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE');
    return res.status(200).json({});
  }
  next();
});

// 5) Existing Recipe Endpoints

// GET /api/recipes - search recipes
app.get('/api/recipes', (req, res) => {
  const searchQuery = req.query.search || '';
  const sql = 'SELECT * FROM recipes WHERE title LIKE ?';
  db.query(sql, [`%${searchQuery}%`], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to retrieve recipes' });
    res.json({ data: results });
  });
});

// GET /api/recipes/:id - get single recipe
app.get('/api/recipes/:id', (req, res) => {
  const recipeId = req.params.id;
  const sql = 'SELECT * FROM recipes WHERE id = ?';
  db.query(sql, [recipeId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to retrieve recipe' });
    if (results.length === 0) return res.status(404).json({ error: 'Recipe not found' });
    res.json({ data: results[0] });
  });
});

// POST /api/recipes - add a new recipe
app.post('/api/recipes', (req, res) => {
  console.log('Received recipe data:', req.body); // For debugging
  const { title, publisher, howToMake, image, servings, cookingTime, ingredients, userEmail } = req.body;
  if (!title || !publisher || !howToMake || !image || !servings || !cookingTime || !ingredients || !userEmail) {
      return res.status(400).json({ error: 'Missing required recipe fields' });
  }
  const insertSql =
      'INSERT INTO recipes (title, publisher, howToMake, image, servings, cookingTime, ingredients, userEmail) VALUES (?,?,?,?,?,?,?,?)';
  db.query(
      insertSql,
      [title, publisher, howToMake, image, servings, cookingTime, JSON.stringify(ingredients), userEmail],
      (err, results) => {
          if (err) {
              console.error('DB insert error:', err);
              return res.status(500).json({ error: 'Failed to insert recipe into DB' });
          }
          const insertedId = results.insertId;
          const selectSql = 'SELECT * FROM recipes WHERE id = ?';
          db.query(selectSql, [insertedId], (err, results) => {
              if (err) {
                  console.error('DB select error:', err);
                  return res.status(500).json({ error: 'Failed to retrieve inserted recipe' });
              }
              res.status(201).json({ data: results[0] });
          });
      }
  );
});

// DELETE /api/recipes/:id - delete a recipe
app.delete('/api/recipes/:id', (req, res) => {
  const recipeId = req.params.id;
  const sql = 'DELETE FROM recipes WHERE id = ?';
  db.query(sql, [recipeId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to delete recipe' });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Recipe not found' });
    res.json({ message: 'Recipe deleted successfully' });
  });
});

// 6) Registration Endpoint
app.post('/api/register', async (req, res) => {
  try {
    console.log('Received POST request to /api/register');

    const { name, email, password, allergicToPeanuts, vegetarian, glutenSensitive, chef } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    
    // Check if user already exists
    const [existing] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Insert new user into DB.
    // We'll store chef as 1 if they request chef permission.
    const [result] = await db.promise().query(
      `INSERT INTO users 
       (name, email, password, allergicToPeanuts, vegetarian, glutenSensitive, chef)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, allergicToPeanuts ? 1 : 0, vegetarian ? 1 : 0, glutenSensitive ? 1 : 0, chef ? 1 : 0]
    );
    const requestedChef = chef ? 1 : 0;
    console.log('chef from client =', chef);

    // If the user requested Chef, send an email with approval links.
    if (chef) {
      // Pass the new user's ID (result.insertId) so the email link can include it.
      await sendChefRequestEmail(name, email, result.insertId);
    }
    
    res.status(201).json({ data: { id: result.insertId, name, email, chef: requestedChef } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed.' });
  }
});


async function sendChefRequestEmail(userName, userEmail, userId) {
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,         
    secure: false,      
    auth: {
      user: 'cookitproject1@gmail.com',
      pass: 'lnclbvkiathgttke', 
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  transporter.verify((err, success) => {
    if (err) console.error('Nodemailer verify error:', err);
    else console.log('Server is ready to send messages');
  });

  // Build approval and denial URLs.
  // For example, these endpoints (see step 3) will update the user’s chef status.
  const baseURL = 'http://localhost:3000/api/users'; 
  const approveURL = `${baseURL}/${userId}/chef-approval?approved=true`;
  const denyURL = `${baseURL}/${userId}/chef-approval?approved=false`;

  let mailOptions = {
    from: '"MyRecipes App" <cookitproject1@gmail.com>',
    to: 'cookitproject1@gmail.com', 
    subject: 'Chef Permission Requested',
    html: `<p>User <b>${userName}</b> (${userEmail}) has requested Chef permission.</p>
           <p>Approve: <a href="${approveURL}">Yes</a> | Deny: <a href="${denyURL}">No</a></p>`
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Chef request email sent:', info.response);
  } catch (err) {
    console.error('Error sending email:', err);
  }
}


// PATCH /api/users/:id/chef-approval?approved=true|false
app.patch('/api/users/:id/chef-approval', async (req, res) => {
  try {
    const userId = req.params.id;
    const approved = req.query.approved === 'true';
    // If approved, update chef to 2 (approved Chef); otherwise, set to 0 (normal user)
    const newChefValue = approved ? 2 : 0;

    const [result] = await db.promise().query(
      'UPDATE users SET chef = ? WHERE id = ?',
      [newChefValue, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ message: `User ${userId} updated to chef = ${newChefValue}.` });
  } catch (err) {
    console.error('Error updating chef status:', err);
    res.status(500).json({ error: 'Failed to update chef status.' });
  }
});

// GET /api/users/:id/chef-approval?approved=true|false
app.get('/api/users/:id/chef-approval', async (req, res) => {
  try {
    const userId = req.params.id;
    const approved = req.query.approved === 'true';
    // If approved, set chef to 2 (approved Chef); otherwise, set it to 0 (normal user)
    const newChefValue = approved ? 2 : 0;

    const [result] = await db.promise().query(
      'UPDATE users SET chef = ? WHERE id = ?',
      [newChefValue, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.redirect('http://localhost:3000/mail.html');
  } catch (err) {
    console.error('Error updating chef status:', err);
    res.status(500).json({ error: 'Failed to update chef status.' });
  }
});


// 7) Login Endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email and password.' });
    }
    
    // Retrieve user from DB
    const [rows] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    
    const user = rows[0];
    
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    
    // Successful login; return user data (excluding password)
    res.json({ data: { id: user.id, name: user.name, email: user.email, chef: user.chef,
      allergicToPeanuts: user.allergicToPeanuts, vegetarian: user.vegetarian, glutenSensitive: user.glutenSensitive
     } });
    console.log('User row from DB:', user);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed.' });
  }
});


app.put('/api/recipes/:id', async (req, res) => {
  try {
    const recipeId = req.params.id;
    const { title, publisher, howToMake, image, servings, cookingTime, ingredients, userEmail } = req.body;

    // 1) Get the user from DB
    const [userRows] = await db.promise().query('SELECT * FROM users WHERE email=?', [userEmail]);
    if (userRows.length === 0) {
      return res.status(401).json({ error: 'No user found with that email.' });
    }

    const user = userRows[0];
    const isChef = user.chef === 2; 
    const adminEmail = 'cookit@gmail.com';
    const isAdmin = user.email === adminEmail;

    let updateSql, updateParams;
    if (isChef|| isAdmin){
      // Chefs can edit ANY recipe
      updateSql = `
        UPDATE recipes
        SET title = ?, publisher = ?, howToMake = ?, image = ?, servings = ?, cookingTime = ?, ingredients = ?
        WHERE id = ?
      `;
      updateParams = [
        title,
        publisher,
        howToMake,
        image,
        servings,
        cookingTime,
        JSON.stringify(ingredients),
        recipeId
      ];
    } else {
      // Normal user can only update their own
      updateSql = `
        UPDATE recipes
        SET title = ?, publisher = ?, howToMake = ?, image = ?, servings = ?, cookingTime = ?, ingredients = ?
        WHERE id = ? AND userEmail = ?
      `;
      updateParams = [
        title,
        publisher,
        howToMake,
        image,
        servings,
        cookingTime,
        JSON.stringify(ingredients),
        recipeId,
        userEmail
      ];
    }

    const [updateResult] = await db.promise().query(updateSql, updateParams);

    if (updateResult.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: 'Recipe not found or not owned by you (if you are not a Chef).' });
    }

    // 3) Return the updated recipe
    const [rows] = await db.promise().query('SELECT * FROM recipes WHERE id=?', [recipeId]);
    res.json({ data: rows[0] });
  } catch (error) {
    console.error('DB update error:', error);
    res.status(500).json({ error: 'DB update error' });
  }
});

app.use(express.static(path.join(__dirname, 'public')));

// Serve mail.html from the 'recipe' folder
app.get('/mail.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'mail.html'));
});

// GET /api/substitutions - return all substitution rules from the database
app.get('/api/substitutions', async (req, res) => {
  try {
    const [rows] = await db.promise().query('SELECT * FROM substitutions');
    res.json({ data: rows });
  } catch (err) {
    console.error('Error fetching substitutions:', err);
    res.status(500).json({ error: 'Failed to load substitutions' });
  }
});


app.post('/api/recipes/:id/rate', async (req, res) => {
  try {
    const recipeId = req.params.id;
    const { rating } = req.body;
    if (!rating || isNaN(rating)) {
      return res.status(400).json({ error: 'Invalid rating value.' });
    }
    // Get current rating data
    const [rows] = await db.promise().query(
      'SELECT ratingSum, ratingCount FROM recipes WHERE id = ?',
      [recipeId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found.' });
    }
    const currentRatingSum = parseFloat(rows[0].ratingSum) || 0;
    const currentRatingCount = parseInt(rows[0].ratingCount) || 0;
    const newRatingSum = currentRatingSum + parseFloat(rating);
    const newRatingCount = currentRatingCount + 1;
    const newAverageRating = newRatingSum / newRatingCount;
    await db.promise().query(
      'UPDATE recipes SET ratingSum = ?, ratingCount = ?, averageRating = ? WHERE id = ?',
      [newRatingSum, newRatingCount, newAverageRating, recipeId]
    );
    res.json({
      data: {
        averageRating: newAverageRating,
        ratingCount: newRatingCount,
      },
    });
  } catch (err) {
    console.error('Rating update error:', err);
    res.status(500).json({ error: 'Failed to update rating.' });
  }
});





app.use((req, res, next) => {
  console.log(`404 Error for ${req.method} ${req.url}`);
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// 9) Error handler
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({ error: { message: error.message } });
});



// 10) Export the app so server.js can start it
module.exports = app;
