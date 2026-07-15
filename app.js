/* ==========================================
   MOTEUR DE JEU - PLAYABLE AD PIXEL ART
   ========================================== */

// --- Variables d'état du jeu ---
let playerHp = 100;
let enemyHp = 100;
let currentRound = 1;
let lastChoiceType = null;
let scamsBlockedCount = 0;
let isTyping = false;
let selectedChar = null; // 0: Jeune, 1: Millennial, 2: Grandma, 3: Employé

// --- Dégâts configurés ---
const DAMAGE_GOOD = 35;     // Infligé à l'Arnaqueur
const DAMAGE_MEDIUM = 15;   // Infligé à l'Arnaqueur
const DAMAGE_BAD = 35;      // Infligé au Joueur

// Noms des personnages
const charNames = [
    "Le Jeune Connecté",
    "La Millennial Épuisée",
    "La Grand-Mère Hacker",
    "L'Employé Débordé"
];

// --- Arborescence de dialogue adaptative par Personnage ---
const dialogueTree = {
    // ----------------------------------------------------
    // PERSO 0 : LE JEUNE CONNECTÉ (Gaming & Skins)
    // ----------------------------------------------------
    0: {
        1: {
            speaker: "Admin_Gamer (L'Ombre)",
            dialogue: "[Message Discord] : Yo ! Un mec vend ses skins Valorant/CS2 ultra rares pour seulement 40€. C'est l'affaire de l'année. Tiens, clique là pour payer : pay-rare-skins.com !",
            options: [
                { text: "« Je ne fais confiance à aucun lien externe. Je passe par le marché officiel Steam. »", type: "good" },
                { text: "« C'est un peu louche... Dis-lui de m'ajouter en ami sur le jeu pour vérifier ses skins. »", type: "medium" },
                { text: "« Trop cool, je clique sur le lien et je paye direct avant que ça parte ! »", type: "bad" }
            ]
        },
        2: {
            "good": {
                speaker: "Admin_Gamer (L'Ombre)",
                dialogue: "[L'arnaqueur insiste] : Mais mec, le marché officiel prend 15% de taxe ! Si tu rates cette offre, quelqu'un d'autre va la prendre dans 5 min. Donne-moi tes accès Steam pour que je te les transfère directement !",
                options: [
                    { text: "« Mes accès sont strictement confidentiels. Je refuse et je te signale pour tentative de vol. »", type: "good" },
                    { text: "« On fait l'échange sur Discord mais je te donne un mot de passe temporaire alors. »", type: "medium" },
                    { text: "« D'accord, voici mon identifiant et mon mot de passe pour le transfert. »", type: "bad" }
                ]
            },
            "medium": {
                speaker: "Admin_Gamer (L'Ombre)",
                dialogue: "[L'arnaqueur tente d'esquiver] : Je t'ai ajouté. Mais pour valider que c'est bien ton compte et pas un bot de vol de skins, mon bot de sécurité va t'envoyer un code SMS de validation. Donne-le moi !",
                options: [
                    { text: "« Aucun bot officiel n'envoie de SMS de validation pour un simple échange. Je te bloque. »", type: "good" },
                    { text: "« C'est bizarre... Je vais vérifier mes paramètres de sécurité Steam d'abord. »", type: "medium" },
                    { text: "« D'accord, voici le code Steam Guard que je viens de recevoir par SMS : 4892. »", type: "bad" }
                ]
            },
            "bad": {
                speaker: "Admin_Gamer (L'Ombre)",
                dialogue: "[L'arnaqueur en profite] : Top, le paiement est fait. Mais la sécurité Steam a bloqué l'envoi car ton compte n'est pas certifié. Paye 50€ de caution via ce lien pour tout débloquer !",
                options: [
                    { text: "« Payer pour débloquer un achat ? C'est une arnaque classique. J'arrête et je signale. »", type: "good" },
                    { text: "« Je veux bien payer si tu me promets de me rembourser les 50€ juste après. »", type: "medium" },
                    { text: "« D'accord, je paye les 50€ supplémentaires pour ne pas perdre mon premier achat. »", type: "bad" }
                ]
            }
        },
        3: {
            "good": {
                speaker: "Admin_Gamer (L'Ombre)",
                dialogue: "[L'arnaqueur s'énerve] : Tu te crois malin ? Si tu ne scannes pas ce QR Code de connexion Discord dans les 2 minutes, je fais bannir ton compte pour fausse transaction !",
                options: [
                    { text: "« Scanner un QR Code externe connecte ton appareil à mon compte. Je signale ton profil. »", type: "good" },
                    { text: "« Attends, je vais essayer de le scanner avec mon ancien téléphone pour tester. »", type: "medium" },
                    { text: "« Ne me bannis pas ! Je scanne le QR code tout de suite avec mon téléphone. »", type: "bad" }
                ]
            },
            "medium": {
                speaker: "Admin_Gamer (L'Ombre)",
                dialogue: "[L'arnaqueur pousse le QR code] : C'est la procédure d'échange rapide. Allez, scanne ce QR Code de validation avec ton appli mobile pour lier ton compte !",
                options: [
                    { text: "« Steam ne demande jamais de scanner un QR Code tiers. Je ferme tout et je change mon mot de passe. »", type: "good" },
                    { text: "« Est-ce que ça va vraiment lier mon compte d'échange sans risque ? »", type: "medium" },
                    { text: "« D'accord, je scanne le QR code avec l'appareil photo de mon téléphone. »", type: "bad" }
                ]
            },
            "bad": {
                speaker: "Admin_Gamer (L'Ombre)",
                dialogue: "[L'arnaqueur va au bout] : Super. Ton compte est sécurisé. Maintenant, pour recevoir le remboursement de la caution, fais un virement de tes fonds Steam/Crypto restants vers notre adresse de dépôt.",
                options: [
                    { text: "« Jamais de la vie. Tu as déjà piraté mon compte, je contacte le vrai support Steam. »", type: "good" },
                    { text: "« J'ai un doute, je vais faire un virement de 5€ pour tester si ça me rembourse. »", type: "medium" },
                    { text: "« D'accord, je transfère mes fonds restants pour tout récupérer. »", type: "bad" }
                ]
            }
        }
    },

    // ----------------------------------------------------
    // PERSO 1 : LA MILLENNIAL ÉPUISÉE (Faux remboursement CAF)
    // ----------------------------------------------------
    1: {
        1: {
            speaker: "ANTAI (L'Ombre)",
            dialogue: "[SMS urgent reçu à 23h] : RAPPEL - Vous avez une amende impayée de 35€. Passé un délai de 24h, elle sera majorée à 135€. Payez immédiatement sur : gouv-antai-amendes.com.",
            options: [
                { text: "« Je ne clique jamais sur les SMS d'amendes. L'ANTAI envoie uniquement des courriers papier. »", type: "good" },
                { text: "« J'ai peut-être oublié un radar... Je clique pour voir si c'est vraiment ma plaque d'immatriculation. »", type: "medium" },
                { text: "« Mince, je suis trop fatiguée pour gérer ça demain. Je clique et je paye direct par carte. »", type: "bad" }
            ]
        },
        2: {
            "good": {
                speaker: "CAF (L'Ombre)",
                dialogue: "[Nouveau mail reçu] : Alerte CAF - Votre déclaration trimestrielle a été validée. Un remboursement de 320€ est en attente sur votre dossier. Cliquez ici pour le recevoir sous 48h.",
                options: [
                    { text: "« Je me connecte directement sur l'application officielle de la CAF sans cliquer sur ce mail. »", type: "good" },
                    { text: "« 320€ ? Ça ferait du bien ce mois-ci... Je vais regarder le site sans donner mon mot de passe. »", type: "medium" },
                    { text: "« Super ! Je clique sur le lien et je rentre mes identifiants de connexion CAF. »", type: "bad" }
                ]
            },
            "medium": {
                speaker: "CAF (L'Ombre)",
                dialogue: "[Le site factice s'ouvre] : Pour recevoir votre virement CAF de 320€, vous devez confirmer vos informations de carte bancaire ainsi que votre numéro de téléphone. Remplissez le formulaire.",
                options: [
                    { text: "« La CAF ne demande jamais de numéro de carte bancaire pour verser une aide. Je ferme tout. »", type: "good" },
                    { text: "« Je saisis mes codes de carte, mais pas mon numéro de téléphone personnel. »", type: "medium" },
                    { text: "« D'accord, je remplis tout le formulaire pour recevoir le virement rapidement. »", type: "bad" }
                ]
            },
            "bad": {
                speaker: "Faux Conseiller (L'Ombre)",
                dialogue: "[Appel téléphonique] : Bonjour, je suis M. Rossi, conseiller fraude de votre banque. Un achat suspect de 450€ est en cours avec votre carte. Je vous envoie un code SMS pour l'annuler !",
                options: [
                    { text: "« Un conseiller ne demande jamais de code secret par téléphone. Je raccroche et j'appelle mon agence. »", type: "good" },
                    { text: "« C'est bizarre... Pouvez-vous me dire mon adresse postale pour prouver que vous êtes de ma banque ? »", type: "medium" },
                    { text: "« Oh non ! Bloquez ça vite ! Le code reçu par SMS est le 7392. »", type: "bad" }
                ]
            }
        },
        3: {
            "good": {
                speaker: "Faux Conseiller (L'Ombre)",
                dialogue: "[SMS urgent reçu] : Sécurité Banque - Votre compte va être bloqué pour activité suspecte. Connectez-vous d'urgence sur : securite-ma-banque.com pour lever le blocage.",
                options: [
                    { text: "« C'est du phishing. Je supprime le message et j'ouvre mon application bancaire officielle. »", type: "good" },
                    { text: "« Je vais appeler ma banque pour savoir si c'est vrai avant de faire quoi que ce soit. »", type: "medium" },
                    { text: "« Je ne peux pas avoir mon compte bloqué ! Je clique et je me connecte. »", type: "bad" }
                ]
            },
            "medium": {
                speaker: "Faux Conseiller (L'Ombre)",
                dialogue: "[Le faux conseiller insiste au téléphone] : Madame, je vous assure que c'est la banque. La notification sur votre écran est une annulation. Validez-la rapidement sur votre application mobile !",
                options: [
                    { text: "« C'est faux, valider une notification autorise un débit, pas un remboursement. Je raccroche. »", type: "good" },
                    { text: "« Je vais rejeter la notification sur mon téléphone et voir si l'appel coupe. »", type: "medium" },
                    { text: "« D'accord, j'ouvre mon application et je clique sur Valider. »", type: "bad" }
                ]
            },
            "bad": {
                speaker: "Faux Conseiller (L'Ombre)",
                dialogue: "[L'arnaqueur tente le coup final] : Très bien, la fraude est bloquée. Pour sécuriser le reste de vos comptes, nous devons transférer vos 2500€ d'épargne vers un Livret de Protection temporaire.",
                options: [
                    { text: "« Un livret temporaire externe n'existe pas. C'est une arnaque, je raccroche immédiatement. »", type: "good" },
                    { text: "« Je peux faire le virement vers mon propre livret A plutôt ? »", type: "medium" },
                    { text: "« D'accord, je fais le virement immédiatement pour protéger mon argent. »", type: "bad" }
                ]
            }
        }
    },

    // ----------------------------------------------------
    // PERSO 2 : LA GRAND-MÈRE HACKER (Urgence Familiale)
    // ----------------------------------------------------
    2: {
        1: {
            speaker: "Faux Petit-Fils (L'Ombre)",
            dialogue: "[SMS d'un numéro inconnu] : Coucou mamie. J'ai cassé mon téléphone. C'est mon nouveau numéro temporaire. Envoie-moi un message sur WhatsApp au plus vite !",
            options: [
                { text: "« J'appelle immédiatement mon petit-fils sur son numéro habituel pour vérifier si c'est lui. »", type: "good" },
                { text: "« Oh mon pauvre ! Je t'ajoute sur WhatsApp pour que tu m'expliques ce qui s'est passé. »", type: "medium" },
                { text: "« Ah mon chéri ! D'accord, je t'envoie un message sur WhatsApp tout de suite. »", type: "bad" }
            ]
        },
        2: {
            "good": {
                speaker: "Faux Support Microsoft (L'Ombre)",
                dialogue: "[Alerte écran d'ordinateur] : Windows a détecté un virus grave qui va détruire toutes vos photos de famille. Appelez notre support gratuit au 01 80 90 XX pour débloquer votre PC.",
                options: [
                    { text: "« Microsoft ne demande jamais d'appeler par pop-up. Je redémarre mon ordinateur. »", type: "good" },
                    { text: "« C'est paniquant... Je vais appeler un informaticien local ou un voisin plutôt que ce numéro. »", type: "medium" },
                    { text: "« Vite, j'appelle le numéro affiché pour sauver mes photos ! »", type: "bad" }
                ]
            },
            "medium": {
                speaker: "Faux Petit-Fils (L'Ombre)",
                dialogue: "[Sur WhatsApp] : Mamie, j'ai un gros problème... J'ai une facture urgente de 950€ à payer en ligne et ma banque bloque ma carte car j'ai changé de téléphone. Peux-tu me dépanner ?",
                options: [
                    { text: "« Je ne fais jamais de virement ou de prêt par message. Viens me voir ou appelle-moi de vive voix. »", type: "good" },
                    { text: "« 950€ c'est beaucoup... Est-ce que je peux t'envoyer un chèque par la poste plutôt ? »", type: "medium" },
                    { text: "« Bien sûr mon chéri. Donne-moi les coordonnées pour faire le virement. »", type: "bad" }
                ]
            },
            "bad": {
                speaker: "Faux Petit-Fils (L'Ombre)",
                dialogue: "[Sur WhatsApp] : Merci mamie ! Pour que je puisse payer la facture tout de suite, envoie-moi une photo de ta carte bancaire (recto-verso) pour que je tape les numéros.",
                options: [
                    { text: "« Envoyer une photo de carte bancaire est extrêmement dangereux. Je refuse catégoriquement. »", type: "good" },
                    { text: "« Je te donne les numéros par écrit, mais pas le code à 3 chiffres (CVV) derrière. »", type: "medium" },
                    { text: "« D'accord, je prends la carte en photo et je te l'envoie sur WhatsApp. »", type: "bad" }
                ]
            }
        },
        3: {
            "good": {
                speaker: "Faux Conseiller (L'Ombre)",
                dialogue: "[Appel téléphonique] : Bonjour Madame, c'est le service sécurité de votre banque. Votre ordinateur a été piraté et ils tentent de vider vos comptes. Donnez-moi vos identifiants pour les bloquer !",
                options: [
                    { text: "« La banque ne demande jamais mes codes secrets par téléphone. Je raccroche immédiatement. »", type: "good" },
                    { text: "« Pouvez-vous bloquer mes comptes vous-même sans mes codes ? C'est votre travail. »", type: "medium" },
                    { text: "« Ah mon Dieu ! D'accord, mon identifiant est le 847291 et mon code est... »", type: "bad" }
                ]
            },
            "medium": {
                speaker: "Faux Petit-Fils (L'Ombre)",
                dialogue: "[Sur WhatsApp] : S'il te plaît mamie, c'est super urgent, l'huissier va venir chez moi si je ne paye pas avant 15h. Fais un virement immédiat sur ce RIB externe !",
                options: [
                    { text: "« Un huissier ne vient pas pour 950€ en quelques heures. Je refuse ce virement suspect. »", type: "good" },
                    { text: "« Je vais appeler ton père ou ta mère pour voir si on peut payer à plusieurs. »", type: "medium" },
                    { text: "« D'accord, j'ajoute le RIB sur mon compte et je fais le virement tout de suite. »", type: "bad" }
                ]
            },
            "bad": {
                speaker: "Faux Conseiller (L'Ombre)",
                dialogue: "[Au téléphone] : Bonjour Madame, pour valider l'aide d'urgence pour votre petit-fils, vous allez recevoir une notification sur votre téléphone. Cliquez sur 'Valider' pour autoriser l'opération.",
                options: [
                    { text: "« C'est une arnaque, je refuse de valider quoi que ce soit et je raccroche. »", type: "good" },
                    { text: "« Je vais valider, mais dites-moi le nom exact de l'organisme qui reçoit l'argent. »", type: "medium" },
                    { text: "« D'accord, je valide la notification sur mon écran. »", type: "bad" }
                ]
            }
        }
    },

    // ----------------------------------------------------
    // PERSO 3 : L'EMPLOYÉ DÉBORDÉ (Fraude au Président)
    // ----------------------------------------------------
    3: {
        1: {
            speaker: "Directeur Général (L'Ombre)",
            dialogue: "[E-mail Confidentiel] : Bonjour, nous devons réaliser une acquisition urgente et ultra-secrète d'un fournisseur à l'étranger. Faites un virement immédiat de 4500€ sur le RIB ci-joint. Discrétion absolue exigée.",
            options: [
                { text: "« Je n'effectue aucun virement hors procédure officielle, même sur ordre du DG. J'appelle sa ligne directe. »", type: "good" },
                { text: "« C'est étrange... Je vais demander confirmation par la messagerie de chat interne de la boîte. »", type: "medium" },
                { text: "« Le DG a l'air pressé et je suis débordé. Je prépare le virement et j'ajoute le RIB de suite. »", type: "bad" }
            ]
        },
        2: {
            "good": {
                speaker: "Directeur Général (L'Ombre)",
                dialogue: "[Appel pressant du DG sur son mobile] : Allô, c'est le DG. Pourquoi le virement n'est pas fait ? Les négociations bloquent, c'est une faute grave si nous ratons ce contrat par votre faute !",
                options: [
                    { text: "« La procédure de l'entreprise exige la double signature du directeur financier. Je refuse. »", type: "good" },
                    { text: "« D'accord, je le fais mais je vous demande de m'envoyer un e-mail signé cryptographiquement. »", type: "medium" },
                    { text: "« Excusez-moi M. le Directeur ! Je fais le virement immédiatement. »", type: "bad" }
                ]
            },
            "medium": {
                speaker: "Directeur Général (L'Ombre)",
                dialogue: "[Le faux DG s'énerve par e-mail] : Le chat interne est surveillé, c'est pour cela que je passe par e-mail sécurisé ! Ne posez pas de questions, l'avenir de la boîte est en jeu. Validez le virement !",
                options: [
                    { text: "« Justement, si c'est si secret, c'est suspect. Je bloque et je préviens le service IT. »", type: "good" },
                    { text: "« Je vais appeler mon responsable direct pour lui demander conseil en toute discrétion. »", type: "medium" },
                    { text: "« Très bien, j'effectue le virement pour ne pas nuire aux projets de l'entreprise. »", type: "bad" }
                ]
            },
            "bad": {
                speaker: "Directeur Général (L'Ombre)",
                dialogue: "[Le faux DG enchaîne] : Parfait, le premier virement est reçu. Mais les frais douaniers bloquent la transaction. Faites un second virement d'urgence de 3500€ sur ce RIB de transit.",
                options: [
                    { text: "« Deux virements de suite sur des comptes différents ? C'est une escroquerie. Je coupe les ponts. »", type: "good" },
                    { text: "« 3500€ ? Je dois d'abord obtenir le feu vert écrit de la comptabilité pour ça. »", type: "medium" },
                    { text: "« D'accord, je valide ce deuxième transfert pour finaliser le dossier d'achat. »", type: "bad" }
                ]
            }
        },
        3: {
            "good": {
                speaker: "Directeur Général (L'Ombre)",
                dialogue: "[Le faux Directeur menace de licenciement] : C'est un ordre direct ! Si vous refusez de faire ce virement confidentiel, vous serez licencié pour insubordination dès demain matin !",
                options: [
                    { text: "« Les menaces de licenciement par téléphone pour forcer un virement confirment l'arnaque. Je raccroche. »", type: "good" },
                    { text: "« Laissez-moi appeler les ressources humaines pour vérifier la procédure légale. »", type: "medium" },
                    { text: "« S'il vous plaît non... Je ne veux pas perdre mon travail. Je fais le virement. »", type: "bad" }
                ]
            },
            "medium": {
                speaker: "Directeur Général (L'Ombre)",
                dialogue: "[Le faux Directeur change de méthode] : Écoutez, je sais que vous êtes sous pression. Faites ce virement de 4500€ et je vous promets une prime exceptionnelle de 1000€ sur votre salaire.",
                options: [
                    { text: "« Une prime promise par téléphone pour un virement secret ? C'est illégal. Je refuse. »", type: "good" },
                    { text: "« Je veux bien le faire si vous m'envoyez d'abord le contrat écrit de cette prime. »", type: "medium" },
                    { text: "« D'accord, merci pour la prime ! Je valide le virement de suite. »", type: "bad" }
                ]
            },
            "bad": {
                speaker: "Directeur Général (L'Ombre)",
                dialogue: "[L'arnaqueur va au bout] : Excellent. Pour clore le dossier, le service de sécurité va vous envoyer une notification de validation sur votre téléphone pro. Validez-la immédiatement.",
                options: [
                    { text: "« Valider une notification sans motif clair est extrêmement risqué. Je refuse. »", type: "good" },
                    { text: "« Je vais appeler le service informatique pour confirmer la provenance de cette notification. »", type: "medium" },
                    { text: "« D'accord, je valide la notification d'authentification sur mon téléphone. »", type: "bad" }
                ]
            }
        }
    }
};

