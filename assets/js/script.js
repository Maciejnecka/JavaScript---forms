'use strict';
const uploadButton = document.querySelector('.uploader__input');
uploadButton.addEventListener('change', travelsUpload);

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
                Dorosły: <span class="excursions__price">${travel.adultPrice}</span> PLN x
                <input class="excursions__field-input" name="adults" />
              </label>
              </div>
              <div class="excursions__field">
              <label class="excursions__field-name">
              Dziecko: <span class="excursions__price">${travel.childPrice}</span> PLN x
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
    };
    reader.readAsText(file);
  }
}
