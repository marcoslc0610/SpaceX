import { getLanzamientos, getCohetes } from "./counter";
import type { Launch } from "./lanzamientos-interface";

const URL_LANZAMIENTOS = 'https://gateway.pipeworx.io/spacex/v4/launches';
const URL_COHETES = 'https://gateway.pipeworx.io/spacex/v4/rockets';

const grid = document.getElementById("lanzamientos-grid") as HTMLElement;
const spinner = document.getElementById("spinner") as HTMLElement;
const errorContainer = document.getElementById("error-container") as HTMLElement;
const statsContainer = document.getElementById("stats-container") as HTMLElement;
const controlsContainer = document.getElementById("controls-container") as HTMLElement;

const searchInput = document.getElementById("search-input") as HTMLInputElement;
const filterSelect = document.getElementById("filter-select") as HTMLSelectElement;
const sortSelect = document.getElementById("sort-select") as HTMLSelectElement;
const toggleFavsBtn = document.getElementById("toggle-favs-view") as HTMLButtonElement;
const favCountSpan = document.getElementById("fav-count") as HTMLElement;

const statTotal = document.getElementById("stat-total") as HTMLElement;
const statSuccess = document.getElementById("stat-success") as HTMLElement;
const statFailed = document.getElementById("stat-failed") as HTMLElement;
const statPercentage = document.getElementById("stat-percentage") as HTMLElement;

let allLaunches: Launch[] = [];
let favorites: string[] = JSON.parse(localStorage.getItem("spacex_favs") || "[]");
let showOnlyFavorites = false;

async function init() {
  try {
    spinner.style.display = "block";
    
    const [lanzamientos] = await Promise.all([
      getLanzamientos(URL_LANZAMIENTOS),
      getCohetes(URL_COHETES)
    ]);
    
    allLaunches = lanzamientos;
    
    spinner.style.display = "none";
    statsContainer.style.display = "flex";
    controlsContainer.style.display = "flex";

    updateUI();
  } catch (error: any) {
    spinner.style.display = "none";
    errorContainer.innerHTML = `<div class="error-msg">${error.message || "Error desconocido al cargar los datos."}</div>`;
  }
}

function updateUI() {
  let filtered = filterLaunches();
  filtered = sortLaunches(filtered);
  renderLaunches(filtered);
  renderStats(allLaunches);
  updateFavCount();
}

function filterLaunches(): Launch[] {
  const searchTerm = searchInput.value.toLowerCase();
  const filterValue = filterSelect.value;

  return allLaunches.filter(launch => {
    if (showOnlyFavorites && !favorites.includes(launch.id)) return false;

    const matchesSearch = launch.name.toLowerCase().includes(searchTerm);
    if (!matchesSearch) return false;

    if (filterValue === "success" && launch.success !== true) return false;
    if (filterValue === "failed" && launch.success !== false) return false;
    if (filterValue === "pending" && launch.success !== null) return false;

    return true;
  });
}

function sortLaunches(launches: Launch[]): Launch[] {
  const sortOrder = sortSelect.value;
  return [...launches].sort((a, b) => {
    const dateA = new Date(a.date_utc).getTime();
    const dateB = new Date(b.date_utc).getTime();
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });
}

function renderLaunches(launches: Launch[]) {
  grid.innerHTML = "";
  if (launches.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #94a3b8;">No se encontraron lanzamientos.</p>`;
    return;
  }

  launches.forEach(launch => {
    const card = document.createElement("div");
    card.className = "card";

    const isFav = favorites.includes(launch.id);
    const patchImg = launch.links?.patch?.small || "https://images2.imgbox.com/eb/0f/Vev8BDpj_o.png";
    const formattedDate = new Date(launch.date_utc).toLocaleDateString();

    let badgeClass = "pending";
    let badgeText = "Pendiente";
    if (launch.success === true) {
      badgeClass = "success";
      badgeText = "Exitoso";
    } else if (launch.success === false) {
      badgeClass = "failed";
      badgeText = "Fallido";
    }

    card.innerHTML = `
      <button class="fav-btn" title="Favorito">${isFav ? "⭐" : "☆"}</button>
      <img src="${patchImg}" alt="${launch.name}" loading="lazy" />
      <h3>${launch.name}</h3>
      <p>📅 ${formattedDate}</p>
      <span class="badge ${badgeClass}">${badgeText}</span>
    `;

    const favBtn = card.querySelector(".fav-btn") as HTMLButtonElement;
    favBtn.addEventListener("click", () => {
      toggleFavorite(launch.id);
    });

    grid.appendChild(card);
  });
}

function toggleFavorite(id: string) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(favId => favId !== id);
  } else {
    favorites.push(id);
  }
  localStorage.setItem("spacex_favs", JSON.stringify(favorites));
  updateUI();
}

function updateFavCount() {
  favCountSpan.textContent = favorites.length.toString();
  toggleFavsBtn.textContent = showOnlyFavorites ? "Ver Todos" : `Mis Favoritos (${favorites.length})`;
}

function renderStats(launches: Launch[]) {
  const total = launches.length;
  const successes = launches.filter(l => l.success === true).length;
  const failures = launches.filter(l => l.success === false).length;
  const percentage = total > 0 ? ((successes / total) * 100).toFixed(1) : "0.0";

  statTotal.textContent = total.toString();
  statSuccess.textContent = successes.toString();
  statFailed.textContent = failures.toString();
  statPercentage.textContent = percentage;
}

searchInput.addEventListener("input", updateUI);
filterSelect.addEventListener("change", updateUI);
sortSelect.addEventListener("change", updateUI);

toggleFavsBtn.addEventListener("click", () => {
  showOnlyFavorites = !showOnlyFavorites;
  updateUI();
});

init();