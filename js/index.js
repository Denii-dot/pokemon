class PokemonCatalog {
  constructor() {
    this.cards = [];
    this.pageSize = 4;
    this.currentPage = 1;
    this.newCards = [];

    this.catalog = null;
    this.button = null;
    this.loader = null;
    this.search = null;
    this.info = null;
    this.images = null;
    this.pokemonCards = null;

    this.filterIsActive = null;

    this.API = "https://api.pokemontcg.io";
    this.API_VERSION = "v2";
    this.API_RESOURCE = "cards";

    this.API_ENDPOINT = `${this.API}/${this.API_VERSION}/${this.API_RESOURCE}`;
    // this.API_ENDPOINT = ;

    this.UiSelectors = {
      content: "[data-content]",
      button: "[data-button]",
      loader: "[data-loader]",
      search: "search",
      card: "[data-card]",
      info: "[data-info]",
      images: ".card__image",
      searchButton: ".search__button",
    };
  }

  initializeCatalog() {
    this.catalog = document.querySelector(this.UiSelectors.content);
    this.button = document.querySelector(this.UiSelectors.button);
    this.loader = document.querySelector(this.UiSelectors.loader);
    this.search = document.getElementById(this.UiSelectors.search);
    this.info = document.querySelector(this.UiSelectors.info);
    this.searchButton = document.querySelector(this.UiSelectors.searchButton);

    this.addEventListeners();
    this.pullCards();
  }

  addEventListeners() {
    this.button.addEventListener("click", () => this.pullCards());
    console.log(this.searchButton);
    this.searchButton.addEventListener("click", (event) => {
      event.preventDefault();
      this.filterCards();
    });
  }

  async pullCards(
    defaultParam = `${this.API_ENDPOINT}?page=${this.currentPage}&pageSize=${this.pageSize}`
  ) {
    this.checkFiltering();
    let cards;
    console.log(this.filterIsActive);
    this.toggleShowElement(this.loader, this.button);
    if (this.filterIsActive) {
      cards = await this.fetchData(
        `${
          this.API_ENDPOINT
        }?q=name:${this.search.value.toLowerCase()}*&pageSize=${
          this.pageSize
        } &page=${this.currentPage}`
      );
    } else {
      cards = await this.fetchData(defaultParam);
    }
    this.toggleShowElement(this.loader, this.button);

    this.cards = [...this.cards, ...cards];

    this.newCards = [...cards];

    this.createCatalog(this.newCards);
    this.currentPage++;
    this.checkItsAllCards();

    this.isImageLoaded();
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
        <p class="card__description"><span class="bold">Supertype</span>: ${supertype}</p>
        <p class="card__description ${
          subtypes ? "" : "hide"
        }"><span class="bold">Subtype</span>: ${subtypes}</p>
        <p class="card__description ${
          rarity ? "" : "hide"
        }"><span class="bold">Rarity</span>: ${rarity}</p>
        <span class="bold ${types ? "" : "hide"}"">Types: </span>${
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
    const cards = document.querySelectorAll(this.UiSelectors.card);
    this.clearCatalogContentWithCards(cards);
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
}