// --- Sélection des éléments DOM ---
const playerHpBar = document.getElementById("playerHpBar");
const playerHpText = document.getElementById("playerHpText");
const enemyHpBar = document.getElementById("enemyHpBar");
const enemyHpText = document.getElementById("enemyHpText");
const playerNameText = document.getElementById("playerName");
const speakerLabel = document.getElementById("speakerLabel");
const dialogueText = document.getElementById("dialogueText");
const optionsBox = document.getElementById("optionsBox");
const gameContainer = document.getElementById("gameContainer");

// Sprites
const playerSprite = document.getElementById("playerSprite");
const enemySprite = document.getElementById("enemySprite");
const playerSpriteBox = document.querySelector(".player-sprite-box");
const enemySpriteBox = document.querySelector(".enemy-sprite-box");

// Overlay de fin
const endScreen = document.getElementById("endScreen");
const endIcon = document.getElementById("endIcon");
const endTitle = document.getElementById("endTitle");
const endDescription = document.getElementById("endDescription");
const playerFinalHp = document.getElementById("playerFinalHp");
const scamsBlocked = document.getElementById("scamsBlocked");
const ctaBtn = document.getElementById("ctaBtn");

// Écran de sélection des personnages
const charSelectScreen = document.getElementById("charSelectScreen");
const charCards = document.querySelectorAll(".char-card");

