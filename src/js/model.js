import { async } from 'regenerator-runtime';
import { API_URL, RESULTS_PER_PAGE} from './config.js';
import { getJSON, sendJSON } from './function.js';
import db from 'url:../../db.js';


export const state = {
recipe: {},
search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RESULTS_PER_PAGE,
},
bookmarks: [],
user: {
    email: '', 
  },
}


const createRecipeObject = function (data) {
    let ingredients = data.ingredients;
    if (typeof ingredients === 'string') {
              ingredients = JSON.parse(ingredients);
    }
  
    return {
      id: data.id,
      title: data.title,
      publisher: data.publisher,
      howToMake: data.howToMake,
      image: data.image,
      servings: data.servings,
      cookingTime: data.cookingTime,
      ingredients,
      userEmail: data.userEmail,
      ratingSum: data.ratingSum || 0,
      ratingCount: data.ratingCount || 0,
      averageRating: data.averageRating || 0,
      ...(data.key && { key: data.key }),
    };
  };

  const applySubstitutionsToText = function(text, substitutions, userRestrictions) {
    let newText = text;
    substitutions.forEach(rule => {
      if (newText.toLowerCase().includes(rule.ingredient.toLowerCase()) && userRestrictions[rule.restriction] === 1) {
        newText = newText.replace(new RegExp(rule.ingredient, 'gi'), rule.substitute);
      }
    });
    return newText;
  };
  
  export const loadRecipe = async function(id) {
    try {
      const data = await getJSON(`${API_URL}/api/recipes/${id}`);
      if (!data || !data.data) throw new Error('Recipe data not found or malformed');
      state.recipe = createRecipeObject(data.data);
  
      const subsData = await getJSON(`${API_URL}/api/substitutions`);
      const substitutions = subsData.data; 
  
     
      if (state.user && (
           state.user.vegetarian === 1 ||
           state.user.allergicToPeanuts === 1 ||
           state.user.glutenSensitive === 1
         )) {
          
      const userRestrictions = {
        vegetarian: state.user.vegetarian,
        allergicToPeanuts: state.user.allergicToPeanuts,
        glutenSensitive: state.user.glutenSensitive,
     };
     

     state.recipe.ingredients = state.recipe.ingredients.map(ing => {
       let newDescription = ing.description;
       substitutions.forEach(rule => {
         if (newDescription.toLowerCase().includes(rule.ingredient.toLowerCase()) &&
             userRestrictions[rule.restriction] === 1) {
           newDescription = newDescription.replace(new RegExp(rule.ingredient, 'gi'), rule.substitute);
         }
       });
       return { ...ing, description: newDescription };
     });
     
     // Also update the "howToMake" instructions and title
     state.recipe.howToMake = applySubstitutionsToText(state.recipe.howToMake, substitutions, userRestrictions);
     state.recipe.title = applySubstitutionsToText(state.recipe.title, substitutions, userRestrictions);
   }
    
  
      // Bookmark 
      state.recipe.bookmarks = state.bookmarks.some(bookmark => bookmark.id === id);
    } catch (error) {
      console.error(`${error}///`);
      throw error;
    }
  };
  

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await getJSON(`${API_URL}/api/recipes`);
    
    let substitutions = [];
    if (state.user && (
          state.user.vegetarian === 1 ||
          state.user.allergicToPeanuts === 1 ||
          state.user.glutenSensitive === 1
        )) {
      const subsData = await getJSON(`${API_URL}/api/substitutions`);
      substitutions = subsData.data;
    }
    
    // Helper function for substitution
    const applySubs = function(text) {
      let newText = text;
      substitutions.forEach(rule => {
        if (newText.toLowerCase().includes(rule.ingredient.toLowerCase()) &&
            state.user[rule.restriction] === 1) {
          newText = newText.replace(new RegExp(rule.ingredient, 'gi'), rule.substitute);
        }
      });
      return newText;
    };
    
    // Map over all recipes and build both original and substituted title fields.
    let allRecipes = data.data.map(recipe => {
      return {
        id: recipe.id,
        originalTitle: recipe.title,
        title: substitutions.length > 0 ? applySubs(recipe.title) : recipe.title,
        publisher: recipe.publisher,
        image: recipe.image,
        userEmail: recipe.userEmail,
        ...(recipe.key && { key: recipe.key }),
      };
    });
    
    // Filter recipes: include if the search query appears in either title version.
    const lowerQuery = query.toLowerCase();
    state.search.results = allRecipes.filter(recipe =>
      recipe.originalTitle.toLowerCase().includes(lowerQuery) ||
      recipe.title.toLowerCase().includes(lowerQuery)
    );
  } catch (error) {
    console.error(`${error}///`);
    throw error;
  }
};



