'use strict';
const uploadButton = document.querySelector('.uploader__input');
uploadButton.addEventListener('change', travelsUpload);
let totalOrderPrice = 0;
let summaryItemCounter = 0;

function travelsUpload(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (renderEvent) {
      const fileContent = renderEvent.target.result;
      const lines = fileContent.split('\n');
      let objArr = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === '') continue;
        const values = line.split(',');
        const rowData = {
          id: Number(values[0].replace(/"/g, '')),
          title: values[1].replace(/"/g, ''),
          description: values
            .slice(2, -2)
            .map((value) => value.replace(/"/g, '')),
          adultPrice: Number(values[values.length - 2].match(/\d+/)[0]),
          childPrice: Number(values[values.length - 1].match(/\d+/)[0]),
        };
        objArr.push(rowData);
      }
      const travelList = document.querySelector('.panel__excursions');
      objArr.forEach(function (travel) {
        travelList.innerHTML += `
         <li class="excursions__item excursions__item--prototype">
         <header class="excursions__header">
         <h2 class="excursions__title">${travel.title}</h2>
         <p class="excursions__description">${travel.description}</p>
          </header>
          <form class="excursions__form">
            <div class="excursions__field">
              <label class="excursions__field-name">
                Dorosły: <span class="excursions__price--adult">${travel.adultPrice}</span> PLN x
                <input class="excursions__field-input" name="adults" />
              </label>
              </div>
              <div class="excursions__field">
              <label class="excursions__field-name">
              Dziecko: <span class="excursions__price--children">${travel.childPrice}</span> PLN x
              <input class="excursions__field-input" name="children" />
              </label>
              </div>
              <div class="excursions__field excursions__field--submit">
              <input
              class="excursions__field-input excursions__field-input--submit"
              value="dodaj do zamówienia"
              type="submit"
              />
              </div>
              </form>
              </li>
              `;
      });
      const travelForms = document.querySelectorAll('.excursions__form');

      travelForms.forEach(function (form) {
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          const adultsInput = form.querySelector('input[name="adults"]');
          const childrenInput = form.querySelector('input[name="children"]');
          const adultPrice = form.querySelector(
            'span.excursions__price--adult'
          );
          const childPrice = form.querySelector(
            'span.excursions__price--children'
          );
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
          }
          summaryItemCounter++;
        });
      });
    };
    reader.readAsText(file);
  }
}

document
  .querySelector('.panel__summary')
  .addEventListener('click', function (e) {
    e.preventDefault();
    const clickedElement = e.target;
    if (clickedElement.classList.contains('summary__btn-remove')) {
      const summaryItemID = clickedElement.closest('.summary__item').id;
      removeSummaryItem(summaryItemID);
    }
  });

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
