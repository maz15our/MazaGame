// script.js

let coins = 0;
let totalCoinsCollected = 0; // Total de pièces collectées depuis le début
let timeRemaining = 300; // 5 minutes en secondes
let autoClickEnabled = false;
let extraCoinsPerClick = 0;

let clickLevel = 1; // Niveau du clic manuel
let clickLevelCost = 100; // Coût initial pour améliorer le clic

let generatorLevel = 0; // Niveau du générateur
let generatorCost = 100; // Coût initial pour le générateur

let autoClickLevel = 0; // Niveau d'autoclic
let autoClickCost = 200; // Coût initial pour automatiser le clic

let superGeneratorLevel = 0; // Niveau du super générateur
let superGeneratorCost = 1000; // Coût initial pour le super générateur

const coinDisplay = document.getElementById("coins");
const timeDisplay = document.getElementById("time");
const clickButton = document.getElementById("click-button");
const buyGeneratorButton = document.getElementById("buy-generator");
const upgradeClicksButton = document.getElementById("upgrade-clicks");
const upgradeClickLevelButton = document.getElementById("upgrade-click-level");
const superGeneratorButton = document.getElementById("super-generator");
const currentLevelDisplay = document.getElementById("current-level");

const characterSelection = document.getElementById("character-selection");
const gameContainer = document.getElementById("game-container");

// Ajouter un indicateur de billets et de lingots d'or
const billDisplay = document.createElement("p");
billDisplay.id = "bills";
billDisplay.textContent = "Billets : 0";
document.getElementById("yield-info").prepend(billDisplay); // Ajouter le nombre de billets au début de la section de rendement

// Sélection du personnage
document.getElementById("character1").addEventListener("click", () => {
    extraCoinsPerClick = 2;
    startGame();
});

document.getElementById("character2").addEventListener("click", () => {
    coins = 100;
    extraCoinsPerClick = 0;
    coinDisplay.textContent = formatCoins(coins);
    startGame();
});

function startGame() {
    characterSelection.style.display = "none";
    gameContainer.style.display = "block";
    updateYieldInfo();
    checkUpgrades(); // Vérifier les améliorations dès le début
    startTimer();
    updatePlayerLevel(); // Mettre à jour le niveau dès le début

    const pseudo = prompt("Entrez votre pseudo :");
    if (pseudo) {
        saveHighScore(pseudo, totalCoinsCollected);
    }
}

// Fonction pour gérer le clic sur le bouton principal
clickButton.addEventListener("click", () => {
    const coinsToAdd = (clickLevel + extraCoinsPerClick) * Math.pow(1.2, clickLevel - 1); // Réduction de la progression exponentielle
    coins += coinsToAdd;
    totalCoinsCollected += coinsToAdd;
    coinDisplay.textContent = formatCoins(coins);
    updateBillDisplay();
    updateYieldInfo();
    updatePlayerLevel();
    checkUpgrades();
});

// Fonction pour acheter ou améliorer le générateur
buyGeneratorButton.addEventListener("click", () => {
    if (coins >= generatorCost) {
        coins -= generatorCost;
        generatorLevel++;
        generatorCost = Math.floor(generatorCost * 1.3); // Coût augmente progressivement
        coinDisplay.textContent = formatCoins(coins);
        updateBillDisplay();
        updateYieldInfo();
        checkUpgrades();
        startGenerator();
    }
});

// Fonction pour automatiser le clic
upgradeClicksButton.addEventListener("click", () => {
    if (coins >= autoClickCost) {
        coins -= autoClickCost;
        autoClickEnabled = true;
        autoClickLevel++;
        autoClickCost = Math.floor(autoClickCost * 1.3); // Coût augmente progressivement
        coinDisplay.textContent = formatCoins(coins);
        updateBillDisplay();
        updateYieldInfo();
        checkUpgrades();
        startAutoClick();
    }
});

