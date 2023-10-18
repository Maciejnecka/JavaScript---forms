'use strict';
document.addEventListener('DOMContentLoaded', init);

const ulEl = document.querySelector('.order__errors-list');
const formEl = document.querySelector('form');
const uploadButton = document.querySelector('.uploader__input');
const summaryEl = document.querySelector('.panel__summary');

let totalOrderPrice = 0;
let summaryItemCounter = 0;

function init() {
  if (formEl) {
    formEl.addEventListener('submit', handleSubmit);
  }
  uploadButton.addEventListener('change', travelsUpload);
  summaryEl.addEventListener('click', handleSummaryClick);
}

function handleSubmit(e) {
  e.preventDefault();
  const errors = getFormErrors();
  ulEl.innerHTML = '';
  if (errors.length === 0) {
    handleSuccessfulSubmit();
  } else {
    displayErrors(errors);
  }
}

function getFormErrors() {
  const errors = [];
  const fields = [
    {
      name: 'name',
      label: 'Imię i nazwisko',
      required: true,
    },
    {
      name: 'email',
      label: 'Email',
      required: true,
      pattern: '@',
    },
  ];

  if (totalOrderPrice === 0) {
    errors.push('Nie można złożyć zamówienia. Proszę wybrać bilet.');
    formEl.elements['name'].value = '';
    formEl.elements['email'].value = '';
  }
  fields.forEach(function (field) {
    const value = formEl.elements[field.name].value;
    if (field.required) {
      if (value.length === 0) {
        errors.push('Dane w polu ' + field.label + ' są wymagane.');
      }
    }
    if (field.pattern) {
      const reg = new RegExp(field.pattern);
      if (!reg.test(value)) {
        errors.push(
          'Dane w polu ' +
            field.label +
            ' zawierają niedozwolone znaki, lub nie są zgodne z przyjętym w Polsce wzorem.'
        );
      }
    }
  });
  return errors;
}

function handleSuccessfulSubmit() {
  const orderPriceValue = document.querySelector('.order__total-price-value');
  const orderEmailContent = formEl.elements[1].value;
  alert(
    `Dziękujemy za złożenie zamówienia o wartości ${orderPriceValue.textContent}. Szczegóły zamówienia zostały wysłane na adres e-mail: ${orderEmailContent}`
  );
  resetFormAndSummary();
}

function displayErrors(errors) {
  errors.forEach(function (text) {
    const liEl = document.createElement('li');
    liEl.innerText = text;
    ulEl.appendChild(liEl);
  });
}

function resetFormAndSummary() {
  const fields = [
    {
      name: 'name',
      label: 'Imię i nazwisko',
    },
    {
      name: 'email',
      label: 'Email',
    },
  ];
  fields.forEach(function (el) {
    formEl[el.name].value = '';
  });
  const summaryOrder = document.querySelector('.panel__summary');
  const totalOrderPriceEl = document.querySelector('.order__total-price-value');

  summaryOrder.innerHTML = '';
  totalOrderPriceEl.textContent = '0 PLN';
  totalOrderPrice = 0;
}

function handleSummaryClick(e) {
  e.preventDefault();
  const clickedElement = e.target;
  if (clickedElement.classList.contains('summary__btn-remove')) {
    const summaryItemID = clickedElement.closest('.summary__item').id;
    removeSummaryItem(summaryItemID);
  }
}

function removeSummaryItem(itemID) {
  const summaryItem = document.getElementById(itemID);
  if (summaryItem) {
    const itemPrice = parseFloat(
      summaryItem.querySelector('.summary__total-price').textContent
    );
    summaryItem.parentNode.removeChild(summaryItem);
    totalOrderPrice -= itemPrice;

    const totalOrderPriceElement = document.querySelector(
      '.order__total-price'
    );
    totalOrderPriceElement.innerHTML = `Razem: <span class="order__total-price-value">${totalOrderPrice} PLN</span>`;
  }
}

function travelsUpload(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = processFileContents;
    reader.readAsText(file);
  }
}

