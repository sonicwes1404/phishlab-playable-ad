/* ==========================================
   MOTEUR DE JEU - PLAYABLE AD ANTI-ARNAQUE
   ========================================== */

// --- Variables d'état du jeu ---
let playerHp = 100;
let enemyHp = 100;
let currentRound = 1;
let lastChoiceType = null;
let scamsBlockedCount = 0;
let isTyping = false;

// --- Dégâts configurés ---
const DAMAGE_GOOD = 35;     // Infligé à l'Arnaqueur
const DAMAGE_MEDIUM = 15;   // Infligé à l'Arnaqueur
const DAMAGE_BAD = 35;      // Infligé au Joueur

// --- Arborescence de dialogue adaptative ---
const dialogueTree = {
    1: {
        speaker: "Faux Conseiller",
        dialogue: "Bonjour, je suis conseiller du service des fraudes de votre banque. Un débit suspect de 850€ est en cours sur votre compte. Je vous envoie un SMS avec un code de sécurité pour l'annuler. Donnez-le moi !",
        options: [
            { text: "« La banque ne demande jamais de code de sécurité. Je raccroche. »", type: "good" },
            { text: "« Pouvez-vous prouver que vous êtes de ma banque ? Donnez-moi mon numéro de compte. »", type: "medium" },
            { text: "« D'accord, le code reçu est le 9582. »", type: "bad" }
        ]
    },
    2: {
        "good": {
            speaker: "Faux Conseiller",
            dialogue: "[L'arnaqueur rappelle en urgence] : Pourquoi raccrochez-vous ? C'est une alerte critique ! Si vous ne collaborez pas immédiatement, la banque refusera de vous rembourser ces 850€ !",
            options: [
                { text: "« Je m'en fiche, je rappelle moi-même le numéro officiel au dos de ma carte. »", type: "good" },
                { text: "« Je vais plutôt me connecter sur mon compte pour voir si c'est bloqué. »", type: "medium" },
                { text: "« Ah pardon, je ne savais pas... D'accord, dites-moi quoi faire. »", type: "bad" }
            ]
        },
        "medium": {
            speaker: "Faux Conseiller",
            dialogue: "[L'arnaqueur esquive] : Je comprends votre prudence. Votre compte se termine par 4321. Pour vous rassurer, je vous envoie une notification officielle sur votre application, validez-la !",
            options: [
                { text: "« Je refuse de valider quoi que ce soit sans vérifier sur mon espace bancaire officiel. »", type: "good" },
                { text: "« Est-ce que cette notification va vraiment annuler la transaction ? »", type: "medium" },
                { text: "« D'accord, je valide la notification sur mon téléphone. »", type: "bad" }
            ]
        },
        "bad": {
            speaker: "Faux Conseiller",
            dialogue: "[L'arnaqueur en profite] : Très bien, le premier paiement est bloqué ! Mais je vois une seconde tentative suspecte de 1500€. Donnez-moi le nouveau code de sécurité SMS !",
            options: [
                { text: "« Quoi ? Deux fraudes d'affilée ? C'est suspect. Je raccroche et j'appelle ma banque. »", type: "good" },
                { text: "« Vous êtes sûr que ce n'est pas une arnaque ? »", type: "medium" },
                { text: "« D'accord, voici le nouveau code : 4721. »", type: "bad" }
            ]
        }
    },
    3: {
        "good": {
            speaker: "Faux Conseiller",
            dialogue: "[L'arnaqueur tente le SMS] : Puisque le téléphone capte mal, je viens de vous envoyer un lien par SMS (sms-banque-securite.com) pour sécuriser vos comptes vous-même. Cliquez dessus !",
            options: [
                { text: "« Je ne clique jamais sur les liens reçus par SMS. Je me connecte via mon application habituelle. »", type: "good" },
                { text: "« Je clique pour vérifier si le site a l'air officiel mais je ne rentre aucun code. »", type: "medium" },
                { text: "« D'accord, je clique et je me connecte pour vérifier mes comptes. »", type: "bad" }
            ]
        },
        "medium": {
            speaker: "Faux Conseiller",
            dialogue: "[L'arnaqueur tente le mail] : Je vous envoie un e-mail de confirmation à l'instant. Cliquez sur le lien de certification à l'intérieur pour confirmer votre identité en ligne.",
            options: [
                { text: "« Je ne clique sur rien. J'ouvre mon application bancaire officielle directement. »", type: "good" },
                { text: "« Je clique pour voir l'email de confirmation de sécurité. »", type: "medium" },
                { text: "« D'accord, j'ouvre le lien du mail et je tape mes identifiants. »", type: "bad" }
            ]
        },
        "bad": {
            speaker: "Faux Conseiller",
            dialogue: "[L'arnaqueur tente le vol d'épargne] : Vos comptes courants sont compromis ! Nous devons sécuriser votre épargne (5000€) en la déplaçant vers un compte temporaire sécurisé de la banque. Faites le virement !",
            options: [
                { text: "« Hors de question de faire un virement vers un compte externe ! Je raccroche. »", type: "good" },
                { text: "« Je veux bien le faire mais vers mon propre livret bancaire alors. »", type: "medium" },
                { text: "« D'accord, je fais le virement immédiatement pour protéger mon argent. »", type: "bad" }
            ]
        }
    }
};

