const mongoose = require('mongoose');
const recipeSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: {type: String,required: true},
    description: {type: String,required: true},
    content: {type: String,required: true}
})

module.exports = mongoose.model('Recipe',recipeSchema )