export const getSearchResultsPage = function (page = state.search.page){
    state.search.page = page;
    const start = (page - 1) * state.search.resultsPerPage;
    const end = page * state.search.resultsPerPage;
    return state.search.results.slice(start, end);
}


export const updateServing = function (newServing){
    console.log('Ingredients:', state.recipe.ingredients);
state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServing)/ state.recipe.servings;
});
 
state.recipe.servings = newServing;
};
const persistBookmarks = function() {
    if (!state.user.email) return; // if no user is logged in, do nothing
    localStorage.setItem(`bookmarks_${state.user.email}`, JSON.stringify(state.bookmarks));
  };
  


export const addBookmark = function(recipe){
    const isAlreadyBookmarked = state.bookmarks.some(bookmark => bookmark.id === recipe.id);
    if (!isAlreadyBookmarked) {
        state.bookmarks.push(recipe);
    }

    if(recipe.id === state.recipe.id)
        state.recipe.bookmarks = true;

    persistBookmarks();
}


export const deleteBookmark = function(id){

    const index = state.bookmarks.findIndex(i => i.id ===id);
    state.bookmarks.splice(index, 1);

    if(id === state.recipe.id)
        state.recipe.bookmarks = false;

    persistBookmarks();

}

export const loadUserBookmarks = function() {
    if (!state.user.email) return;
    const storage = localStorage.getItem(`bookmarks_${state.user.email}`);
    if (storage) state.bookmarks = JSON.parse(storage);
    else state.bookmarks = []; // no saved bookmarks yet
  };
  


export const clearBookmarks = function(){
    localStorage.clear('bookmarks');
}
//clearBookmarks();

export const uploadRecipe = async function (newRecipe) {
    try{
        const ingredients = Object.entries(newRecipe)
            .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
            .map(ing => {
                const ingArr = ing[1].split(',').map(el => el.trim());
                if (ingArr.length !== 3)
                    throw new Error('Wrong ingredient format, please use the correct format.');
                const [quantity, unit, description] = ingArr;
                return { quantity: quantity ? +quantity : null, unit, description };
            });
        
        const recipe = {
            title: newRecipe.title,
            publisher: newRecipe.publisher,
            howToMake: newRecipe.howToMake, 
            image: newRecipe.image,         
            cookingTime: +newRecipe.cookingTime,
            servings: +newRecipe.servings,
            ingredients,
            userEmail: state.user.email,
        };
        const data = await sendJSON(`${API_URL}/api/recipes`, {
            method: 'POST',
            body: recipe
        });
        state.recipe = createRecipeObject(data.data);
        //addBookmark(state.recipe);
       
    } catch(error){
        throw error;
    }
};

export const deleteRecipe = async function (id) {
    try {
      await sendJSON(`${API_URL}/api/recipes/${id}`, { method: 'DELETE' });

      state.search.results = state.search.results.filter(recipe => recipe.id !== id);
      if (state.recipe.id === id) state.recipe = {};

      state.bookmarks = state.bookmarks.filter(bookmark => bookmark.id !== id);
      persistBookmarks();
    } catch (error) {
      console.error('Error deleting the recipe:', error.message);
      throw error;
    }
  };

  export const updateRecipe = async function (id, newRecipe) {
    try {
      // transform newRecipe into the same structure the server expects
      const ingredients = Object.entries(newRecipe)
        .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
        .map(ing => {
          const ingArr = ing[1].split(',').map(el => el.trim());
          if (ingArr.length !== 3)
            throw new Error('Wrong ingredient format, please use the correct format.');
          const [quantity, unit, description] = ingArr;
          return { quantity: quantity ? +quantity : null, unit, description };
        });
  
      const body = {
        title: newRecipe.title,
        howToMake: newRecipe.howToMake,
        image: newRecipe.image,
        publisher: newRecipe.publisher,
        servings: +newRecipe.servings,
        cookingTime: +newRecipe.cookingTime,
        ingredients,
        userEmail: state.user.email, 
      };
      console.log('Updating recipe with PUT:', `${API_URL}/api/recipes/${id}`);
      const data = await sendJSON(`${API_URL}/api/recipes/${id}`, {
        method: 'PUT',
        body,
      });
      console.log('UPDATE response:', data);
      state.recipe = createRecipeObject(data.data);
  
    } catch (err) {
      throw err;
    }
  };


export const loadSubstitutions = async function() {
  try {
    const [rows] = await db.promise().query('SELECT * FROM substitutions');
    return rows; 
  } catch (error) {
    console.error('Error loading substitutions:', error);
    throw error;
  }
};
