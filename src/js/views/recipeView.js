import View from './View.js'
import * as model from '../model.js';
import icons from 'url:../../img/icons.svg';
import Fraction from 'fractional';

class RecipeView extends View{
    _parentElement = document.querySelector('.recipe');
    _errorMessage = 'we could not find the recipe, please try another.'
    _message = '';

      addHandlerRender(handler) {
        window.addEventListener('hashchange',handler);
        window.addEventListener('load',handler);
      }

      addHandlerServing(handler){
        this._parentElement.addEventListener('click', function(e){
          const btn = e.target.closest('.btn--increase-servings')
          if(!btn) return;
          console.log(btn)
          const updateTo = +btn.dataset.updateTo;
          if(updateTo > 0)
          handler(updateTo);
        })
      }

      addHandlerBookmark(handler){
        this._parentElement.addEventListener('click', function(e){
          const btn = e.target.closest('.btn--bookmark');
          if(!btn) return;
          handler();
        })
      }

      addHandlerDelete(handler) {
  this._parentElement.addEventListener('click', function (e) {
    const btn = e.target.closest('.btn--delete-recipe');
    if (!btn) return;
    handler();
  });
}

addHandlerEdit(handler) {
  this._parentElement.addEventListener('click', function(e) {
    const btn = e.target.closest('.btn--edit-recipe');
    if (!btn) return;
    handler();
  });
}

addRatingHandler(handler) {
  this._parentElement.addEventListener('click', function (e) {
    const star = e.target.closest('.recipe-rating .star');
    if (!star) return;
    const rating = parseInt(star.dataset.value, 10);
    handler(rating);
  });
}


    _generateMarkup(){
      const admin ='cookit@gmail.com';
      const isOwner = this._data.userEmail === model.state.user.email;
      const isOwnerOrAdmin =model.state.user.email == admin || this._data.userEmail === model.state.user.email;
      const isOwnerOrChef =
  this._data.userEmail === model.state.user.email ||
  model.state.user.chef === 2 || model.state.user.email == admin;
  console.log(model.state.user.chef);
        return `
        <figure class="recipe__fig">
              <img src=${this._data.image} alt=${this._data.title} class="recipe__img" />
              <h1 class="recipe__title">
                <span>${this._data.title}</span>
              </h1>
            </figure>
    
            <div class="recipe__details">
              <div class="recipe__info">
                <svg class="recipe__info-icon">
                  <use href="${icons}#icon-clock"></use>
                </svg>
                <span class="recipe__info-data recipe__info-data--minutes">${this._data.cookingTime}</span>
                <span class="recipe__info-text">minutes</span>
              </div>
              <div class="recipe__info">
                <svg class="recipe__info-icon">
                  <use href="${icons}#icon-users"></use>
                </svg>
                <span class="recipe__info-data recipe__info-data--people">${this._data.servings}</span>
                <span class="recipe__info-text">servings</span>
    
                <div class="recipe__info-buttons">
                  <button class="btn--tiny btn--increase-servings" data-update-to="${this._data.servings - 1}">
                    <svg>
                      <use href="${icons}#icon-minus-circle"></use>
                    </svg>
                  </button>
                  <button class="btn--tiny btn--increase-servings" data-update-to="${this._data.servings + 1}">
                    <svg>
                      <use href="${icons}#icon-plus-circle"></use>
                    </svg>
                  </button>
                </div>
              </div>
              ${isOwner ? `
                <div class="recipe__user-generated">
                  <svg>
                    <use href="${icons}#icon-user"></use>
                  </svg>
                </div>
              ` : ''}
              
              <button class="btn--round btn--bookmark">
                <svg class="">
                  <use href="${icons}#icon-bookmark${this._data.bookmarks ? '-fill' : ''}"></use>
                </svg>
              </button>
            </div>
    
            <div class="recipe__ingredients">
              <h2 class="heading--2">Recipe ingredients</h2>
              <ul class="recipe__ingredient-list">
              ${this._data.ingredients.map(this._generateMarkupIngrediant).join('')}
               
            </div>
    
            <div class="recipe__directions">
              <h2 class="heading--2">How to cook it</h2>
              <p class="recipe__directions-text">
               <span>${this._data.howToMake}</span>
               <br></br>
                This recipe was carefully designed and tested by
                <span class="recipe__publisher">${this._data.publisher}</span>. 
              </p>
            <div class="recipe__rating">
              <p>Rating: ${this._data.averageRating.toFixed(1)} stars (${this._data.ratingCount} votes)</p>
              <div class="recipe-rating">
                <span data-value="1" class="star ${this._data.averageRating >= 1 ? 'filled' : ''}">&#9733;</span>
                <span data-value="2" class="star ${this._data.averageRating >= 2 ? 'filled' : ''}">&#9733;</span>
                <span data-value="3" class="star ${this._data.averageRating >= 3 ? 'filled' : ''}">&#9733;</span>
                <span data-value="4" class="star ${this._data.averageRating >= 4 ? 'filled' : ''}">&#9733;</span>
                <span data-value="5" class="star ${this._data.averageRating >= 5 ? 'filled' : ''}">&#9733;</span>
              </div>
            </div>


            <br> </br>

        <div class="recipe__actions">
    ${isOwnerOrAdmin ? `
      <button class="btn--round btn--delete-recipe">
        <svg>
          <use href="${icons}#icon-trash"></use>
        </svg>
      </button>
    ` : ''}
    ${isOwnerOrChef ? `
      <button class="btn--round btn--edit-recipe">
        <svg>
          <use href="${icons}#icon-edit"></use>
        </svg>
      </button>
    ` : ''}
  </div>

        `;
    }

    _generateMarkupIngrediant(ingredient){
            return `
              <li class="recipe__ingredient">
                <svg class="recipe__icon" style="color: #f38293;">
                  <use href="${icons}#icon-check"></use>
                </svg>
                <div class="recipe__quantity">${ingredient.quantity || ''}</div>
                <div class="recipe__description">
                  <span class="recipe__unit">${ingredient.unit || ''}</span>
                  ${ingredient.description || ''}
                </div>
              </li>
              `;
          }
          
          addRatingHandler(handler) {
            const ratingContainer = this._parentElement.querySelector('.recipe-rating');
            if (!ratingContainer) return;
            ratingContainer.addEventListener('click', function(e) {
              const star = e.target.closest('.star');
              if (!star) return;
              const rating = parseInt(star.dataset.value, 10);
              handler(rating);
            });
          }
          
          
          
    
}

export default new RecipeView();