/* ==========================================================================
   Données du portfolio — portefeuille clients de Moncef
   Chaque client est un objet "fiche" affiché comme un record HubSpot.
   Les textes ci-dessous servent de gabarit et seront affinés par Moncef.
   ========================================================================== */

const CLIENTS = [
  {
    id: "daikin",
    nom: "Daikin",
    initiales: "DK",
    couleur: "#0b3d91",
    secteur: "Industriel · Chauffage & climatisation",
    typeAccompagnement: "Complet",
    perimetre: "Marketing + Sales · International",
    duree: "12+ mois · En cours",
    stack: ["HubSpot", "Salesforce", "Make", "Power BI"],
    resume: {
      contexte:
        "Filiale internationale sans CRM unifié : chaque marché pilotait ses campagnes et son pipeline commercial dans des outils différents.",
      role:
        "Cadrage de la migration vers HubSpot, structuration du modèle de données multi-pays et pilotage de l'implémentation avec les équipes locales.",
    },
    realisations: [
      { icone: "🧭", titre: "Modèle de données multi-pays cadré", description: "Aligné les marchés sur une même structure de comptes, contacts et deals." },
      { icone: "🔁", titre: "Migration de l'historique CRM", description: "Repris l'historique Sales et Marketing depuis l'ancien outil sans perte de données." },
      { icone: "🗂", titre: "Pipelines de vente par marché construits", description: "Défini des étapes et propriétés communes à toutes les filiales." },
      { icone: "⚙", titre: "Scoring des leads entrants automatisé", description: "Mis en place des workflows de qualification partagés par les marchés." },
      { icone: "🎓", titre: "Équipes locales formées", description: "Formé les équipes marketing et sales de chaque marché à l'usage quotidien de HubSpot." },
    ],
    resultats: [
      "Un référentiel unique de comptes et contacts partagé par tous les marchés.",
      "Équipes sales autonomes sur la création et le suivi de leurs deals.",
      "Reporting Marketing → Sales consolidé au niveau groupe.",
    ],
  },
  {
    id: "lexisnexis",
    nom: "LexisNexis",
    initiales: "LN",
    couleur: "#8a1f2d",
    secteur: "Information & services juridiques",
    typeAccompagnement: "Hybride",
    perimetre: "Marketing Ops",
    duree: "8 mois",
    stack: ["HubSpot", "Salesforce", "LinkedIn Ads", "Google Ads"],
    resume: {
      contexte:
        "Équipe marketing en croissance, dépendante de l'IT pour la moindre modification de workflow ou de formulaire.",
      role:
        "Accompagnement hybride : montée en autonomie de l'équipe marketing sur HubSpot, en binôme avec l'IT pour les intégrations Salesforce.",
    },
    realisations: [
      { icone: "🗂", titre: "Propriétés de contact nettoyées", description: "Documenté et supprimé les propriétés redondantes ou obsolètes." },
      { icone: "⚙", titre: "Workflows de nurturing reconstruits", description: "Rendus lisibles et maintenables directement par l'équipe marketing." },
      { icone: "🔗", titre: "Synchronisation HubSpot ↔ Salesforce alignée", description: "Fiabilisée sur les statuts de lead réellement utilisés par les sales." },
      { icone: "🎓", titre: "Équipe marketing formée", description: "Autonomie acquise sur la création de workflows et de rapports." },
    ],
    resultats: [
      "Équipe marketing autonome sur les workflows courants, sans ticket IT.",
      "Synchronisation HubSpot ↔ Salesforce fiabilisée sur les statuts de lead.",
      "Base de contacts nettoyée des doublons et propriétés obsolètes.",
    ],
  },
  {
    id: "guardian-glass",
    nom: "Guardian Glass",
    initiales: "GG",
    couleur: "#1f6f78",
    secteur: "Industriel · Verre & matériaux de construction",
    typeAccompagnement: "Complet",
    perimetre: "Marketing + Sales · Europe",
    duree: "14 mois · En cours",
    stack: ["HubSpot", "Make", "Aircall", "Power BI"],
    resume: {
      contexte:
        "Cycle de vente long et technique, porté par des commerciaux terrain peu équipés en outils digitaux.",
      role:
        "Implémentation complète de HubSpot du cadrage au déploiement, avec définition d'un cycle de vie du lead adapté au cycle de vente B2B industriel.",
    },
    realisations: [
      { icone: "🧭", titre: "Cycle de vie du lead défini", description: "Adapté à un cycle de vente long et multi-interlocuteurs." },
      { icone: "⚙", titre: "Scoring de leads implémenté", description: "Combine comportement digital et données déclaratives." },
      { icone: "🔗", titre: "Téléphonie connectée", description: "Aircall relié à HubSpot pour consigner automatiquement les appels sur les fiches contact." },
      { icone: "📊", titre: "Dashboards Power BI construits", description: "Croisent les données HubSpot et les objectifs commerciaux par région." },
    ],
    resultats: [
      "Cycle de vie du lead commun à toutes les équipes commerciales régionales.",
      "Appels commerciaux consignés automatiquement, sans saisie manuelle.",
      "Visibilité du pipeline par région pour le management commercial.",
    ],
  },
  {
    id: "fluxym",
    nom: "Fluxym",
    initiales: "FX",
    couleur: "#ff5c35",
    secteur: "Agence data & martech",
    typeAccompagnement: "Ponctuel",
    perimetre: "Audit technique HubSpot",
    duree: "3 semaines",
    stack: ["HubSpot", "Make"],
    resume: {
      contexte:
        "Agence partenaire sollicitée pour un audit technique d'un portail HubSpot existant avant une refonte du parcours client.",
      role:
        "Audit de la configuration existante et recommandations priorisées pour l'équipe technique interne.",
    },
    realisations: [
      { icone: "🔎", titre: "Configuration HubSpot auditée", description: "Propriétés, workflows et pipelines passés en revue, dette technique identifiée." },
      { icone: "🗂", titre: "Automatisations Make cartographiées", description: "Toutes les connexions entre Make et HubSpot documentées." },
      { icone: "🧭", titre: "Recommandations priorisées", description: "Classées par effort et impact pour l'équipe technique interne." },
    ],
    resultats: [
      "Diagnostic clair remis à l'équipe technique avant refonte.",
      "Priorisation des chantiers HubSpot validée avec les parties prenantes.",
      "Aucune interruption du portail existant pendant l'audit.",
    ],
  },
  {
    id: "attestis",
    nom: "Attestis",
    initiales: "AT",
    couleur: "#3b5bdb",
    secteur: "Assurance · Attestations & garanties",
    typeAccompagnement: "Hybride",
    perimetre: "Marketing + Service client",
    duree: "6 mois",
    stack: ["HubSpot", "Zapier", "Notion"],
    resume: {
      contexte:
        "Volume croissant de demandes entrantes traitées manuellement, sans traçabilité centralisée.",
      role:
        "Structuration du service client dans HubSpot en binôme avec le responsable support, en parallèle du pilotage marketing.",
    },
    realisations: [
      { icone: "🗂", titre: "Pipeline de tickets mis en place", description: "SLA définis par type de demande." },
      { icone: "🔗", titre: "Formulaire de contact connecté", description: "Routage automatique vers les files de tickets appropriées." },
      { icone: "⚙", titre: "Relances de qualification automatisées", description: "Workflows de service pour ne plus perdre de demandes." },
      { icone: "🎓", titre: "Équipe support formée", description: "Autonomie sur la gestion quotidienne des tickets." },
    ],
    resultats: [
      "Toutes les demandes entrantes tracées dans un pipeline unique.",
      "Délais de réponse visibles pour le management support.",
      "Équipe support autonome sur la gestion des tickets.",
    ],
  },
  {
    id: "agora-calyce",
    nom: "Agora Calycé",
    initiales: "AC",
    couleur: "#7048e8",
    secteur: "Immobilier · Résidences gérées",
    typeAccompagnement: "Ponctuel",
    perimetre: "Reporting commercial",
    duree: "2 mois",
    stack: ["HubSpot", "Google Ads"],
    resume: {
      contexte:
        "Difficulté à mesurer la performance des campagnes de génération de leads par résidence.",
      role:
        "Mission ponctuelle de mise en place d'un reporting fiable par résidence et par source d'acquisition.",
    },
    realisations: [
      { icone: "🗂", titre: "Propriétés de deal structurées", description: "Suivi de chaque résidence commercialisée." },
      { icone: "🔗", titre: "Campagnes Google Ads connectées", description: "Tracking des conversions relié à HubSpot." },
      { icone: "📊", titre: "Tableau de bord livré", description: "Performance par résidence et par source d'acquisition." },
    ],
    resultats: [
      "Performance commerciale visible résidence par résidence.",
      "Sources d'acquisition comparables entre elles.",
      "Tableau de bord autonome, sans dépendance à un consultant externe.",
    ],
  },
  {
    id: "witekio",
    nom: "Witekio",
    initiales: "WT",
    couleur: "#0b7285",
    secteur: "Ingénierie logicielle · IoT",
    typeAccompagnement: "Hybride",
    perimetre: "Marketing + Sales",
    duree: "7 mois",
    stack: ["HubSpot", "Sales Navigator", "Slack"],
    resume: {
      contexte:
        "Équipe commerciale technique, cycle de vente basé sur des recommandations et du réseau, peu structuré dans le CRM.",
      role:
        "Accompagnement hybride sur la structuration du pipeline commercial et l'automatisation de la remontée des opportunités entrantes.",
    },
    realisations: [
      { icone: "🧭", titre: "Pipeline commercial restructuré", description: "Autour des étapes réellement suivies par les ingénieurs commerciaux." },
      { icone: "🔗", titre: "HubSpot connecté à Slack", description: "Notification de l'équipe à chaque opportunité qualifiée." },
      { icone: "🗂", titre: "Base de contacts dédupliquée", description: "Nettoyage après plusieurs imports successifs." },
    ],
    resultats: [
      "Pipeline commercial reflétant le processus de vente réel.",
      "Équipe commerciale notifiée en temps réel des opportunités entrantes.",
      "Base de contacts fiabilisée pour les campagnes email.",
    ],
  },
  {
    id: "enership",
    nom: "Enership",
    initiales: "EN",
    couleur: "#2b8a3e",
    secteur: "Énergie · Efficacité énergétique",
    typeAccompagnement: "Complet",
    perimetre: "Marketing + Sales · France",
    duree: "10 mois · En cours",
    stack: ["HubSpot", "Make", "Aircall"],
    resume: {
      contexte:
        "Démarrage sans CRM structuré : l'équipe commerciale gérait son pipeline sur tableur.",
      role:
        "Implémentation complète de HubSpot depuis zéro : cadrage, configuration, automatisations et formation des équipes.",
    },
    realisations: [
      { icone: "🧭", titre: "Objets et propriétés cadrés", description: "Structure définie pour suivre l'activité commerciale." },
      { icone: "🗂", titre: "Pipeline de vente construit", description: "Automatisations de suivi des relances mises en place." },
      { icone: "⚙", titre: "Tâches de suivi automatisées", description: "Création selon le statut du deal." },
      { icone: "🎓", titre: "Équipe commerciale formée", description: "Usage quotidien de HubSpot maîtrisé en fin de mission." },
    ],
    resultats: [
      "Pipeline commercial unique remplaçant le suivi sur tableur.",
      "Relances commerciales automatisées selon le statut du deal.",
      "Équipe commerciale autonome sur HubSpot dès la fin de la mission.",
    ],
  },
  {
    id: "acciona",
    nom: "Acciona",
    initiales: "AN",
    couleur: "#1864ab",
    secteur: "Infrastructure · Énergies renouvelables",
    typeAccompagnement: "Hybride",
    perimetre: "Marketing Ops · Europe",
    duree: "5 mois",
    stack: ["HubSpot", "Salesforce", "Power BI"],
    resume: {
      contexte:
        "Grand groupe avec un CRM Salesforce établi côté sales, HubSpot récemment introduit côté marketing sans intégration propre.",
      role:
        "Fiabilisation de l'intégration HubSpot ↔ Salesforce et structuration du reporting marketing pour les équipes locales.",
    },
    realisations: [
      { icone: "🔎", titre: "Mapping de champs audité", description: "Corrections entre HubSpot et Salesforce." },
      { icone: "🗂", titre: "Doublons de contacts résolus", description: "Générés par une synchronisation mal configurée." },
      { icone: "📊", titre: "Reporting marketing consolidé", description: "Construit pour les équipes locales et le siège." },
    ],
    resultats: [
      "Synchronisation HubSpot ↔ Salesforce fiabilisée.",
      "Doublons de contacts résorbés et prévenus.",
      "Reporting marketing partagé entre les équipes locales et le siège.",
    ],
  },
  {
    id: "french-mush",
    nom: "French Mush",
    initiales: "FM",
    couleur: "#5c4033",
    secteur: "Agroalimentaire · Foodtech",
    typeAccompagnement: "Ponctuel",
    perimetre: "Mise en place HubSpot Starter",
    duree: "1 mois",
    stack: ["HubSpot"],
    resume: {
      contexte:
        "Jeune entreprise sans outil CRM : gestion des contacts commerciaux et distributeurs par email.",
      role:
        "Mission ponctuelle de mise en place d'un premier CRM structuré et simple à adopter.",
    },
    realisations: [
      { icone: "⚙", titre: "HubSpot Starter configuré", description: "Propriétés essentielles au suivi commercial mises en place." },
      { icone: "🗂", titre: "Base de contacts importée", description: "Contacts distributeurs existants structurés." },
      { icone: "🧭", titre: "Pipeline de vente simple mis en place", description: "Adapté à une petite équipe." },
    ],
    resultats: [
      "Premier CRM opérationnel dès la fin de la mission.",
      "Base de contacts distributeurs centralisée et exploitable.",
      "Équipe autonome sur un pipeline simple, sans surcharge d'outils.",
    ],
  },
];

/* TODO (Moncef) : remplacer ces 3 liens par les vrais avant mise en ligne.
   - meetings : lien HubSpot Meetings réel
   - cv : chemin vers le PDF réel (à déposer dans /assets)
   - linkedin : URL réelle du profil */
const CONTACT_LINKS = {
  meetings: "#",
  cv: "#",
  linkedin: "#",
};
