import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { API_URL} from './config.js';


import 'core-js/stable';
import 'regenerator-runtime/runtime';
import previewView from './views/previewView.js';

let editMode = false;
let editingRecipeId = null;

export const editState = {
  editMode: false,
  editingRecipeId: null,
};


if(module.hot){
  module.hot.accept();
}

const recipeContainer = document.querySelector('.recipe');
const authModal = document.querySelector('.auth-modal');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const logoutBtn = document.getElementById('logout-btn');


const showAuthModal = function () {
  authModal.classList.remove('hidden'); 
};


const hideAuthModal = function () {
  authModal.classList.add('hidden'); 
};


const initAuthModal = function () {
  showAuthModal();
}
const loginTab = document.querySelector('.login-tab');
  const registerTab = document.querySelector('.register-tab');
  const closeBtn = document.querySelector('.auth-close-btn');

  // Tab click handlers
  loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
  });

  registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  });


const controlRecipe = async function() {
  try {
     const id = Number(window.location.hash.slice(1)); // Convert ID to number
     if (!id) return;
     recipeView.spinner();

     // Load the recipe data
     await model.loadRecipe(id);
     recipeView.render(model.state.recipe);
     recipeView.addRatingHandler(controlRating);

  } catch (error) {
    console.log(error)
     recipeView.renderError(); 
  }
};

const controlSearchResults = async function () {
  try{
      const query = searchView.getQuery();
      if(!query) return
      resultsView.spinner();

      await model.loadSearchResults(query)
      resultsView.render(model.getSearchResultsPage(1))

      paginationView.render(model.state.search)

  }
  catch(error){
      console.log(error)
  }
}

const controlPagination = function(goPage){
  resultsView.render(model.getSearchResultsPage(goPage))
  paginationView.render(model.state.search)
}

const controlServing = function (newServing){
  model.updateServing(newServing);
  recipeView.update(model.state.recipe)
}

const controlBookmark = function(){
  if(!model.state.recipe.bookmarks)
    model.addBookmark(model.state.recipe);
  else 
    model.deleteBookmark(model.state.recipe.id);
  recipeView.update(model.state.recipe)

  bookmarksView.render(model.state.bookmarks)
}

const controlBookmarks = function (){
  bookmarksView.render(model.state.bookmarks)
}

function showGlobalMessage(message, duration = 2000) {
  const toast = document.querySelector('.global-toast'); 
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), duration);
}




const controlAddRecipe = async function (newRecipe) {
  console.log('editMode =', editMode);
  console.log('editingRecipeId =', editingRecipeId);
  try {
  if (editMode) {
    await model.updateRecipe(editingRecipeId, newRecipe);
      editMode = false;
      editingRecipeId = null;
      addRecipeView.toggleWindow();
      showGlobalMessage('Recipe updated successfully!');
      
      recipeView.render(model.state.recipe);
  } else {  
      await model.uploadRecipe(newRecipe);
      addRecipeView.toggleWindow();
      recipeView.render(model.state.recipe);
  
    } } catch (error) {
      console.error(error);
      addRecipeView.toggleWindow();
      alert(error.message);  
      showGlobalMessage(`Error: ${error.message}`, 3000);
    }
  };
  
  



const controlDeleteRecipe = async function() {
  try {
    // Delete the recipe from the model and await its completion
    await model.deleteRecipe(model.state.recipe.id);

    // Update the UI (remove the recipe from the screen)
    recipeView.renderMessage('Recipe deleted successfully!');
    window.location.hash = ''; // Optionally, reset the hash to navigate away

    // Optionally, you can refresh the search results or bookmarks if needed
    resultsView.render(model.getSearchResultsPage());
    bookmarksView.render(model.state.bookmarks);
  } catch (err) {
    console.error('Error deleting recipe:', err);
    recipeView.renderError('Could not delete recipe');
  }
}

registerForm.addEventListener('submit', e => {
  e.preventDefault();

  // Retrieve inputs
  const nameInput = document.getElementById('reg-name');
  const emailInput = document.getElementById('reg-email');
  const passwordInput = document.getElementById('reg-password');

  // Retrieve checkboxes
  const chefCheckbox = document.getElementById('register-chef');
  const allergicCheckbox = document.getElementById('register-allergicToPeanuts');
  const vegetarianCheckbox = document.getElementById('register-vegetarian');
  const glutenCheckbox = document.getElementById('register-glutenSensitive');

  if (!nameInput || !emailInput || !passwordInput) {
    alert('Registration form elements are missing.');
    return;
  }

  const name = nameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  // Convert checkbox values to booleans
  const chef = chefCheckbox ? chefCheckbox.checked : false;
  const allergicToPeanuts = allergicCheckbox ? allergicCheckbox.checked : false;
  const vegetarian = vegetarianCheckbox ? vegetarianCheckbox.checked : false;
  const glutenSensitive = glutenCheckbox ? glutenCheckbox.checked : false;

  // Log the payload for debugging
  const payload = {
    name,
    email,
    password,
    chef,
    allergicToPeanuts,
    vegetarian,
    glutenSensitive,
  };
  console.log('Registration payload:', JSON.stringify(payload));

  fetch('http://localhost:3000/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
    .then(response => {
      if (!response.ok) throw new Error('Registration failed.');
      return response.json();
    })
    .then(data => {
      alert('Registration successful! You can now log in.');
      registerForm.reset();
      hideAuthModal();
    })
    .catch(err => {
      console.error(err);
      alert('Registration error: ' + err.message);
    });
});

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;

  fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(errData => { throw errData; });
    }
    return response.json();
  })
  .then(data => {
    console.log('Logged in:', data);
    alert('Login successful!');

    // Save the user's data in the model
    model.state.user = {
      id: data.data.id,
      name: data.data.name,
      email: data.data.email,
      chef: data.data.chef,  
      allergicToPeanuts: data.data.allergicToPeanuts,
      vegetarian: data.data.vegetarian,
      glutenSensitive: data.data.glutenSensitive,
    };

    model.loadUserBookmarks();
    bookmarksView.render(model.state.bookmarks);
    loginForm.reset();
    hideAuthModal();
  })
  .catch(err => {
    console.error('Login error:', err);
    alert('Invalid credentials, please try again.');
  });
});