function processFileContents(readerEvent) {
  const fileContent = readerEvent.target.result;
  const objArr = parseFileContent(fileContent);
  objArr.forEach(addTravelItemToDOM);
  document
    .querySelector('.panel__excursions')
    .addEventListener('submit', function (e) {
      e.preventDefault();
      handleExcursionFormSubmit(e);
    });
}

function parseFileContent(fileContent) {
  const lines = fileContent.split('\n');
  let objArr = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '') continue;
    const values = line.split(',');
    const rowData = {
      title: values[1].replace(/"/g, ''),
      description: values.slice(2, -2).map((value) => value.replace(/"/g, '')),
      adultPrice: Number(values[values.length - 2].match(/\d+/)[0]),
      childPrice: Number(values[values.length - 1].match(/\d+/)[0]),
    };
    objArr.push(rowData);
  }
  return objArr;
}

function handleExcursionFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  if (form.classList.contains('excursions__form')) {
    const adultsInput = form.querySelector('input[name="adults"]');
    const childrenInput = form.querySelector('input[name="children"]');
    const adultPrice = form.querySelector('span.excursions__price--adult');
    const childPrice = form.querySelector('span.excursions__price--children');
    const travelEl = form
      .closest('.excursions__item')
      .querySelector('.excursions__title');
    const travelTitle = travelEl.textContent;
    const numAdults = Number(adultsInput.value);
    const numChildren = Number(childrenInput.value);

    const totalPrice =
      numAdults * parseFloat(adultPrice.textContent) +
      numChildren * parseFloat(childPrice.textContent);

    const orderItem = {
      title: travelTitle,
      adultsAmmount: numAdults,
      adultPrice: adultPrice.textContent,
      childrenAmmount: numChildren,
      childPrice: childPrice.textContent,
      price: totalPrice,
    };
    const summaryItemID = `summary-item-${summaryItemCounter}`;
    const summaryOrder = document.querySelector('.panel__summary');
    if (orderItem.adultsAmmount > 0 || orderItem.childrenAmmount > 0) {
      summaryOrder.innerHTML += ` 
            <li class="summary__item summary__item--prototype" id="${summaryItemID}">
            <h3 class="summary__title">
            <span class="summary__name">${orderItem.title}</span>
              <strong class="summary__total-price">${orderItem.price} PLN</strong>
              <a href="" class="summary__btn-remove" title="usuń">X</a>
              </h3>
              <p class="summary__prices">dorośli: ${orderItem.adultsAmmount} x ${orderItem.adultPrice} PLN, dzieci: ${orderItem.childrenAmmount} x ${orderItem.childPrice} PLN</p>
              </li>
              `;
      const totalOrderPriceElement = document.querySelector(
        '.order__total-price'
      );
      totalOrderPrice += totalPrice;
      totalOrderPriceElement.innerHTML = `Razem: <span class="order__total-price-value">${totalOrderPrice} PLN</span>
          `;
      adultsInput.value = '';
      childrenInput.value = '';
    } else {
      alert('Proszę wybrać bilet!');
      adultsInput.value = '';
      childrenInput.value = '';
    }
    summaryItemCounter++;
  }
}

function addTravelItemToDOM(travel) {
  const travelList = document.querySelector('.panel__excursions');
  travelList.innerHTML += `
         <li class="excursions__item excursions__item--prototype">
         <header class="excursions__header">
         <h2 class="excursions__title">${travel.title}</h2>
         <p class="excursions__description">${travel.description}</p>
          </header>
          <form class="excursions__form">
            <div class="excursions__field">
              <label class="excursions__field-name">
                Dorosły: <span class="excursions__price--adult"> ${travel.adultPrice}</span> PLN 
                <input class="excursions__field-input" name="adults" />
              </label>
              </div>
              <div class="excursions__field">
              <label class="excursions__field-name">
              Dziecko: <span class="excursions__price--children"> ${travel.childPrice}</span> PLN 
              <input class="excursions__field-input" name="children" />
              </label>
              </div>
              <div class="excursions__field excursions__field--submit">
              <input
              class="excursions__field-input excursions__field-input--submit"
              value="Dodaj do zamówienia"
              type="submit"
              />
              </div>
              </form>
              </li>
              `;
}