// --- Gestion de la Sélection des Personnages ---
charCards.forEach(card => {
    card.addEventListener("click", () => {
        const charId = parseInt(card.getAttribute("data-char"));
        selectCharacter(charId);
    });
});

function selectCharacter(charId) {
    selectedChar = charId;
    
    // Animation de sélection sur la carte cliquée
    const selectedCard = document.querySelector(`.char-card[data-char="${charId}"]`);
    selectedCard.classList.add("selected-animation");
    
    // Met le preview de la carte en pose d'action (Ligne 3)
    const preview = selectedCard.querySelector('.char-pixel-preview');
    preview.style.backgroundPositionY = "100%";
    
    // Configurer le nom du joueur
    playerNameText.textContent = charNames[selectedChar];
    
    // Configurer les sprites du joueur et de l'ennemi
    playerSprite.className = "pixel-sprite player-pixel-sprite char-" + selectedChar + "-active";
    enemySprite.className = "pixel-sprite enemy-pixel-sprite char-enemy-active";
    
    // Position de départ : Joueur en pose Action/Prêt (Ligne 3), Ennemi en Idle (Ligne 0)
    setSpritePose(playerSprite, selectedChar, 3);
    setSpritePose(enemySprite, 4, 0);

    // Attendre 800ms pour apprécier le choix visuel
    setTimeout(() => {
        setSpritePose(playerSprite, selectedChar, 0); // Retour Idle
        charSelectScreen.classList.add("hidden");
        
        setTimeout(() => {
            loadRound();
        }, 300);
    }, 800);
}