// --- Sélection des éléments DOM ---
const playerHpBar = document.getElementById("playerHpBar");
const playerHpText = document.getElementById("playerHpText");
const enemyHpBar = document.getElementById("enemyHpBar");
const enemyHpText = document.getElementById("enemyHpText");
const speakerLabel = document.getElementById("speakerLabel");
const dialogueText = document.getElementById("dialogueText");
const optionsBox = document.getElementById("optionsBox");
const gameContainer = document.getElementById("gameContainer");

// Sprites
const playerSpriteBox = document.getElementById("playerSpriteBox");
const enemySpriteBox = document.getElementById("enemySpriteBox");
const playerMouth = document.getElementById("playerMouth");

// Overlay de fin
const endScreen = document.getElementById("endScreen");
const endIcon = document.getElementById("endIcon");
const endTitle = document.getElementById("endTitle");
const endDescription = document.getElementById("endDescription");
const playerFinalHp = document.getElementById("playerFinalHp");
const scamsBlocked = document.getElementById("scamsBlocked");
const ctaBtn = document.getElementById("ctaBtn");

// --- Initialisation du jeu ---
window.addEventListener("DOMContentLoaded", () => {
    loadRound();
});

// --- Chargement d'une manche ---
function loadRound() {
    let roundData;

    if (currentRound === 1) {
        roundData = dialogueTree[1];
    } else {
        // Sélectionne le dialogue adaptatif basé sur la décision précédente du joueur
        roundData = dialogueTree[currentRound][lastChoiceType];
    }

    // Mise à jour de l'interlocuteur
    speakerLabel.textContent = roundData.speaker;
    document.querySelector(".dialogue-box").className = "dialogue-box speaker-enemy";

    // Animation d'écriture progressive (typewriter)
    typeText(roundData.dialogue, () => {
        displayOptions(roundData.options);
    });
}

// --- Effet Machine à Écrire ---
function typeText(text, callback) {
    dialogueText.innerHTML = "";
    isTyping = true;
    let i = 0;
    const speed = 20; // ms par caractère

    function type() {
        if (i < text.length) {
            dialogueText.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            isTyping = false;
            if (callback) callback();
        }
    }
    type();
}

// --- Affichage des boutons de choix ---
function displayOptions(options) {
    optionsBox.innerHTML = "";
    
    // Mélange des options au hasard pour que le placement ne soit pas un indice
    const shuffledOptions = [...options].sort(() => Math.random() - 0.5);
    
    shuffledOptions.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.setAttribute("data-type", opt.type);
        btn.innerHTML = opt.text;
        
        btn.addEventListener("click", () => {
            if (!isTyping) {
                handleChoice(opt.type);
            }
        });
        
        optionsBox.appendChild(btn);
    });
}

// --- Traitement du choix utilisateur ---
function handleChoice(choiceType) {
    // Désactiver temporairement les boutons
    const buttons = document.querySelectorAll(".option-btn");
    buttons.forEach(b => b.disabled = true);
    
    lastChoiceType = choiceType;

    // Afficher la réplique du joueur dans la boîte de dialogue
    const selectedBtn = document.querySelector(`.option-btn[data-type="${choiceType}"]`);
    const playerSpeech = selectedBtn.innerHTML;
    
    speakerLabel.textContent = "Vous";
    document.querySelector(".dialogue-box").className = "dialogue-box speaker-player";
    dialogueText.innerHTML = playerSpeech;

    // Lancer la séquence de combat après une légère attente
    setTimeout(() => {
        applyCombatEffects(choiceType);
    }, 800);
}

