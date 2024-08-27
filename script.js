document.addEventListener('DOMContentLoaded', () => {
    const pokemonContainer = document.getElementById('pokemon-container');
    const pokemonDetails = document.getElementById('pokemon-details');
    const regionSelect = document.getElementById('region-select');
    const searchBar = document.getElementById('search-bar');

    const regions = {
        all: [1, 898],
        kanto: [1, 151],
        johto: [152, 251],
        hoenn: [252, 386],
        sinnoh: [387, 493],
        unova: [494, 649],
        kalos: [650, 721],
        alola: [722, 809],
        galar: [810, 898]
    };

    const typeColors = {
        bug: '#a8b820',
        dark: '#705848',
        dragon: '#7038f8',
        electric: '#f8d030',
        fairy: '#f0b6bc',
        fighting: '#c03028',
        fire: '#f08030',
        flying: '#a890f0',
        ghost: '#705898',
        grass: '#78c850',
        ground: '#e0c068',
        ice: '#98d8d8',
        normal: '#a8a878',
        poison: '#a040a0',
        psychic: '#f85888',
        rock: '#b8a038',
        steel: '#b8b8d0',
        water: '#6890f0'
    };

    const typeAdvantages = {
        bug: ['dark', 'grass', 'psychic'],
        dark: ['ghost', 'psychic'],
        dragon: ['dragon'],
        electric: ['water', 'flying'],
        fairy: ['dark', 'dragon', 'fighting'],
        fighting: ['bug', 'dark', 'normal', 'steel'],
        fire: ['bug', 'grass', 'ice', 'steel'],
        flying: ['bug', 'fighting', 'grass'],
        ghost: ['ghost', 'psychic'],
        grass: ['ground', 'rock', 'water'],
        ground: ['electric', 'fire', 'poison', 'rock', 'steel'],
        ice: ['dragon', 'flying', 'grass', 'ground'],
        normal: [],
        poison: ['fairy', 'grass'],
        psychic: ['fighting', 'poison'],
        rock: ['bug', 'fire', 'flying', 'ice'],
        steel: ['fairy', 'ice', 'rock'],
        water: ['fire', 'ground', 'rock']
    };

    const typeDisadvantages = {
        bug: ['fighting', 'fire', 'flying', 'ghost', 'poison', 'steel', 'fairy'],
        dark: ['dark', 'fairy', 'fighting'],
        dragon: ['steel', 'fairy'],
        electric: ['electric', 'ground'],
        fairy: ['fire', 'poison', 'steel'],
        fighting: ['bug', 'flying', 'psychic'],
        fire: ['fire', 'water', 'rock', 'dragon'],
        flying: ['electric', 'rock', 'steel'],
        ghost: ['dark', 'ghost'],
        grass: ['bug', 'fire', 'flying', 'grass', 'poison', 'steel'],
        ground: ['grass', 'ice', 'water'],
        ice: ['fire', 'fighting', 'rock', 'steel'],
        normal: ['rock', 'steel'],
        poison: ['ghost', 'ground', 'poison', 'steel'],
        psychic: ['dark', 'steel'],
        rock: ['fighting', 'grass', 'steel', 'water'],
        steel: ['fire', 'fighting', 'ground'],
        water: ['electric', 'grass']
    };

    let pokemonList = [];

    function fetchPokemonData(start, end) {
        pokemonContainer.innerHTML = '';  // Limpar o contêiner
        const promises = [];
        for (let i = start; i <= end; i++) {
            promises.push(fetch(`https://pokeapi.co/api/v2/pokemon/${i}/`));
        }
        Promise.all(promises)
            .then(responses => Promise.all(responses.map(response => response.json())))
            .then(data => {
                pokemonList = data;
                renderPokemonCards(data);
            })
            .catch(error => console.error('Erro ao buscar dados dos Pokémon:', error));
    }

    function renderPokemonCards(data) {
        pokemonContainer.innerHTML = '';
        data.forEach(pokemon => createPokemonCard(pokemon));
    }

    function createPokemonCard(pokemon) {
        const primaryType = pokemon.types[0].type.name;
        const backgroundColor = typeColors[primaryType] || '#ffffff';

        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.style.background = backgroundColor;
        card.innerHTML = `
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <h3>${capitalizeFirstLetter(pokemon.name)}</h3>
        `;
        card.addEventListener('click', () => showPokemonDetails(pokemon));
        pokemonContainer.appendChild(card);
    }

    function showPokemonDetails(pokemon) {
        const types = pokemon.types.map(typeInfo => typeInfo.type.name);
        const typeAdvantage = types.map(type => typeAdvantages[type] || []).flat();
        const typeDisadvantage = types.map(type => typeDisadvantages[type] || []).flat();
        const speciesUrl = pokemon.species.url;

        fetch(speciesUrl)
            .then(response => response.json())
            .then(speciesData => {
                const evolutionUrl = speciesData.evolution_chain.url;
                return fetch(evolutionUrl);
            })
            .then(response => response.json())
            .then(evolutionData => {
                const evolutions = getEvolutions(evolutionData);
                const preEvolutionsPromise = getPreEvolutions(pokemon.species.url);

                preEvolutionsPromise.then(preEvolutions => {
                    const abilities = pokemon.abilities.map(abilityInfo => abilityInfo.ability.name).join(', ');
                    const hiddenAbility = pokemon.abilities.find(abilityInfo => abilityInfo.is_hidden)?.ability.name || 'Nenhuma';

                    pokemonDetails.innerHTML = `
                        <button class="close-button" onclick="document.getElementById('pokemon-details').style.display='none'">&times;</button>
                        <h2>${capitalizeFirstLetter(pokemon.name)}</h2>
                        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                        <div class="section">
                            <h3>Informações</h3>
                            <p><strong>Altura:</strong> ${pokemon.height / 10} m</p>
                            <p><strong>Peso:</strong> ${pokemon.weight / 10} kg</p>
                            <p><strong>Tipos:</strong> ${types.join(', ')}</p>
                            <p><strong>Habilidades:</strong> ${abilities}</p>
                            <p><strong>Habilidade Oculta:</strong> ${hiddenAbility}</p>
                        </div>
                        <div class="section">
                            <h3>Tipo: Vantagens e Desvantagens</h3>
                            <p><strong>Vantagens:</strong> ${typeAdvantage.join(', ') || 'Nenhuma'}</p>
                            <p><strong>Desvantagens:</strong> ${typeDisadvantage.join(', ') || 'Nenhuma'}</p>
                        </div>
                        <div class="section">
                            <h3>Pré-Evoluções</h3>
                            <div class="evolution-section">
                                ${preEvolutions.map(preEvo => `
                                    <div class="evolution-card">
                                        <img src="${preEvo.image}" alt="${preEvo.name}">
                                        <p>${preEvo.name}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="section">
                            <h3>Evoluções</h3>
                            <div class="evolution-section">
                                ${evolutions.map(evo => `
                                    <div class="evolution-card">
                                        <img src="${evo.image}" alt="${evo.name}">
                                        <p>${evo.name}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                    pokemonDetails.style.display = 'block';
                });
            })
            .catch(error => console.error('Erro ao buscar detalhes do Pokémon:', error));
    }

    function getEvolutions(evolutionData) {
        let evolutions = [];
        let current = evolutionData.chain;
        while (current) {
            if (current.species) {
                evolutions.push({
                    name: capitalizeFirstLetter(current.species.name),
                    image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${current.species.url.split('/')[6]}.png`
                });
            }
            current = current.evolves_to[0];
        }
        return evolutions;
    }

    function getPreEvolutions(speciesUrl) {
        return fetch(speciesUrl)
            .then(response => response.json())
            .then(speciesData => {
                if (speciesData.evolves_from_species) {
                    const pokemonId = speciesData.evolves_from_species.url.split('/')[6];
                    return [{
                        name: capitalizeFirstLetter(speciesData.evolves_from_species.name),
                        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`
                    }];
                } else {
                    return [];
                }
            })
            .catch(error => {
                console.error('Erro ao buscar pré-evoluções:', error);
                return [];
            });
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function filterPokemon() {
        const query = searchBar.value.toLowerCase();
        const filteredPokemon = pokemonList.filter(pokemon => pokemon.name.toLowerCase().includes(query));
        renderPokemonCards(filteredPokemon);
    }

    regionSelect.addEventListener('change', (event) => {
        const selectedRegion = event.target.value;
        const [start, end] = regions[selectedRegion] || [1, 898]; // Se "Todos" for selecionado, pega todas as regiões
        fetchPokemonData(start, end);
    });

    searchBar.addEventListener('input', filterPokemon);
    searchBar.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            filterPokemon();
        }
    });

    // Buscar dados iniciais dos Pokémon (região Kanto)
    fetchPokemonData(...regions.kanto);
});