// --- Positionner un Sprite du Sprite Sheet (Découpe CSS) ---
// colIdx: 0 à 4 (Perso), rowIdx: 0: Idle, 1: Walk1, 2: Walk2, 3: Hit/Action
function setSpritePose(spriteEl, colIdx, rowIdx) {
    const xPct = colIdx * 25; // 0%, 25%, 50%, 75%, 100%
    const yPct = rowIdx * 33.333; // 0%, 33.333%, 66.666%, 100%
    spriteEl.style.backgroundPositionX = xPct + "%";
    spriteEl.style.backgroundPositionY = yPct + "%";
}

// --- Animation de parole (Bouche/Mouvement) pendant les dialogues ---
let talkInterval = null;
function startTalkingAnimation(spriteEl, colIdx) {
    if (talkInterval) clearInterval(talkInterval);
    let talkFrame = 0;
    talkInterval = setInterval(() => {
        // Alterne entre Idle (0) et Action/Talk (3) pour simuler la parole
        talkFrame = talkFrame === 0 ? 3 : 0;
        setSpritePose(spriteEl, colIdx, talkFrame);
    }, 150);
}

function stopTalkingAnimation(spriteEl, colIdx) {
    if (talkInterval) {
        clearInterval(talkInterval);
        talkInterval = null;
    }
    setSpritePose(spriteEl, colIdx, 0); // Retour Idle
}

