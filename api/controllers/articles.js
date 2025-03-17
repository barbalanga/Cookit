// const { default: mongoose } = require('mongoose');
// const Recipe = require('../models/article');
// //const mongoose = require('mongoose');
// const article = require('../models/article');

// module.exports = {
//     getAllArticles:  (req, res)=> {
//         res.status(200).json({
//             message: 'Get All Recipe'
//         })
//     },
    
//     creatArticle:  (req, res)=> {
//         const {title, description, content} = req.body;
        
//         const recipe = new Recipe({
//             _id: new mongoose.Types.ObjectId(),
//             title: title,
//             description: description,
//             content: content
//         });
//         recipe.save().then(()=>{
//             res.status(200).json({
//                 message: 'Create a new Recipe'
//             })
//             }).catch(error => {
//                 res.status(500).json({
//                    error
                   
//                 })
//         });
//     },
//     updateArticle: (req, res)=> {
//         const articlesId = req.params.articlesId
//         res.status(200).json({
//             message: `update recipe - ${articlesId}`
//         })
//     },
//     deleteArticle: (req, res)=> {
//         const articlesId = req.params.articlesId
//         res.status(200).json({
//             message: `Delete recipe - ${articlesId}`
//         })
//     }
// }


// D:\recipe\api\controllers\articles.js

// GET all articles


// D:\recipe\api\controllers\articles.js

/**
 * Controller for handling Articles
 */

 // Example table structure (MySQL):
 // articles: id (PK), title, content, created_at

 exports.getAllArticles = async (req, res, next) => {
    try {
      const [rows] = await req.db.execute('SELECT * FROM articles ORDER BY id DESC');
      return res.status(200).json(rows);
    } catch (error) {
      return next(error);
    }
  };
  
  exports.getArticleById = async (req, res, next) => {
    const articleId = req.params.id;
  
    try {
      const [rows] = await req.db.execute('SELECT * FROM articles WHERE id = ?', [articleId]);
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Article not found' });
      }
      return res.status(200).json(rows[0]);
    } catch (error) {
      return next(error);
    }
  };
  
  exports.createArticle = async (req, res, next) => {
    const { title, content } = req.body;
  
    try {
      // Basic validation
      if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
      }
  
      const [result] = await req.db.execute(
        'INSERT INTO articles (title, content) VALUES (?, ?)',
        [title, content]
      );
  
      // Return the newly created record ID
      return res.status(201).json({
        message: 'Article created successfully',
        articleId: result.insertId
      });
    } catch (error) {
      return next(error);
    }
  };
  
  exports.updateArticle = async (req, res, next) => {
    const articleId = req.params.id;
    const { title, content } = req.body;
  
    try {
      // Check if article exists
      const [existingArticle] = await req.db.execute('SELECT * FROM articles WHERE id = ?', [articleId]);
      if (existingArticle.length === 0) {
        return res.status(404).json({ message: 'Article not found' });
      }
  
      await req.db.execute(
        'UPDATE articles SET title = ?, content = ? WHERE id = ?',
        [title || existingArticle[0].title, content || existingArticle[0].content, articleId]
      );
  
      return res.status(200).json({ message: 'Article updated successfully' });
    } catch (error) {
      return next(error);
    }
  };
  
  exports.deleteArticle = async (req, res, next) => {
    const articleId = req.params.id;
  
    try {
      // Check if article exists
      const [existingArticle] = await req.db.execute('SELECT * FROM articles WHERE id = ?', [articleId]);
      if (existingArticle.length === 0) {
        return res.status(404).json({ message: 'Article not found' });
      }
  
      await req.db.execute('DELETE FROM articles WHERE id = ?', [articleId]);
  
      return res.status(200).json({ message: 'Article deleted successfully' });
    } catch (error) {
      return next(error);
    }
  };
  