// --- Application des effets de combat et des dégâts ---
function applyCombatEffects(choiceType) {
    if (choiceType === "good") {
        scamsBlockedCount++;
        // Le joueur attaque l'arnaqueur
        playerSpriteBox.classList.add("dash-attack-player");
        gameContainer.classList.add("flash-cyan");
        
        // Expression faciale positive du joueur (sourire)
        playerMouth.setAttribute("d", "M 44,63 Q 50,68 56,63");

        setTimeout(() => {
            enemySpriteBox.classList.add("shake-character");
            // Réduction des HP de l'arnaqueur
            enemyHp = Math.max(0, enemyHp - DAMAGE_GOOD);
            updateHpBars();
        }, 200);

        setTimeout(() => {
            playerSpriteBox.classList.remove("dash-attack-player");
            enemySpriteBox.classList.remove("shake-character");
            gameContainer.classList.remove("flash-cyan");
            nextStep();
        }, 700);

    } else if (choiceType === "medium") {
        // Le joueur résiste mollement (petits dégâts à l'arnaqueur)
        playerSpriteBox.classList.add("dash-attack-player");
        
        setTimeout(() => {
            enemySpriteBox.classList.add("shake-character");
            enemyHp = Math.max(0, enemyHp - DAMAGE_MEDIUM);
            updateHpBars();
        }, 200);

        setTimeout(() => {
            playerSpriteBox.classList.remove("dash-attack-player");
            enemySpriteBox.classList.remove("shake-character");
            nextStep();
        }, 700);

    } else if (choiceType === "bad") {
        // L'arnaqueur attaque le joueur
        enemySpriteBox.classList.add("dash-attack-enemy");
        gameContainer.classList.add("flash-red");
        
        // Expression faciale négative du joueur (triste/inquiet)
        playerMouth.setAttribute("d", "M 44,65 Q 50,60 56,65");

        setTimeout(() => {
            playerSpriteBox.classList.add("shake-character");
            // Réduction des HP du joueur
            playerHp = Math.max(0, playerHp - DAMAGE_BAD);
            updateHpBars();
        }, 200);

        setTimeout(() => {
            enemySpriteBox.classList.remove("dash-attack-enemy");
            playerSpriteBox.classList.remove("shake-character");
            gameContainer.classList.remove("flash-red");
            nextStep();
        }, 700);
    }
}

// --- Mise à jour visuelle des barres de vie ---
function updateHpBars() {
    // Joueur
    playerHpBar.style.width = playerHp + "%";
    playerHpText.textContent = playerHp + "/100 HP";
    
    // Arnaqueur
    enemyHpBar.style.width = enemyHp + "%";
    enemyHpText.textContent = enemyHp + "/100 HP";
}

// --- Transition vers l'étape suivante ---
function nextStep() {
    // Vérification des conditions de KO immédiates
    if (playerHp <= 0 || enemyHp <= 0) {
        showEndScreen();
        return;
    }

    currentRound++;

    if (currentRound > 3) {
        showEndScreen();
    } else {
        loadRound();
    }
}

// --- Gestion et affichage de l'écran de fin ---
function showEndScreen() {
    optionsBox.innerHTML = "";
    
    // Remplissage des statistiques finales sur l'overlay
    playerFinalHp.textContent = playerHp + " HP";
    scamsBlocked.textContent = scamsBlockedCount + " / 3";

    if (enemyHp <= 0) {
        // Victoire Parfaite (Arnaqueur KO)
        endIcon.textContent = "🏆";
        endTitle.textContent = "KO Technique !";
        endTitle.style.color = "var(--primary)";
        endDescription.textContent = "Félicitations ! Vous avez déjoué tous les pièges de l'arnaqueur avec brio. Vos comptes et vos données personnelles sont parfaitement protégés.";
    } 
    else if (playerHp <= 0) {
        // Défaite Totale (Joueur KO)
        endIcon.textContent = "💀";
        endTitle.textContent = "Compte Siphonné !";
        endTitle.style.color = "var(--danger)";
        endDescription.textContent = "Aïe... Vous avez cédé à la pression ou fait confiance à un faux conseiller bancaire. Vos économies ont été volées.";
    } 
    else {
        // Résolution aux points (si les deux ont encore de la vie après la manche 3)
        if (playerHp >= 65) {
            // Victoire Partielle
            endIcon.textContent = "🛡️";
            endTitle.textContent = "Arnaque déjouée... de peu !";
            endTitle.style.color = "var(--warning)";
            endDescription.textContent = "Vous avez évité le piratage de vos comptes bancaires, mais vos hésitations et vos réponses moyennes auraient pu donner du temps à l'arnaqueur.";
        } else {
            // Défaite Partielle
            endIcon.textContent = "⚠️";
            endTitle.textContent = "Tentative réussie...";
            endTitle.style.color = "var(--danger)";
            endDescription.textContent = "Bien que vous ne soyez pas totalement ruiné, l'arnaqueur a réussi à vous faire douter et a récolté des informations clés sur vous.";
        }
    }

    // Afficher l'overlay avec une transition fluide
    endScreen.classList.add("active");

    // Action du CTA de téléchargement
    ctaBtn.addEventListener("click", () => {
        alert("Félicitations ! L'application 'AntiArnaque' s'installe sur votre appareil (simulation du store d'applications).");
    });
}
