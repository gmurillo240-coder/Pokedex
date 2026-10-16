const form = document.getElementById("formBuscar");
const input = document.getElementById("nombrePokemon");
const button = document.getElementById("btnBuscar");
const status = document.getElementById("estado");
const card = document.getElementById("pokemon");
const evolutionCard = document.getElementById("evoluciones");
const formatId = (id) => `#${String(id).padStart(3, "0")}`;
const formatName = (name) => name.replaceAll("-", " ");
const statNames = { hp: "PS", attack: "Ataque", defense: "Defensa", "special-attack": "At. esp.", "special-defense": "Def. esp.", speed: "Velocidad" };
const typeNames = { normal: "Normal", fire: "Fuego", water: "Agua", electric: "Eléctrico", grass: "Planta", ice: "Hielo", fighting: "Lucha", poison: "Veneno", ground: "Tierra", flying: "Volador", psychic: "Psíquico", bug: "Bicho", rock: "Roca", ghost: "Fantasma", dragon: "Dragón", dark: "Siniestro", steel: "Acero", fairy: "Hada" };

function setStatus(message = "", error = false) {
  status.textContent = message;
  status.classList.toggle("error", error);
}

function renderTags(elementId, names, kind) {
  const container = document.getElementById(elementId);
  const uniqueNames = [...new Set(names)];
  container.replaceChildren(...(uniqueNames.length ? uniqueNames : ["—"]).map(name => {
    const tag = document.createElement("span"); tag.className = `matchup ${kind}`; tag.textContent = typeNames[name] || formatName(name); return tag;
  }));
}

async function renderBattleProfile(pokemon) {
  const stats = document.getElementById("estadisticas");
  stats.replaceChildren(...pokemon.stats.map(({ base_stat: value, stat }) => {
    const row = document.createElement("div"); row.className = "stat";
    const name = document.createElement("span"); name.className = "stat-name"; name.textContent = statNames[stat.name] || formatName(stat.name);
    const number = document.createElement("span"); number.className = "stat-value"; number.textContent = value;
    const track = document.createElement("span"); track.className = "stat-track";
    const fill = document.createElement("span"); fill.className = "stat-fill"; fill.style.width = `${Math.min((value / 180) * 100, 100)}%`;
    track.append(fill); row.append(name, number, track); return row;
  }));
  const typeData = await Promise.all(pokemon.types.map(({ type }) => fetch(type.url).then(r => r.json())));
  renderTags("fortalezas", typeData.flatMap(data => data.damage_relations.double_damage_to.map(type => type.name)), "good");
  renderTags("debilidades", typeData.flatMap(data => data.damage_relations.double_damage_from.map(type => type.name)), "bad");
}

async function renderEvolutions(species) {
  const speciesData = await fetch(species.url).then(r => r.json());
  const chain = await fetch(speciesData.evolution_chain.url).then(r => r.json());
  const names = [];
  const collect = (node) => { names.push(node.species.name); node.evolves_to.forEach(collect); };
  collect(chain.chain);
  const results = await Promise.all(names.map(async name => ({ name, data: await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`).then(r => r.json()) })));
  const box = document.getElementById("contenedorEvoluciones");
  box.replaceChildren();
  results.forEach(({ name, data }, index) => {
    const item = document.createElement("div"); item.className = "evolution";
    const image = document.createElement("img"); image.src = data.sprites.front_default; image.alt = "";
    const label = document.createElement("span"); label.textContent = formatName(name);
    item.append(image, label); box.append(item);
    if (index < results.length - 1) { const arrow = document.createElement("span"); arrow.className = "arrow"; arrow.textContent = "→"; box.append(arrow); }
  });
  evolutionCard.hidden = names.length < 2;
}

async function searchPokemon(query) {
  const term = query.trim().toLowerCase();
  if (!term) { setStatus("Escribe un nombre o número para comenzar.", true); input.focus(); return; }
  button.disabled = true; button.querySelector("span").textContent = "Buscando";
  setStatus("Consultando la Pokédex…"); card.hidden = true; evolutionCard.hidden = true;
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(term)}`);
    if (!response.ok) throw new Error("not-found");
    const pokemon = await response.json();
    const species = await fetch(pokemon.species.url).then(r => r.json());
    const entry = species.flavor_text_entries.find(item => item.language.name === "es") || species.flavor_text_entries.find(item => item.language.name === "en");
    const image = pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default;
    document.getElementById("imagenPokemon").src = image;
    document.getElementById("imagenPokemon").alt = `Ilustración oficial de ${formatName(pokemon.name)}`;
    document.getElementById("nombre").textContent = formatName(pokemon.name);
    document.getElementById("id").textContent = formatId(pokemon.id);
    document.getElementById("numeroHero").textContent = formatId(pokemon.id);
    document.getElementById("descripcion").textContent = entry ? entry.flavor_text.replaceAll("\f", " ").replaceAll("\n", " ") : "Sin descripción disponible.";
    document.getElementById("altura").textContent = `${pokemon.height / 10} m`;
    document.getElementById("peso").textContent = `${pokemon.weight / 10} kg`;
    document.getElementById("experiencia").textContent = pokemon.base_experience || "—";
    const types = document.getElementById("tipo");
    types.replaceChildren(...pokemon.types.map(({ type }) => { const badge = document.createElement("span"); badge.className = "type"; badge.textContent = formatName(type.name); return badge; }));
    renderBattleProfile(pokemon).catch(() => { renderTags("fortalezas", [], "good"); renderTags("debilidades", [], "bad"); });
    card.hidden = false; setStatus("");
    renderEvolutions(pokemon.species).catch(() => { evolutionCard.hidden = true; });
  } catch { setStatus("No encontramos ese Pokémon. Revisa el nombre o intenta con otro número.", true); }
  finally { button.disabled = false; button.querySelector("span").textContent = "Buscar"; }
}

form.addEventListener("submit", event => { event.preventDefault(); searchPokemon(input.value); });
document.querySelectorAll(".suggestion").forEach(item => item.addEventListener("click", () => { input.value = item.dataset.pokemon; searchPokemon(input.value); }));
searchPokemon("pikachu");