// --- Animation de Pas/Marche pendant un Dash ---
function animateWalkCycle(spriteEl, colIdx, duration, callback) {
    let frame = 1;
    const intervalTime = 80; // ms par frame
    
    const walkInterval = setInterval(() => {
        setSpritePose(spriteEl, colIdx, frame);
        frame = frame === 1 ? 2 : 1; // Alterne entre Walk 1 (ligne 1) et Walk 2 (ligne 2)
    }, intervalTime);
    
    setTimeout(() => {
        clearInterval(walkInterval);
        if (callback) callback();
    }, duration);
}

// --- Chargement d'une manche ---
function loadRound() {
    let roundData;

    if (currentRound === 1) {
        roundData = dialogueTree[selectedChar][1];
    } else {
        roundData = dialogueTree[selectedChar][currentRound][lastChoiceType];
    }

    // Mise à jour de l'interlocuteur
    speakerLabel.textContent = roundData.speaker;
    document.querySelector(".dialogue-box").className = "dialogue-box speaker-enemy";

    // Écriture progressive
    typeText(roundData.dialogue, () => {
        displayOptions(roundData.options);
    });
}

// --- Effet Machine à Écrire avec Animation de Parole ---
function typeText(text, callback) {
    dialogueText.innerHTML = "";
    isTyping = true;
    let i = 0;
    const speed = 15; // ms par caractère

    // Déterminer qui parle
    const isPlayer = (speakerLabel.textContent === "Vous");
    const activeSprite = isPlayer ? playerSprite : enemySprite;
    const activeCol = isPlayer ? selectedChar : 4;

    // Lancer l'animation de parole
    startTalkingAnimation(activeSprite, activeCol);

    function type() {
        if (i < text.length) {
            dialogueText.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            isTyping = false;
            // Arrêter l'animation de parole
            stopTalkingAnimation(activeSprite, activeCol);
            if (callback) callback();
        }
    }
    type();
}

