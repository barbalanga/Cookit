// const express = require('express');
// const router = express.Router();

// const {
//     singup,
//     login
// } = require('../controllers/user');

// router.post('/singup', singup)
// router.post('/login',login)

// module.exports = router;

// D:\recipe\api\controllers\user.js

// SIGNUP



// D:\recipe\api\routes\user.js

// D:\recipe\api\routes\user.js

const express = require('express');
const router = express.Router();

// Import the controller
const userController = require('../controllers/user');

// Define routes mapped to controller actions
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