// Améliorer le clic manuel
upgradeClickLevelButton.addEventListener("click", () => {
    if (coins >= clickLevelCost) {
        coins -= clickLevelCost;
        clickLevel++;
        clickLevelCost = Math.floor(clickLevelCost * 1.3); // Coût augmente progressivement
        coinDisplay.textContent = formatCoins(coins);
        updateBillDisplay();
        updateYieldInfo();
        checkUpgrades();
    }
});

// Créer un Super Générateur
superGeneratorButton.addEventListener("click", () => {
    if (coins >= superGeneratorCost) {
        coins -= superGeneratorCost;
        superGeneratorLevel++;
        superGeneratorCost = Math.floor(superGeneratorCost * 1.5); // Coût augmente progressivement
        coinDisplay.textContent = formatCoins(coins);
        updateBillDisplay();
        updateYieldInfo();
        checkUpgrades();
        startSuperGenerator();
    }
});

// Fonction pour vérifier les améliorations disponibles
function checkUpgrades() {
    upgradeClickLevelButton.disabled = coins < clickLevelCost;
    buyGeneratorButton.disabled = coins < generatorCost;
    upgradeClicksButton.disabled = coins < autoClickCost;

    if (superGeneratorButton.style.display !== "none") {
        superGeneratorButton.disabled = coins < superGeneratorCost;
    }

    // Gérer les boutons grisés
    [upgradeClickLevelButton, buyGeneratorButton, upgradeClicksButton, superGeneratorButton].forEach(button => {
        if (button.disabled) {
            button.classList.add("disabled");
        } else {
            button.classList.remove("disabled");
        }
    });

    // Mise à jour du texte des boutons
    upgradeClickLevelButton.textContent = "Améliorer Clic (Coût : " + formatCoins(clickLevelCost) + " pièces)";
    buyGeneratorButton.textContent = generatorLevel > 0 ? "Améliorer Générateur (Coût : " + formatCoins(generatorCost) + " pièces)" : "Créer un Générateur (Coût : " + formatCoins(generatorCost) + " pièces)";
    upgradeClicksButton.textContent = autoClickLevel > 0 ? "Améliorer Autoclic (Coût : " + formatCoins(autoClickCost) + " pièces)" : "Automatiser le Clic (Coût : " + formatCoins(autoClickCost) + " pièces)";
    if (superGeneratorButton.style.display !== "none") {
        superGeneratorButton.textContent = superGeneratorLevel > 0 ? "Améliorer Super Générateur (Coût : " + formatCoins(superGeneratorCost) + " pièces)" : "Créer un Super Générateur (Coût : " + formatCoins(superGeneratorCost) + " pièces)";
    }
}

// Fonction pour démarrer le minuteur
function startTimer() {
    const timerInterval = setInterval(() => {
        timeRemaining--;
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timeDisplay.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;

        if (timeRemaining === 240) { // 1 minute écoulée (4 minutes restantes)
            showGameChoiceModal();
        }

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            updateBillDisplay(); // Mise à jour finale
            let goldBars = Math.floor(bills / 1000);
            let message = "Temps écoulé ! Vous avez obtenu un butin final de ";
            if (goldBars > 0) {
                message += `${goldBars} lingots d'or et ${bills % 1000} billets !`;
            } else {
                message += `${bills.toFixed(1)} billets !`;
            }

            // Ajout des 3 meilleurs scores à la fin de la partie
            let finalScoresMessage = "\n\nMeilleurs Scores :\n" +
                (JSON.parse(localStorage.getItem('highScores')) || [])
                .map((s, index) => `${index + 1}. ${s.pseudo}: ${s.score} pièces`)
                .join('\n');

            alert(message + finalScoresMessage);
            disableAllButtons();
        }
    }, 1000);
}

