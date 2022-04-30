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
    };
  }

  initializeCatalog() {
    this.catalog = document.querySelector(this.UiSelectors.content);
    this.button = document.querySelector(this.UiSelectors.button);
    this.loader = document.querySelector(this.UiSelectors.loader);
    this.search = document.getElementById(this.UiSelectors.search);
    this.info = document.querySelector(this.UiSelectors.info);
    this.addEventListeners();

    this.pullCards();
  }

  addEventListeners() {
    this.button.addEventListener("click", () => this.pullCards());
    this.search.addEventListener("keyup", () => this.filterCards());
  }

  async pullCards() {
    this.toggleShowElement(this.loader, this.button);
    const cards = await this.fetchData(
      `${this.API_ENDPOINT}?page=${this.currentPage}&pageSize=${this.pageSize}`
    );
    this.toggleShowElement(this.loader, this.button);

    this.cards = [...this.cards, ...cards];

    this.newCards = [...cards];

    this.createCatalog(this.newCards);
    this.currentPage++;

    // console.log(this.cards);
  }

  toggleShowElement(...elements) {
    elements.forEach((element) => element.classList.toggle("hide"));
  }

  async fetchData(url) {
    const response = await fetch(url);
    const parsedResponse = await response.json();
    console.log(parsedResponse.data);
    return parsedResponse.data;
  }

  createCatalog(cards) {
    this.catalog.insertAdjacentHTML("beforeend", [
      cards.map((card) => this.createCard(card)).join(""),
    ]);
  }

  createCard({ name, images, supertype, subtypes, rarity, id }) {
    return `
      <article class="card" id=${id} data-card>
        <header class="card"__header>
            <h2 class="card__heading">
            ${name}
            </h2>
        </header>
        <img class="card__image" src="${images.small}" alt="${name}">
        <p class="card__description"><span class="bold">Supertype</span>: ${supertype}</p>
        <p class="card__description ${
          subtypes ? "" : "hide"
        }"><span class="bold">Subtype</span>: ${subtypes}</p>
        <p class="card__description ${
          rarity ? "" : "hide"
        }"><span class="bold">Rarity</span>: ${rarity}</p>
      </article>
      `;
  }

  filterCards() {
    const searchQuery = this.search.value.toLowerCase();

    searchQuery.length
      ? this.button.classList.add("hide")
      : this.button.classList.remove("hide");

    document
      .querySelectorAll(this.UiSelectors.card)
      .forEach((element) => element.classList.remove("hide"));

    const filteredCards = this.cards.filter(
      ({ name }) => !name.toLowerCase().includes(searchQuery)
    );

    filteredCards.length === this.cards.length
      ? this.info.classList.remove("hide")
      : this.info.classList.add("hide");

    filteredCards.forEach(({ id }) =>
      document.getElementById(id).classList.add("hide")
    );
  }
}
