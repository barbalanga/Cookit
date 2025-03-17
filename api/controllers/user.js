// module.exports ={
//     singup:  (req, res)=> {
//         res.status(200).json({
//             message: 'Singup'
//         })
//     },
//     login:  (req, res)=> {
//         res.status(200).json({
//             message: 'Login'
//         })
//     }
// }


// D:\recipe\api\controllers\user.js

// SIGNUP


// D:\recipe\api\controllers\user.js

/**
 * Controller for handling Users
 */

 // Example table structure (MySQL):
 // users: id (PK), username, password, created_at

 exports.getAllUsers = async (req, res, next) => {
    try {
      const [rows] = await req.db.execute('SELECT * FROM users ORDER BY id DESC');
      return res.status(200).json(rows);
    } catch (error) {
      return next(error);
    }
  };
  
  exports.getUserById = async (req, res, next) => {
    const userId = req.params.id;
  
    try {
      const [rows] = await req.db.execute('SELECT * FROM users WHERE id = ?', [userId]);
      if (rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(200).json(rows[0]);
    } catch (error) {
      return next(error);
    }
  };
  
  exports.createUser = async (req, res, next) => {
    const { username, password } = req.body;
  
    try {
      // Basic validation
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
  
      const [result] = await req.db.execute(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, password]
      );
  
      return res.status(201).json({
        message: 'User created successfully',
        userId: result.insertId
      });
    } catch (error) {
      return next(error);
    }
  };
  
  exports.updateUser = async (req, res, next) => {
    const userId = req.params.id;
    const { username, password } = req.body;
  
    try {
      // Check if user exists
      const [existingUser] = await req.db.execute('SELECT * FROM users WHERE id = ?', [userId]);
      if (existingUser.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      await req.db.execute(
        'UPDATE users SET username = ?, password = ? WHERE id = ?',
        [
          username || existingUser[0].username,
          password || existingUser[0].password,
          userId
        ]
      );
  
      return res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
      return next(error);
    }
  };
  
  exports.deleteUser = async (req, res, next) => {
    const userId = req.params.id;
  
    try {
      // Check if user exists
      const [existingUser] = await req.db.execute('SELECT * FROM users WHERE id = ?', [userId]);
      if (existingUser.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      await req.db.execute('DELETE FROM users WHERE id = ?', [userId]);
  
      return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      return next(error);
    }
  };
  