// Fonction pour afficher le choix au joueur après 1 minute
function showGameChoiceModal() {
    // Vérifier s'il existe déjà un modal pour éviter des doublons
    if (document.getElementById('game-choice-modal')) {
        return; // Empêche de créer plusieurs modales
    }

    // Créer la fenêtre modale
    const modal = document.createElement('div');
    modal.id = 'game-choice-modal';
    modal.className = 'modal';

    // Ajouter le contenu de la modale
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Choisissez une option :</h2>
            <button id="option1">Augmentation de 20% de la production de tous les générateurs</button>
            <button id="option2">Recevez immédiatement 10 000 pièces</button>
        </div>
    `;
    document.body.appendChild(modal);

    // Afficher la fenêtre modale
    modal.style.display = 'block';

    // Ajouter les écouteurs d'événements pour les boutons
    document.getElementById('option1').addEventListener('click', () => {
        activateGeneratorBoost();
        closeModal();
    });
    document.getElementById('option2').addEventListener('click', () => {
        activateImmediateCoins();
        closeModal();
    });

    function closeModal() {
        modal.style.display = 'none';
        modal.remove();
    }
}

// Augmentation de la production de tous les générateurs de 20%
function activateGeneratorBoost() {
    generatorLevel = Math.ceil(generatorLevel * 1.2);
    alert("Production de tous les générateurs augmentée de 20% !");
}

// Recevez immédiatement 10 000 pièces
function activateImmediateCoins() {
    coins += 10000;
    totalCoinsCollected += 10000;
    coinDisplay.textContent = formatCoins(coins);
    alert("Vous avez reçu 10 000 pièces immédiatement !");
}




// Fonction pour démarrer l'autoclic
function startAutoClick() {
    if (autoClickEnabled && autoClickLevel > 0) {
        setInterval(() => {
            if (timeRemaining > 0) {
                const coinsToAdd = clickLevel * autoClickLevel * Math.pow(1.1, autoClickLevel); // Réduction de la progression exponentielle
                coins += coinsToAdd;
                totalCoinsCollected += coinsToAdd;
                coinDisplay.textContent = formatCoins(coins);
                updateBillDisplay();
                updateYieldInfo();
                checkUpgrades();
            }
        }, 1000); // 1 clic par seconde
    }
}

// Fonction pour démarrer le générateur
function startGenerator() {
    if (generatorLevel > 0) {
        setInterval(() => {
            if (timeRemaining > 0) {
                const coinsToAdd = generatorLevel * Math.pow(1.1, generatorLevel); // Réduction de la progression exponentielle
                coins += coinsToAdd;
                totalCoinsCollected += coinsToAdd;
                coinDisplay.textContent = formatCoins(coins);
                updateBillDisplay();
                updateYieldInfo();
                checkUpgrades();
            }
        }, 2000); // Génération toutes les 2 secondes
    }
}

// Fonction pour démarrer le Super Générateur
function startSuperGenerator() {
    if (superGeneratorLevel > 0) {
        setInterval(() => {
            if (timeRemaining > 0) {
                const coinsToAdd = superGeneratorLevel * Math.pow(1.3, superGeneratorLevel); // Réduction de la progression exponentielle
                coins += coinsToAdd;
                totalCoinsCollected += coinsToAdd;
                coinDisplay.textContent = formatCoins(coins);
                updateBillDisplay();
                updateYieldInfo();
                checkUpgrades();
            }
        }, 3000); // Génération toutes les 3 secondes
    }
}

// Mettre à jour les informations de rendement
function updateYieldInfo() {
    document.getElementById("coins-per-click").textContent = formatCoins((clickLevel + extraCoinsPerClick) * Math.pow(1.2, clickLevel - 1));
    document.getElementById("generator-level").textContent = generatorLevel;
    document.getElementById("generator-rate").textContent = formatCoins(generatorLevel * Math.pow(1.1, generatorLevel));
    document.getElementById("auto-click-rate").textContent = formatCoins(autoClickLevel * Math.pow(1.1, autoClickLevel));
    
    if (superGeneratorLevel > 0) {
        if (!document.getElementById("super-generator-rate")) {
            const superGenRateElem = document.createElement("p");
            superGenRateElem.id = "super-generator-rate";
            superGenRateElem.textContent = "Rendement Super Générateur (Niveau " + superGeneratorLevel + ") : " + formatCoins(superGeneratorLevel * Math.pow(1.3, superGeneratorLevel)) + " pièces par seconde";
            document.getElementById("yield-info").appendChild(superGenRateElem);
        } else {
            document.getElementById("super-generator-rate").textContent = "Rendement Super Générateur (Niveau " + superGeneratorLevel + ") : " + formatCoins(superGeneratorLevel * Math.pow(1.3, superGeneratorLevel)) + " pièces par seconde";
        }
    }
}

// Mettre à jour le niveau du joueur en fonction du nombre total de pièces collectées
function updatePlayerLevel() {
    let currentLevel;
    if (totalCoinsCollected <= 3000) {
        currentLevel = Math.floor(totalCoinsCollected / 200) + 1; // Faciliter les 15 premiers niveaux
    } else {
        currentLevel = Math.floor((totalCoinsCollected - 3000) / 1000) + 16; // Niveau plus difficile après les 15 premiers
    }

    currentLevelDisplay.textContent = 'Niveau Actuel : ' + currentLevel;

    if (currentLevel >= 15) {
        superGeneratorButton.style.display = "inline-block";
    }
}

// Fonction pour mettre à jour l'affichage des billets et des lingots d'or
function updateBillDisplay() {
    let bills = Math.floor(coins / 100000);
    let goldBars = Math.floor(bills / 1000);
    let remainingBills = bills % 1000;

    if (goldBars > 0) {
        billDisplay.textContent = goldBars.toFixed(1) + ' lingots d\'or et ' + remainingBills.toFixed(1) + ' billets';
    } else {
        billDisplay.textContent = "Billets : " + bills.toFixed(1);
    }
}

// Désactiver tous les boutons lorsque le jeu est terminé
function disableAllButtons() {
    clickButton.disabled = true;
    buyGeneratorButton.disabled = true;
    upgradeClicksButton.disabled = true;
    upgradeClickLevelButton.disabled = true;
    superGeneratorButton.disabled = true;

    displayHighScores();
}

// Fonction pour formater le nombre de pièces avec la notation "M" ou en billets pour les scores élevés
function formatCoins(value) {
    if (value >= 10000000) {
        return (value / 1000000).toFixed(1) + 'M';
    }
    return value.toFixed(1);
}

function saveHighScore(pseudo, score) {
    let scores = JSON.parse(localStorage.getItem('highScores')) || [];
    scores.push({ pseudo: pseudo, score: score });
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 3);
    localStorage.setItem('highScores', JSON.stringify(scores));
}

function displayHighScores() {
    let scores = JSON.parse(localStorage.getItem('highScores')) || [];
    let highScoreDisplay = document.getElementById('high-scores');
    if (!highScoreDisplay) {
        highScoreDisplay = document.createElement('div');
        highScoreDisplay.id = 'high-scores';
        document.body.appendChild(highScoreDisplay);
    }
    highScoreDisplay.innerHTML = '<h3>Meilleurs Scores :</h3>' + scores.map(s => `${s.pseudo}: ${s.score} pièces`).join('<br>');

    // Afficher le meilleur score local
    if (scores.length > 0) {
        let bestScore = scores[0];
        let bestScoreDisplay = document.getElementById('best-score');
        if (!bestScoreDisplay) {
            bestScoreDisplay = document.createElement('div');
            bestScoreDisplay.id = 'best-score';
            document.body.appendChild(bestScoreDisplay);
        }
        bestScoreDisplay.innerHTML = `<h4>Meilleur Score Local :</h4><p>${bestScore.pseudo}: ${bestScore.score} pièces</p>`;
    }
}
