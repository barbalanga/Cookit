// module.exports ={
//     getAllCategories:  (req, res)=> {
//         res.status(200).json({
//             message: 'Get All Categories'
//         })
//     },
//     creatCategory:  (req, res)=> {
//         res.status(200).json({
//             message: 'Create a new Category'
//         })
//     },
//     updateCategory: (req, res)=> {
//         const articlesId = req.params.articlesId
//         res.status(200).json({
//             message: `update Category - ${articlesId}`
//         })
//     },
//     deleteCategory: (req, res)=> {
//         const articlesId = req.params.articlesId
//         res.status(200).json({
//             message: `Delete Category - ${articlesId}`
//         })
//     }
// }


// D:\recipe\api\controllers\categories.js

// GET all categories


// D:\recipe\api\controllers\categories.js

/**
 * Controller for handling Categories
 */

 // Example table structure (MySQL):
 // categories: id (PK), name, created_at

 exports.getAllCategories = async (req, res, next) => {
    try {
      const [rows] = await req.db.execute('SELECT * FROM categories ORDER BY id DESC');
      return res.status(200).json(rows);
    } catch (error) {
      return next(error);
    }
  };
  
  exports.getCategoryById = async (req, res, next) => {
    const categoryId = req.params.id;
  
    try {
      const [rows] = await req.db.execute('SELECT * FROM categories WHERE id = ?', [categoryId]);
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Category not found' });
      }
      return res.status(200).json(rows[0]);
    } catch (error) {
      return next(error);
    }
  };
  
  exports.createCategory = async (req, res, next) => {
    const { name } = req.body;
  
    try {
      if (!name) {
        return res.status(400).json({ message: 'Category name is required' });
      }
  
      const [result] = await req.db.execute(
        'INSERT INTO categories (name) VALUES (?)',
        [name]
      );
  
      return res.status(201).json({
        message: 'Category created successfully',
        categoryId: result.insertId
      });
    } catch (error) {
      return next(error);
    }
  };
  
  exports.updateCategory = async (req, res, next) => {
    const categoryId = req.params.id;
    const { name } = req.body;
  
    try {
      // Check if category exists
      const [existingCategory] = await req.db.execute('SELECT * FROM categories WHERE id = ?', [categoryId]);
      if (existingCategory.length === 0) {
        return res.status(404).json({ message: 'Category not found' });
      }
  
      await req.db.execute(
        'UPDATE categories SET name = ? WHERE id = ?',
        [name || existingCategory[0].name, categoryId]
      );
  
      return res.status(200).json({ message: 'Category updated successfully' });
    } catch (error) {
      return next(error);
    }
  };
  
  exports.deleteCategory = async (req, res, next) => {
    const categoryId = req.params.id;
  
    try {
      // Check if category exists
      const [existingCategory] = await req.db.execute('SELECT * FROM categories WHERE id = ?', [categoryId]);
      if (existingCategory.length === 0) {
        return res.status(404).json({ message: 'Category not found' });
      }
  
      await req.db.execute('DELETE FROM categories WHERE id = ?', [categoryId]);
  
      return res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
      return next(error);
    }
  };
  