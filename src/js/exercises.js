import { getFilter, getExercises, getExercisesById } from './fitnesapi';
import { openExerciseModal } from './modal';
import { capitalizeFirstLetter } from './helpers/string_utils';
import icons from '../img/icons.svg';
const refs = {
  musclesBtn: document.querySelector('.muscles-btn'),
  bodyPartsBtn: document.querySelector('.body-parts-btn'),
  equipmentBtn: document.querySelector('.equipment-btn'),
  paginationFilter: document.querySelector('.pagination-filter'),
  exercisesTitle: document.querySelector('.exercises-title-filter'),
  exercisesList: document.querySelector('.exercises-list'),
  filterList: document.querySelector('.filter-list'),
  searchForm: document.querySelector('.search-form'),
  removeBtn: document.querySelector('.remove-btn'),
  searchInput: document.querySelector('.search-exercise-input'),
  loader: document.querySelector('.loader'),
  exercisesSection: document.querySelector('.exercises-section'),
};
refs.musclesBtn.addEventListener('click', () =>
  onFilterClick(refs.musclesBtn, 'Muscles')
);
refs.bodyPartsBtn.addEventListener('click', () =>
  onFilterClick(refs.bodyPartsBtn, 'Body parts')
);
refs.equipmentBtn.addEventListener('click', () =>
  onFilterClick(refs.equipmentBtn, 'Equipment')
);
window.addEventListener('load', () =>
  onFilterClick(refs.musclesBtn, 'Muscles')
);
refs.removeBtn.addEventListener('click', e => {
  e.preventDefault();
  onRemoveInputValue(refs.searchInput);
});
refs.searchForm.addEventListener('submit', onExercisesSearch);
refs.searchInput.addEventListener('input', () => {
  if (refs.searchInput.value.trim() !== '') {
    refs.removeBtn.style.display = 'block';
  } else {
    refs.removeBtn.style.display = 'none';
  }
});
let currentPage = 1;
let totalPages = 1;
function renderMarkup(data) {
  refs.searchForm.style.display = 'none';
  const markup = data
    .map(
      item => `
    <li class="filter-list-item"  data-filter="${item.filter}" data-name="${item.name}">
      <img src="${item.imgUrl}" />
      <div class="overlay">
        <p class="filter-list-item-name">${item.name}</p>
        <p class="filter-name">${item.filter}</p>
      </div>
    </li>`
    )
    .join('');
  refs.filterList.innerHTML = markup;
  data.forEach(item => attachClickEventToItem(item));
}
function renderPaginationButton(i, filter) {
  const button = document.createElement('button');
  button.classList.add('pagination-btn');
  button.innerText = i;
  button.addEventListener('click', event => onPageClick(i, filter, event));
  return button;
}
function renderPagination(filter) {
  const paginationFilter = refs.paginationFilter;
  if (totalPages > 1) {
    paginationFilter.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const button = renderPaginationButton(i, filter);
      paginationFilter.appendChild(button);
    }
    const activeButton = paginationFilter.querySelector(
      `.pagination-btn:nth-child(${currentPage})`
    );
    if (activeButton) {
      activeButton.classList.add('active');
    }
  } else {
    paginationFilter.innerHTML = '';
  }
}
async function onPageClick(page, filter, event) {
  const clickedButton = event.currentTarget;
  const currentActiveButton = document.querySelector('.pagination-btn.active');
  if (currentActiveButton) {
    currentActiveButton.classList.remove('active');
  }
  clickedButton.classList.add('active');
  currentPage = page;
  refs.exercisesList.innerHTML = '';
  refs.filterList.innerHTML = '';
  refs.loader.style.display = 'block';
  try {
    const { data } = await getFilter(filter, currentPage);
    refs.exercisesSection.scrollIntoView({ behavior: 'smooth' });
    renderMarkup(data.results);
  } catch (error) {
    console.log(error);
  } finally {
    refs.loader.style.display = 'none';
  }
}
async function onFilterClick(clickedBtn, filter) {
  currentPage = 1;
  refs.exercisesTitle.innerHTML = '';
  refs.filterList.innerHTML = '';
  refs.exercisesList.innerHTML = '';
  refs.loader.style.display = 'block';
  document
    .querySelectorAll('.exercises-btn')
    .forEach(btn => btn.classList.remove('active'));
  clickedBtn.classList.add('active');
  try {
    const { data, fetchedPage, fetchedTotalPages } = await getFilter(filter);
    currentPage = fetchedPage;
    totalPages = fetchedTotalPages;
    renderMarkup(data.results);
    renderPagination(filter);
  } catch (error) {
    console.log(error);
  } finally {
    refs.loader.style.display = 'none';
  }
}
async function onItemClickGetExercises(filterListItem) {
  let filter = filterListItem.dataset.filter.toLowerCase();
  if (filter === 'body parts') {
    filter = 'bodypart';
  }
  const value = filterListItem.dataset.name;
  refs.exercisesTitle.innerHTML = ` /<span class="exercises-title-grey"> ${value}</span>`;
  let page = 1;
  refs.filterList.innerHTML = '';
  refs.exercisesList.innerHTML = '';
  refs.loader.style.display = 'block';
  try {
    const data = await getExercises(page, filter, value);
    renderMarkupExrcises(data.results);
    renderExercisesPagination(data.totalPages, filter, value);
  } catch (error) {
    console.log(error);
  } finally {
    refs.loader.style.display = 'none';
  }
}
function renderExercisesPagination(totalPages, filter, value, keyword) {
  const paginationExercises = refs.paginationFilter;
  if (totalPages > 1 && totalPages <= 3) {
    paginationExercises.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const button = renderPaginationButtonExercises(i, filter, value, keyword);
      if (i === 1) {
        button.classList.add('active');
      }
      paginationExercises.appendChild(button);
    }
  } else if (totalPages > 3) {
    totalPages = 3;
    paginationExercises.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const button = renderPaginationButtonExercises(i, filter, value, keyword);
      if (i === 1) {
        button.classList.add('active');
      }
      paginationExercises.appendChild(button);
    }
  } else {
    paginationExercises.innerHTML = '';
  }
}
function renderPaginationButtonExercises(i, filter, value, keyword) {
  const button = document.createElement('button');
  button.classList.add('pagination-btn');
  button.innerText = i;
  button.addEventListener('click', event =>
    onPageClickExercises(i, filter, event, value, keyword)
  );
  return button;
}
async function onPageClickExercises(page, filter, event, value, keyword) {
  const clickedButton = event.currentTarget;
  const currentActiveButton = document.querySelector('.pagination-btn.active');
  if (currentActiveButton) {
    currentActiveButton.classList.remove('active');
  }
  clickedButton.classList.add('active');
  refs.exercisesList.innerHTML = '';
  refs.loader.style.display = 'block';
  try {
    const data = await getExercises(page, filter, value, keyword);
    refs.exercisesSection.scrollIntoView({ behavior: 'smooth' });
    renderMarkupExrcises(data.results);
  } catch (error) {
    console.log(error);
  } finally {
    refs.loader.style.display = 'none';
  }
}
function renderMarkupExrcises(data) {
  refs.searchForm.style.display = 'block';
  const markup = data
    .map(
      item => `
   <li class="exe-info-list-item" data-id="${item._id}">
        <div class="item-top-container">
          <div class="icon-star-container">
            <p class="workout">workout</p>
            <p class="rating">${Math.round(item.rating) + '.0'}</p>
              <svg class="icon-star-svg" width="18" height="18">
                <use href="${icons}#icon-star-full"></use>
              </svg>
           </div>
            <a href="#" class="icon-arrow-container >
            <p class="exe-top-text">Start</p>
              <svg class="icon-arrow-svg" width="13" height="13">
                <use href="${icons}#icon-right-sm-arrow"></use>
              </svg>
            </a>
        </div>
        <div class="item-middle-container">
          <svg class="icon-run-svg" width="32" height="32">
            <use href="${icons}#icon-run"></use>
          </svg>
          <h3 class="exe-card-title">${capitalizeFirstLetter(item.name)}</h3>
        </div>
        <div class="item-bottom-container">
            <p class="bottom-info-text">
              <span class="bottom-span-text">Burned calories:</span> ${
                item.burnedCalories
              } / ${item.time} min
            </p>
            <p class="bottom-info-text">
              <span class="bottom-span-text">Body part:</span> ${capitalizeFirstLetter(
                item.bodyPart
              )}
            </p>
            <p class="bottom-info-text">
              <span class="bottom-span-text">Target:</span> ${capitalizeFirstLetter(
                item.target
              )}
            </p>
        </div>
    </li>`
    )
    .join('');
  refs.exercisesList.innerHTML = markup;
  refs.exercisesList.addEventListener('click', onExercisesClick);
}
// function capitalizeFirstLetter(text) {
//   return text.charAt(0).toUpperCase() + text.slice(1);
// }
function attachClickEventToItem(item) {
  const filterListItem = document.querySelector(
    `[data-filter="${item.filter}"][data-name="${item.name}"]`
  );
  filterListItem.addEventListener('click', () =>
    onItemClickGetExercises(filterListItem)
  );
}
function onExercisesSearch(event) {
  event.preventDefault();
  refs.removeBtn.style.display = 'none';
  const keyword = refs.searchInput.value.trim().toLowerCase();
  if (keyword !== '') {
    let filter = document
      .querySelector('.exercises-btn.active')
      .textContent.toLowerCase()
      .trim();
    if (filter === 'body parts') {
      filter = 'bodypart';
    }
    const value = refs.exercisesTitle.textContent.slice(3).toLowerCase().trim();
    console.log(value);
    filterExercisesBySearch(filter, value, keyword);
  }
}
function onRemoveInputValue(inputField) {
  inputField.value = '';
  refs.removeBtn.style.display = 'none';
}
async function filterExercisesBySearch(filter, value, keyword) {
  if (keyword === '') {
    return;
  }
  refs.exercisesList.innerHTML = '';
  refs.loader.style.display = 'block';
  let page = 1;
  try {
    const data = await getExercises(page, filter, value, keyword);
    if (data.results.length !== 0) {
      renderMarkupExrcises(data.results);
      renderExercisesPagination(data.totalPages, filter, value, keyword);
    } else {
      refs.paginationFilter.innerHTML = '';
      refs.exercisesList.innerHTML = `<li class="not-found-results"><p class="message-not-found-results">Unfortunately, <span class="no-results-grey">no results</span> were found. You may want to consider other search options to find the exercise you are looking for. Our range is wide and you have the opportunity to find more options that suit your needs.</p></li>`;
    }
  } catch (error) {
    console.log(error);
  } finally {
    refs.searchForm.reset();
    refs.loader.style.display = 'none';
  }
}
function onExercisesClick(event) {
  event.preventDefault();
  const isArrowIcon = event.target.closest('.icon-arrow-container');
  if (isArrowIcon) {
    const exerciseItem = event.target.closest('[data-id]');
    if (exerciseItem) {
      const exerciseId = exerciseItem.dataset.id;
      onArrowClick(exerciseId);
    }
  }
}
async function onArrowClick(exerciseId) {
  try {
    const exerciseDetails = await getExercisesById(exerciseId);
    openExerciseModal(exerciseDetails);
  } catch (error) {
    console.log(error);
  }
}