document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logout-btn');

 
  const isLoggedIn = true; 

  if (isLoggedIn) {
    //logoutBtn.classList.remove('hidden');
  }

  logoutBtn.addEventListener('click', () => {
    window.location.hash = '';
    recipeView.render();
    resultsView.clearResults();


    // Show the auth modal again
    showAuthModal();

    const loginTab = document.querySelector('.login-tab');
    const registerTab = document.querySelector('.register-tab');
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.register-form');
    
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
  
    //alert
    alert('You have been logged out. Please log in again.');
  });
});


window.addEventListener('load', () => {
  if (!model.state.user.email) {
    initAuthModal();
  }
});

const ingredientsContainer = document.querySelector('.ingredients-container');
const addIngredientBtn = document.querySelector('#add-ingredient-btn');
export const ing = {
  ingredientCount: 6,
};
export const defaultIngredientsHTML = `
  <label>Ingredient 1</label>
  <input type="text" name="ingredient1" placeholder="Format: 'Quantity,Unit,Description'" required />
  <label>Ingredient 2</label>
  <input type="text" name="ingredient2" placeholder="Format: 'Quantity,Unit,Description'" />
  <label>Ingredient 3</label>
  <input type="text" name="ingredient3" placeholder="Format: 'Quantity,Unit,Description'" />
  <label>Ingredient 4</label>
  <input type="text" name="ingredient4" placeholder="Format: 'Quantity,Unit,Description'" />
  <label>Ingredient 5</label>
  <input type="text" name="ingredient5" placeholder="Format: 'Quantity,Unit,Description'" />
  <label>Ingredient 6</label>
  <input type="text" name="ingredient6" placeholder="Format: 'Quantity,Unit,Description'" />
`;

addIngredientBtn.addEventListener('click', () => {
  ing.ingredientCount++;
  
  const newLabel = document.createElement('label');
  newLabel.textContent = `Ingredient ${ing.ingredientCount}`;
  newLabel.setAttribute('for', `ingredient${ing.ingredientCount}`);

  const newInput = document.createElement('input');
  newInput.type = 'text';
  newInput.name = `ingredient${ing.ingredientCount}`;
  newInput.id = `ingredient${ing.ingredientCount}`;
  newInput.placeholder = "Format: 'Quantity,Unit,Description'";

  ingredientsContainer.appendChild(newLabel);
  ingredientsContainer.appendChild(newInput);
});


function controlEditRecipe() {
  editMode = true;
  editingRecipeId = model.state.recipe.id;
  addRecipeView.populateForm(model.state.recipe);
  addRecipeView.toggleWindow();
}

document.querySelectorAll('.recipe-rating .star').forEach(star => {
  star.addEventListener('click', function () {
    const rating = parseInt(this.dataset.value, 10);
    document.querySelectorAll('.recipe-rating .star').forEach(s => {
      if (parseInt(s.dataset.value, 10) <= rating) {
        s.classList.add('filled');
        s.innerHTML = '&#9733;'; 
      } else {
        s.classList.remove('filled');
        s.innerHTML = '&#9734;';
      }
    });
    console.log(`User rated the recipe: ${rating} stars`);
  });
});

let lastRatingTime=0;
const controlRating = async function(rating) {
  const now = Date.now();
  if (now - lastRatingTime < 15000) {
    alert("You have already rated this recipe.");
    return;
  }
  lastRatingTime = now;
  try {
    const recipeId = model.state.recipe.id;
    const response = await fetch(`${API_URL}/api/recipes/${recipeId}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating }),
    });
    if (!response.ok) {
      // If the response is not OK, extract the error message and throw an error
      const errorData = await response.json();
      throw new Error(errorData.error || 'Rating update failed');
    }
    const data = await response.json();
    console.log(`Recipe rated: ${data.data.averageRating} based on ${data.data.ratingCount} votes`);
    // Update your state with the new rating values
    model.state.recipe.averageRating = data.data.averageRating;
    model.state.recipe.ratingCount = data.data.ratingCount;
    recipeView.update(model.state.recipe);
  } catch (err) {
    console.error('Rating error:', err);
  }
};


let isInitialized = false;

const init = function () {
  if (isInitialized) return; // Prevent multiple initializations
  isInitialized = true;
  window.addEventListener('hashchange', controlRecipe);
  window.addEventListener('load', controlRecipe);
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipe);
  recipeView.addHandlerServing(controlServing);
  recipeView.addHandlerBookmark(controlBookmark);
  recipeView.addHandlerDelete(controlDeleteRecipe);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  recipeView.addHandlerEdit(controlEditRecipe);
 // model.clearBookmarks();
}

init();

