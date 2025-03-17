// const express = require('express');
// const router = express.Router();

// const {
//     getAllCategories,
//     creatCategory,
//     updateCategory,
//     deleteCategory
// } = require('../controllers/categories');

// router.get('/', getAllCategories)
// router.post('/',creatCategory)
// router.patch('/:articlesId',updateCategory)
// router.delete('/:articlesId', deleteCategory )

// module.exports = router;


// D:\recipe\api\controllers\categories.js

// GET all categories


// D:\recipe\api\routes\categories.js

// D:\recipe\api\routes\categories.js

const express = require('express');
const router = express.Router();

// Import the controller
const categoriesController = require('../controllers/categories');

// Define routes mapped to controller actions
router.get('/', categoriesController.getAllCategories);
router.get('/:id', categoriesController.getCategoryById);
router.post('/', categoriesController.createCategory);
router.put('/:id', categoriesController.updateCategory);
router.delete('/:id', categoriesController.deleteCategory);

module.exports = router;
