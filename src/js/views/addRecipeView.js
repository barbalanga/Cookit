import View from './View.js';
import icons from 'url:../../img/icons.svg';
import { editState, defaultIngredientsHTML, ing } from '../controller.js';

class AddRecipeView extends View {
  _parentElement = document.querySelector('.upload__content');

  _formElement = document.querySelector('.upload');

  _message = 'Recipe was successfully uploaded';
  _window = document.querySelector('.add-recipe-window');
  _overlay = document.querySelector('.overlay');
  _openBtn = document.querySelector('.nav__btn--add-recipe');
  _closeBtn = document.querySelector('.btn--close-modal');

  constructor() {
    super();
    this._addHandlerShowWindow();
    this._addHandlerCloseWindow();
    this._ingredientsContainer = document.querySelector('.ingredients-container');

  }

  // Show/hide the add-recipe modal
  toggleWindow() {
    console.log('toggleWindow called');
    this._overlay.classList.toggle('hidden');
    this._window.classList.toggle('hidden');

    //closing the modal
    if (this._window.classList.contains('hidden')) {
      console.log('Modal closed, clearing messages & resetting form');
      this.clearMessage();           
      this._formElement.reset();     
    } else {
      console.log('Modal opened');
    }
  }


  clearMessage() {
    const existingMessage = this._window.querySelector('.message');
    if (existingMessage) existingMessage.remove();

    const existingError = this._window.querySelector('.error');
    if (existingError) existingError.remove();
  }


_addHandlerShowWindow() {
  this._openBtn.addEventListener('click', () => {
    editState.editMode = false;
    editState.editingRecipeId = null;
    this._ingredientsContainer.innerHTML = defaultIngredientsHTML;
    ing.ingredientCount = 6;
    this.toggleWindow();
  });
}


  // Attach the click to close the modal
  _addHandlerCloseWindow() {
    // 2) Actually attach the click listeners:
    this._closeBtn.addEventListener('click', () => {
      // Then close the modal
      this.toggleWindow();
    });

    this._overlay.addEventListener('click', () => {
      this.toggleWindow();
    });
  }

  // The critical part: listen to 'submit' on the real <form>
  addHandlerUpload(handler) {
    this._formElement.addEventListener('submit', async e => {
      console.log('FORM SUBMIT event fired'); // debug
      e.preventDefault();
      console.log('Add Recipe Form Submitted'); // debug

      // Gather form data from the real <form>
      const dataArr = [...new FormData(this._formElement)];
      const data = Object.fromEntries(dataArr);

      await handler(data);
    });
  }

  // Renders spinner inside .upload__content only
  spinner() {
    const markup = `
      <div class="spinner">
        <svg>
          <use href="${icons}#icon-loader"></use>
        </svg>
      </div>
    `;
    // Only clear .upload__content (NOT the form fields)
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  populateForm(recipe) {
    // Title
    document.querySelector('[name="title"]').value = recipe.title;
    // howToMake
    document.querySelector('[name="howToMake"]').value = recipe.howToMake;
    // image
    document.querySelector('[name="image"]').value = recipe.image;
    // publisher
    document.querySelector('[name="publisher"]').value = recipe.publisher;
    // cookingTime
    document.querySelector('[name="cookingTime"]').value = recipe.cookingTime;
    // servings
    document.querySelector('[name="servings"]').value = recipe.servings;
  
    // Ingredients
    // e.g. if recipe.ingredients is an array like [{quantity: 0.5, unit: 'kg', description: 'Rice'}, ...]
    // We'll fill them in the form's 'ingredient1', 'ingredient2', etc.
    recipe.ingredients.forEach((ing, i) => {
      const field = document.querySelector(`[name="ingredient${i+1}"]`);
      if (!field) return;  // if the form doesn't have that many ingredient fields
      field.value = `${ing.quantity || ''},${ing.unit || ''},${ing.description || ''}`;
    });
  }
  
  renderMessage(message = this._message) {
    const existingMessage = this._window.querySelector('.message');
    if (existingMessage) existingMessage.remove();
    const existingSpinner = this._window.querySelector('.spinner');
    if (existingSpinner) existingSpinner.remove();

    const markup = `
      <div class="message">
        <div>
          <svg>
            <use href="${icons}#icon-smile"></use>
          </svg>
        </div>
        <p>${message}</p>
      </div>
    `;
    // Insert at top of modal
    this._window.insertAdjacentHTML('afterbegin', markup);
  }

  renderError(message = this._errorMessage) {
    const existingError = this._window.querySelector('.error');
    if (existingError) existingError.remove();
    const existingSpinner = this._window.querySelector('.spinner');
    if (existingSpinner) existingSpinner.remove();

    const markup = `
      <div class="error">
        <div>
          <svg>
            <use href="${icons}#icon-alert-triangle"></use>
          </svg>
        </div>
        <p>${message}</p>
      </div>
    `;
    // Insert at top of modal
    this._window.insertAdjacentHTML('afterbegin', markup);
  }
}

export default new AddRecipeView();