// --- Affichage des boutons de choix ---
function displayOptions(options) {
    optionsBox.innerHTML = "";
    
    // Mélange des options pour éviter que la position donne un indice
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

// --- Application des effets de combat, dégâts et animations ---
function applyCombatEffects(choiceType) {
    if (choiceType === "good" || choiceType === "medium") {
        if (choiceType === "good") scamsBlockedCount++;
        
        const dmg = choiceType === "good" ? DAMAGE_GOOD : DAMAGE_MEDIUM;

        // --- ATTAQUE DU JOUEUR (Dash et animations de pas) ---
        playerSpriteBox.classList.add("dash-attack-player");
        
        // Démarrer le cycle de marche
        animateWalkCycle(playerSprite, selectedChar, 250, () => {
            // Une fois arrivé au point d'impact (250ms) : Poser l'attaque
            setSpritePose(playerSprite, selectedChar, 3); // Ligne 3 : Action
            
            // Effet d'impact sur l'ennemi
            enemySpriteBox.classList.add("shake-character");
            setSpritePose(enemySprite, 4, 3); // Ennemi grimace / subit (Ligne 3)
            gameContainer.classList.add("flash-cyan");
            
            // Réduction des HP de l'arnaqueur
            enemyHp = Math.max(0, enemyHp - dmg);
            updateHpBars();
        });

        // Fin de l'attaque, retour à la position d'origine
        setTimeout(() => {
            setSpritePose(playerSprite, selectedChar, 0); // Retour Idle
            setSpritePose(enemySprite, 4, 0); // Ennemi retour Idle
            playerSpriteBox.classList.remove("dash-attack-player");
            enemySpriteBox.classList.remove("shake-character");
            gameContainer.classList.remove("flash-cyan");
            nextStep();
        }, 650);

    } else if (choiceType === "bad") {
        // --- ATTAQUE DE L'ARNAQUEUR ---
        enemySpriteBox.classList.add("dash-attack-enemy");

        // Démarrer le cycle de marche
        animateWalkCycle(enemySprite, 4, 250, () => {
            // Point d'impact
            setSpritePose(enemySprite, 4, 3); // Ligne 3 : Action
            
            // Effet d'impact sur le joueur
            playerSpriteBox.classList.add("shake-character");
            setSpritePose(playerSprite, selectedChar, 3); // Le joueur encaisse (Ligne 3)
            gameContainer.classList.add("flash-red");
            
            // Réduction des HP du joueur
            playerHp = Math.max(0, playerHp - DAMAGE_BAD);
            updateHpBars();
        });

        // Fin de l'attaque
        setTimeout(() => {
            setSpritePose(playerSprite, selectedChar, 0); // Retour Idle
            setSpritePose(enemySprite, 4, 0); // Retour Idle
            enemySpriteBox.classList.remove("dash-attack-enemy");
            playerSpriteBox.classList.remove("shake-character");
            gameContainer.classList.remove("flash-red");
            nextStep();
        }, 650);
    }
}

// --- Mise à jour visuelle des barres de vie ---
function updateHpBars() {
    playerHpBar.style.width = playerHp + "%";
    playerHpText.textContent = playerHp + "/100 HP";
    
    enemyHpBar.style.width = enemyHp + "%";
    enemyHpText.textContent = enemyHp + "/100 HP";
}

// --- Transition vers l'étape suivante ---
function nextStep() {
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
    
    playerFinalHp.textContent = playerHp + " HP";
    scamsBlocked.textContent = scamsBlockedCount + " / 3";

    if (enemyHp <= 0) {
        endIcon.textContent = "🏆";
        endTitle.textContent = "KO Technique !";
        endTitle.style.color = "var(--primary)";
        endDescription.textContent = "Félicitations ! Vous avez déjoué toutes les tentatives de l'arnaqueur avec brio. Vos comptes et vos données personnelles sont parfaitement protégés !";
    } 
    else if (playerHp <= 0) {
        endIcon.textContent = "💀";
        endTitle.textContent = "Compte Siphonné !";
        endTitle.style.color = "var(--danger)";
        endDescription.textContent = "Aïe... Vous avez cédé à la pression ou fait confiance à l'arnaqueur. Vos économies ont été volées.";
    } 
    else {
        if (playerHp >= 65) {
            endIcon.textContent = "🛡️";
            endTitle.textContent = "Arnaque déjouée... de peu !";
            endTitle.style.color = "var(--warning)";
            endDescription.textContent = "Vous avez évité le piratage de vos comptes bancaires, mais vos hésitations et vos réponses moyennes auraient pu donner du temps à l'arnaqueur.";
        } else {
            endIcon.textContent = "⚠️";
            endTitle.textContent = "Tentative réussie...";
            endTitle.style.color = "var(--danger)";
            endDescription.textContent = "Bien que vous ne soyez pas totalement ruiné, l'arnaqueur a réussi à vous faire douter et a récolté des informations clés.";
        }
    }

    endScreen.classList.add("active");

    ctaBtn.addEventListener("click", () => {
        alert("Félicitations ! L'application de sécurité 'AntiArnaque' s'installe (simulation).");
    });
}
