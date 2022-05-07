class PokemonCatalog {
  constructor() {
    this.cards = [];
    this.pageSize = 4;
    this.currentPage = 1;
    this.newCards = [];
    this.visibleCards = null;

    this.catalog = null;
    this.button = null;
    this.loader = null;
    this.search = null;
    this.info = null;
    this.images = null;
    this.searchButton = null;
    this.filter = null;
    this.filterButton = null;
    this.switchVisibilityButton = null;

    this.filterIsActive = null;

    this.API = "https://api.pokemontcg.io";
    this.API_VERSION = "v2";
    this.API_RESOURCE = "cards";

    this.API_ENDPOINT = `${this.API}/${this.API_VERSION}/${this.API_RESOURCE}`;

    this.UiSelectors = {
      content: "[data-content]",
      button: "[data-button]",
      loader: "[data-loader]",
      search: "search",
      card: "[data-card]",
      info: "[data-info]",
      images: ".card__image",
      searchButton: ".search__button",
      switchVisibilityButton: ".filter__toggle",
      filterButton: ".filter__button",
      filter: "[data-filter]",
    };
  }

  initializeCatalog() {
    this.catalog = document.querySelector(this.UiSelectors.content);
    this.button = document.querySelector(this.UiSelectors.button);
    this.loader = document.querySelector(this.UiSelectors.loader);
    this.search = document.getElementById(this.UiSelectors.search);
    this.info = document.querySelector(this.UiSelectors.info);
    this.searchButton = document.querySelector(this.UiSelectors.searchButton);
    this.filter = document.querySelector(this.UiSelectors.filter);
    this.filterbutton = document.querySelector(this.UiSelectors.filterButton);
    this.switchVisibilityButton = document.querySelector(
      this.UiSelectors.switchVisibilityButton
    );

    this.addEventListeners();
    this.pullCards();
    this.createForm("types");
    this.createForm("subtypes");
    this.createForm("supertypes");
    this.createForm("rarities");
  }

  addEventListeners() {
    this.button.addEventListener("click", () => this.pullCards());
    this.switchVisibilityButton.addEventListener("click", () => {
      this.switchVisibility();
    });
    this.searchButton.addEventListener("click", (event) => {
      event.preventDefault();
      this.filterCards();
    });
    this.filterbutton.addEventListener("click", (e) => {
      e.preventDefault();
      this.filterCardsByFiltering();
    });
  }

  async pullCards() {
    this.checkFiltering();
    let cards;
    this.toggleShowElement(this.loader, this.button);
    if (this.filterIsActive) {
      cards = await this.fetchData(
        `${
          this.API_ENDPOINT
        }?q=name:${this.search.value.toLowerCase()}*&pageSize=${
          this.pageSize
        } &page=${this.currentPage}`
      );
      document.querySelectorAll(".form__input").forEach((element) => {
        element.checked = false;
      });
    } else if (!this.filterIsActive && !this.checkboxsIsActive()) {
      cards = await this.fetchData(
        `${this.API_ENDPOINT}?page=${this.currentPage}&pageSize=${this.pageSize}`
      );
      document.querySelectorAll(".form__input").forEach((element) => {
        element.checked = false;
      });
    } else {
      cards = await this.fetchData(this.makeURlForCheckboxs());
    }

    this.toggleShowElement(this.loader, this.button);
    this.cards = [...this.cards, ...cards];
    this.newCards = [...cards];

    this.createCatalog(this.newCards);
    this.currentPage++;
    this.checkItsAllCards();

    this.isImageLoaded();
  }

  makeURlForCheckboxs() {
    let URL = this.API_ENDPOINT + `?q=`;

    let checkboxs = document.querySelectorAll(".form__input");
    console.log(checkboxs);
    checkboxs.forEach((checkbox) => {
      if (checkbox.checked) {
        if (checkbox.getAttribute("data-type") == "types") {
          URL += `types:${checkbox.value}&`;
        } else if (checkbox.getAttribute("data-type") == "subtypes") {
          URL += `subtypes:${checkbox.value}&`;
        } else if (checkbox.getAttribute("data-type") == "supertypes") {
          URL += `supertype:${checkbox.value}&`;
        } else if (checkbox.getAttribute("data-type") == "rarities") {
          URL += `rarity:${checkbox.value}&`;
        }
      }
    });
    URL += `pageSize=${this.pageSize}&page=${this.currentPage}`;
    console.log(URL);
    return URL;
  }

  checkboxsIsActive() {
    let items = document.querySelectorAll(".form__input");
    let flag = false;
    items.forEach((item) => {
      if (item.checked) flag = true;
    });
    return flag;
  }

  toggleShowElement(...elements) {
    elements.forEach((element) => element.classList.toggle("hide"));
  }

  async fetchData(url) {
    const response = await fetch(url);
    const parsedResponse = await response.json();

    return parsedResponse.data;
  }

  createCatalog(cards) {
    this.catalog.insertAdjacentHTML("beforeend", [
      cards.map((card) => this.createCard(card)).join(""),
    ]);
  }

  createCard({ name, images, supertype, subtypes, rarity, id, types }) {
    const card = `
      <article class="card ${
        types ? types[0].toString().toLowerCase() : ""
      }" id=${id} data-card 
      ">
        <header class="card"__header>
            <h2 class="card__heading">
            ${name}
            </h2>
        </header>
        <img class="card__image" src="${images.small}" data-image="${
      images.small
    }"  alt="${name}">
        <p class="card__description"><span class="bold">Supertype</span>: ${supertype} </p>
        <p class="card__description ${
          subtypes ? "" : "hide"
        }"><span class="bold">Subtype</span>: ${subtypes} </p>
        <p class="card__description ${
          rarity ? "" : "hide"
        }"><span class="bold">Rarity</span>: ${rarity} </p>
        <span class="bold ${types ? "" : "hide"}"">Type: </span>${
      types ? types[0] : ""
    }
      </article>
      `;

    return card;
  }

  filterCards() {
    this.checkFiltering();
    //hide button where search input is not empty
    const searchQuery = this.search.value.toLowerCase();
    this.visibleCards = document.querySelectorAll(this.UiSelectors.card);
    this.clearCatalogContentWithCards(this.visibleCards);
    this.pullCards(
      `${this.API_ENDPOINT}?q=name:*${searchQuery}*&pageSize=${this.pageSize} `
    );
  }
  isImageLoaded() {
    //check if the photo is uploaded
    this.images = document.querySelectorAll(this.UiSelectors.images);
    //set loading only on 4 (pageSize) elements
    this.images = Array.from(this.images).slice(-this.pageSize);

    this.images.forEach((image) => {
      let isLoaded = image.complete && image.naturalHeight !== 0;

      if (!isLoaded) {
        image.src = "../assets/PokemonReverse.jpg";
        setTimeout(() => {
          this.images.forEach((image) => {
            image.src = image.getAttribute("data-image");
          });
        }, 500);
      }
    });
  }

  checkFiltering() {
    if (this.search.value.length !== 0) {
      this.filterIsActive = true;
    } else {
      this.filterIsActive = false;
    }
  }

  clearCatalogContentWithCards(elements) {
    elements.forEach((element) => this.catalog.removeChild(element));
  }

  checkItsAllCards() {
    if (
      document.querySelectorAll(this.UiSelectors.card).length %
        this.pageSize !==
      0
    )
      this.button.classList.add("hide");
    else this.button.classList.remove("hide");
  }

  async createForm(type) {
    let filterElements = await this.fetchData(
      `${this.API}/${this.API_VERSION}/${type}`
    );
    filterElements = filterElements.slice(0, 5);
    console.log(filterElements);
    this.createFormDiv(filterElements, type);
  }

  createFormDiv(filterElements, type) {
    let checboxs = filterElements
      .map((filterElement) => {
        return `<label class="form__label"><input type="checkbox" class="form__input" data-type="${type}" value="${filterElement
          .toLowerCase()
          .replace(/ /g, "")}">${filterElement}</label>`;
      })
      .join("");
    let formDiv = `<div class="form__div">
      <span class="form__span">${type}</span>
      ${checboxs}
      <div>`;
    this.filter.insertAdjacentHTML("beforeend", formDiv);
  }

  switchVisibility() {
    this.filter.classList.toggle("active");
    document.querySelector(".filter__arrow").classList.toggle("active");
    this.filterbutton.classList.toggle("active");
  }

  filterCardsByFiltering() {
    this.currentPage = 1;
    if (document.querySelectorAll(".form__input")) {
      this.visibleCards = document.querySelectorAll(this.UiSelectors.card);
      this.clearCatalogContentWithCards(this.visibleCards);
      this.pullCards();
    }
  }
}
