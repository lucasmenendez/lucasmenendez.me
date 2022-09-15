function parseRepositories(repositories) {
    // Parse, filter and sort repositories
    return repositories.map(repo => ({
        title: repo.name,
        user: repo.owner.login,
        name: repo.full_name,
        description: repo.description,
        url: repo.html_url,
        site: repo.homepage,
        topics: repo.topics,
        stars: repo.stargazers_count,
        language: repo.language
    }))
    .filter(a => a.stars > 0)
    .sort((a, b) => b.stars - a.stars);
}

async function fetchRepositories(username) {
    // Get repositories metadata from Github
    const endpoint = `https://api.github.com/users/${ username }/repos`
    const response = await fetch(endpoint);
    return await response.json();
}

function initPortfolio(repositories) {
    // Get distinct languages as categories and group repositories by language
    let languages = [];
    let byLanguage = {};
    repositories.forEach(repo => {
        const { language } = repo;
        if (!Array.isArray(byLanguage[language])) byLanguage[language] = [];
        byLanguage[language].push(repo);
        if (languages.indexOf(language) == -1) languages.push(language);
    });

    // Create categories elements
    const root = document.querySelector("ul.categories");
    languages.forEach((language, index) => {
        const elem = document.createElement("li");
        elem.classList.add("category");

        const items = byLanguage[language];
        const icon = language.toLowerCase();
        elem.addEventListener("click", () => selectCategory(index, items));
        elem.innerHTML = `<img class="icon" src="img/symbols/${icon}.svg"/>
            <span class="label">${language} (${items.length})</span>`;

        root.appendChild(elem);
    });

    // Set initial values
    selectCategory(0, byLanguage[languages[0]])
}

function selectCategory(next, repositories) {
    // Update selected categorie
    const siblings = document.querySelectorAll("ul.categories li")
    siblings.forEach((elem, index) => {
        if (index == next) elem.classList.add("selected");
        else elem.classList.remove("selected");
    });

    // Update visible repositories
    const root = document.querySelector("ul.projects");
    root.innerHTML = "";
    repositories.forEach(repo => {
        const item = document.createElement("li");
        item.classList.add('project');

        item.innerHTML = `<a href="${repo.url}" target="_blank">
            <div class="text">
                <span class="name">${repo.user}/<span class="title">${repo.title}</span></span>
                <p class="description">${repo.description}</p>
            </div>
            <span class="stars">⭐ ${repo.stars}</span>
        </a>`;
        root.appendChild(item);
    });
}

(async function() {
    const personal = await fetchRepositories("lucasmenendez");
    const org = await fetchRepositories("elementumjs");
    const repositories = parseRepositories([ ...personal, ...org ]);

    initPortfolio(repositories);
})();