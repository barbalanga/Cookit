// const express = require('express');
// const router = express.Router();

// const {
//     getAllArticles,
//     creatArticle,
//     updateArticle,
//     deleteArticle
// } = require('../controllers/articles');

// router.get('/', getAllArticles)
// router.post('/',creatArticle)
// router.patch('/:articlesId',updateArticle)
// router.delete('/:articlesId', deleteArticle )

// module.exports = router;


// D:\recipe\api\controllers\articles.js

// GET all articles


// D:\recipe\api\routes\articles.js

// D:\recipe\api\routes\articles.js

const express = require('express');
const router = express.Router();

// Import the controller
const articlesController = require('../controllers/articles');

// Define routes mapped to controller actions
router.get('/', articlesController.getAllArticles);
router.get('/:id', articlesController.getArticleById);
router.post('/', articlesController.createArticle);
router.put('/:id', articlesController.updateArticle);
router.delete('/:id', articlesController.deleteArticle);

module.exports = router;
