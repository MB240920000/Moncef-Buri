/* ==========================================================================
   Portail HubSpot — Portfolio Moncef
   Logique de la SPA : rendu des vues, navigation, tour guidé.
   ========================================================================== */

(function () {
  "use strict";

  const root = document.getElementById("view-root");
  const visited = new Set();
  let activeFilter = "all";
  let searchQuery = "";
  let bannerDismissed = false;

  const TYPE_CLASS = {
    Complet: "pill-complet",
    Hybride: "pill-hybride",
    Ponctuel: "pill-ponctuel",
  };

  /* ------------------------------------------------------------------ */
  /* Routeur minimal basé sur le hash                                    */
  /* ------------------------------------------------------------------ */

  function parseHash() {
    const hash = location.hash.replace(/^#\/?/, "");
    if (hash.startsWith("client/")) {
      const id = hash.slice("client/".length);
      if (CLIENTS.some((c) => c.id === id)) return { view: "record", id };
    }
    return { view: "list" };
  }

  function goTo(hash) {
    location.hash = hash;
  }

  window.addEventListener("hashchange", render);

  /* ------------------------------------------------------------------ */
  /* Rendu                                                                */
  /* ------------------------------------------------------------------ */

  function render() {
    const route = parseHash();
    if (route.view === "record") {
      visited.add(route.id);
      root.innerHTML = renderRecord(route.id);
      window.scrollTo(0, 0);
      bindRecordEvents(route.id);
    } else {
      root.innerHTML = renderList();
      bindListEvents();
    }
    maybeAdvanceTourOnRender();
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function logoMarkup(client, size, extraClass) {
    const initials = escapeHtml(client.initiales);
    const cls = extraClass ? `logo-badge ${extraClass}` : "logo-badge";
    return `<span class="${cls}" style="background:${client.couleur};width:${size}px;height:${size}px;font-size:${Math.round(
      size * 0.38
    )}px">${initials}</span>`;
  }

  /* ------------------------------------------------------------------ */
  /* Vue Liste                                                           */
  /* ------------------------------------------------------------------ */

  const FILTERS = [
    { key: "all", label: "Tous les clients" },
    { key: "Complet", label: "Accompagnement complet" },
    { key: "Hybride", label: "Hybride" },
    { key: "Ponctuel", label: "Missions ponctuelles" },
  ];

  function filteredClients() {
    let list = CLIENTS;
    if (activeFilter !== "all") {
      list = list.filter((c) => c.typeAccompagnement === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (c) => c.nom.toLowerCase().includes(q) || c.secteur.toLowerCase().includes(q)
      );
    }
    return list;
  }

  function renderList() {
    const list = filteredClients();
    const rows = list
      .map((c) => {
        const pillClass = TYPE_CLASS[c.typeAccompagnement] || "";
        const isVisited = visited.has(c.id);
        return `
        <tr tabindex="0" role="button" data-id="${c.id}" aria-label="Ouvrir la fiche ${escapeHtml(c.nom)}">
          <td>
            <div class="cell-name">
              ${logoMarkup(c, 26)}
              <span class="name-link">${escapeHtml(c.nom)}</span>
            </div>
          </td>
          <td class="col-hide-tablet">${escapeHtml(c.secteur)}</td>
          <td><span class="pill ${pillClass}">${escapeHtml(c.typeAccompagnement)}</span></td>
          <td class="col-hide-tablet">
            <div class="tag-row">${c.stack
              .slice(0, 3)
              .map((s) => `<span class="tag">${escapeHtml(s)}</span>`)
              .join("")}${c.stack.length > 3 ? `<span class="tag">+${c.stack.length - 3}</span>` : ""}</div>
          </td>
          <td class="col-hide-mobile">${escapeHtml(c.duree)}</td>
          <td class="cell-realisations"><b>${c.realisations.length}</b> consignées</td>
          <td class="col-hide-mobile">${isVisited ? '<span class="visited-check">✓ Vu</span>' : '<span class="visited-dash">—</span>'}</td>
        </tr>`;
      })
      .join("");

    const tabs = FILTERS.map((f) => {
      const count = f.key === "all" ? CLIENTS.length : CLIENTS.filter((c) => c.typeAccompagnement === f.key).length;
      return `<button class="view-tab ${activeFilter === f.key ? "active" : ""}" data-filter="${f.key}">
        ${f.label} <span class="count">${count}</span>
      </button>`;
    }).join("");

    return `
    ${!bannerDismissed ? `
    <div class="info-banner" id="info-banner">
      <div class="info-banner-text">
        <strong>Bienvenue sur mon portail.</strong> Ce site reproduit l'interface de HubSpot pour présenter les clients que j'accompagne — parcourez les fiches comme un vrai CRM.
      </div>
      <button class="btn btn-dark" id="banner-contact">Me contacter</button>
      <button class="info-banner-close" id="banner-close" aria-label="Fermer le bandeau">✕</button>
    </div>` : ""}

    <div class="list-header">
      <div class="object-selector" id="tour-object-selector">🏢 Clients accompagnés <span class="chevron">▾</span></div>
      <button class="btn btn-dark" id="header-contact">Me contacter</button>
    </div>

    <div class="view-tabs" id="tour-view-tabs">
      ${tabs}
      <button class="view-tab add" aria-label="Ajouter une vue">＋</button>
    </div>

    <div class="toolbar">
      <input type="text" class="toolbar-search-input" id="search-input" placeholder="Rechercher un client…" value="${escapeHtml(searchQuery)}" aria-label="Rechercher un client">
      <button class="toolbar-btn">Vue de tableau <span class="chevron">▾</span></button>
      <button class="toolbar-btn">Modifier les colonnes</button>
      <button class="toolbar-btn active">Filtres</button>
      <button class="toolbar-btn">Trier</button>
      <div class="toolbar-spacer"></div>
      <button class="toolbar-btn">Exporter</button>
    </div>

    <div class="filter-row">
      <span class="filter-link">Propriétaire de la fiche ▾</span>
      <span class="filter-link">Secteur ▾</span>
      <span class="filter-link">Type d'accompagnement ▾</span>
      <span class="filter-link">Stack ▾</span>
      <span class="filter-link">Filtres avancés</span>
    </div>

    <div class="table-card" id="tour-table">
      <table class="client-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th class="col-hide-tablet">Secteur</th>
            <th>Type d'accompagnement</th>
            <th class="col-hide-tablet">Stack</th>
            <th class="col-hide-mobile">Durée</th>
            <th>Réalisations</th>
            <th class="col-hide-mobile">Vu</th>
          </tr>
        </thead>
        <tbody>
          ${rows || `<tr><td colspan="7"><div class="empty-state">Aucun client ne correspond à ces filtres.</div></td></tr>`}
        </tbody>
      </table>
      <div class="table-footer">
        <div class="pagination-dots">
          <span>‹</span><span class="current">1</span><span>›</span>
        </div>
        <div class="explored-counter">Fiches explorées <b>${visited.size}</b>/${CLIENTS.length}</div>
      </div>
    </div>
    `;
  }

  function bindListEvents() {
    document.querySelectorAll(".client-table tbody tr[data-id]").forEach((tr) => {
      tr.addEventListener("click", () => goTo(`#/client/${tr.dataset.id}`));
      tr.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goTo(`#/client/${tr.dataset.id}`);
        }
      });
    });

    document.querySelectorAll(".view-tab[data-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeFilter = btn.dataset.filter;
        render();
      });
    });

    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value;
        const focusPos = searchInput.selectionStart;
        render();
        const newInput = document.getElementById("search-input");
        if (newInput) {
          newInput.focus();
          newInput.setSelectionRange(focusPos, focusPos);
        }
      });
    }

    const bannerClose = document.getElementById("banner-close");
    if (bannerClose) {
      bannerClose.addEventListener("click", () => {
        bannerDismissed = true;
        render();
      });
    }

    const bannerContact = document.getElementById("banner-contact");
    if (bannerContact) bannerContact.addEventListener("click", scrollToContactOrOpen);

    const headerContact = document.getElementById("header-contact");
    if (headerContact) headerContact.addEventListener("click", scrollToContactOrOpen);
  }

  function scrollToContactOrOpen() {
    if (CONTACT_LINKS.meetings && CONTACT_LINKS.meetings !== "#") {
      window.open(CONTACT_LINKS.meetings, "_blank", "noopener");
    } else {
      goTo(`#/client/${CLIENTS[0].id}`);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Vue Fiche                                                            */
  /* ------------------------------------------------------------------ */

  function renderRecord(id) {
    const index = CLIENTS.findIndex((c) => c.id === id);
    const client = CLIENTS[index];
    const isLast = index === CLIENTS.length - 1;
    const pillClass = TYPE_CLASS[client.typeAccompagnement] || "";
    const today = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

    const realisationsHtml = client.realisations
      .map(
        (r) => `
      <div class="timeline-item">
        <div class="timeline-icon">${r.icone}</div>
        <div class="timeline-card">
          <h5>${escapeHtml(r.titre)}</h5>
          <p class="timeline-meta">consignée par Moncef</p>
          <p>${escapeHtml(r.description)}</p>
        </div>
      </div>`
      )
      .join("");

    const resultatsHtml = client.resultats
      .map((r) => `<li><span class="result-check">✓</span><span>${escapeHtml(r)}</span></li>`)
      .join("");

    const stackHtml = client.stack.map((s) => `<span class="tag">${escapeHtml(s)}</span>`).join("");

    return `
    <div class="record-view">
      <div class="record-topline">
        <button class="back-link" id="back-to-list">‹ Clients</button>
        <button class="toolbar-btn">Actions ▾</button>
      </div>

      <div class="record-col-left" id="tour-record-left">
        <div class="card record-header-card">
          ${logoMarkup(client, 52, "record-logo")}
          <h1 class="record-name">${escapeHtml(client.nom)}</h1>
          <a class="record-sector-link" href="javascript:void(0)">${escapeHtml(client.secteur)}</a>

          <div class="action-row">
            <button class="action-btn" title="Note" aria-label="Note">📝</button>
            <button class="action-btn" title="E-mail" aria-label="E-mail">✉️</button>
            <button class="action-btn" title="Appel" aria-label="Appel">📞</button>
            <button class="action-btn" title="Tâche" aria-label="Tâche">✅</button>
            <button class="action-btn next" title="Client suivant" aria-label="Client suivant" id="action-next">→</button>
          </div>
        </div>

        <div class="card about-panel">
          <div class="card-title-row">
            <p class="card-title">À propos de ce client</p>
            <button class="panel-toggle" aria-label="Réduire le panneau"><span class="chevron-toggle">▾</span></button>
          </div>
          <dl>
            <div class="about-row">
              <p class="about-label">Secteur</p>
              <p class="about-value">${escapeHtml(client.secteur)}</p>
            </div>
            <div class="about-row">
              <p class="about-label">Type d'accompagnement</p>
              <p class="about-value"><span class="pill ${pillClass}">${escapeHtml(client.typeAccompagnement)}</span></p>
            </div>
            <div class="about-row">
              <p class="about-label">Périmètre</p>
              <p class="about-value">${escapeHtml(client.perimetre)}</p>
            </div>
            <div class="about-row">
              <p class="about-label">Durée de la mission</p>
              <p class="about-value">${escapeHtml(client.duree)}</p>
            </div>
            <div class="about-row">
              <p class="about-label">Propriétaire de la fiche</p>
              <p class="about-value owner"><span class="owner-avatar">MB</span> Moncef — Consultant CRM &amp; Martech</p>
            </div>
          </dl>
        </div>
      </div>

      <div class="record-col-center" id="tour-record-center">
        <div class="record-tabs">
          <button class="record-tab active">Actualité</button>
          <button class="record-tab" disabled>Vue d'ensemble</button>
          <button class="record-tab" disabled>Activités</button>
          <button class="record-tab" disabled>Intelligence</button>
        </div>

        <div class="card">
          <div class="card-title-row">
            <p class="card-title">Informations sur la mission</p>
            <span class="ai-badge">✦ AI</span>
          </div>
          <p class="ai-meta">Généré le ${today} ⟳</p>
          <div class="summary-block">
            <h4>Contexte</h4>
            <p>${escapeHtml(client.resume.contexte)}</p>
            <h4>Rôle de Moncef</h4>
            <p>${escapeHtml(client.resume.role)}</p>
          </div>
          <button class="btn btn-outline-pink">✦ Poser une question</button>
        </div>

        <p class="section-heading">Réalisations <small>· consignées par Moncef</small></p>
        <div class="timeline">${realisationsHtml}</div>

        <div class="record-footer">
          <div class="record-footer-count">Client ${index + 1} sur ${CLIENTS.length}</div>
          <div class="record-footer-nav">
            <button class="btn btn-secondary" id="prev-client" ${index === 0 ? "disabled" : ""}>‹ Précédent</button>
            <button class="btn btn-dark" id="next-client">${isLast ? "Retour aux clients ›" : "Client suivant ›"}</button>
          </div>
        </div>
      </div>

      <div class="record-col-right" id="tour-record-right">
        <div class="card">
          <p class="card-title">Résultats de la mission</p>
          <ul class="result-list">${resultatsHtml}</ul>
        </div>

        <div class="card stack-panel">
          <p class="card-title">Stack associée</p>
          <div class="tag-row">${stackHtml}</div>
        </div>

        <div class="card contact-panel">
          <p>Un profil ou un poste qui pourrait correspondre à ce type d'accompagnement ?</p>
          <div class="contact-links">
            <a href="${CONTACT_LINKS.meetings}" target="_blank" rel="noopener">📅 Prendre rendez-vous</a>
            <a href="${CONTACT_LINKS.cv}" target="_blank" rel="noopener">📄 CV</a>
            <a href="${CONTACT_LINKS.linkedin}" target="_blank" rel="noopener">🔗 LinkedIn</a>
          </div>
        </div>
      </div>
    </div>
    `;
  }

  function bindRecordEvents(id) {
    const index = CLIENTS.findIndex((c) => c.id === id);
    const isLast = index === CLIENTS.length - 1;

    const back = document.getElementById("back-to-list");
    if (back) back.addEventListener("click", () => goTo("#/"));

    const prev = document.getElementById("prev-client");
    if (prev)
      prev.addEventListener("click", () => {
        if (index > 0) goTo(`#/client/${CLIENTS[index - 1].id}`);
      });

    const next = document.getElementById("next-client");
    if (next)
      next.addEventListener("click", () => {
        if (isLast) goTo("#/");
        else goTo(`#/client/${CLIENTS[index + 1].id}`);
      });

    const actionNext = document.getElementById("action-next");
    if (actionNext)
      actionNext.addEventListener("click", () => {
        if (isLast) goTo("#/");
        else goTo(`#/client/${CLIENTS[index + 1].id}`);
      });

    document.querySelectorAll(".panel-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const panel = btn.closest(".card");
        const dl = panel.querySelector("dl");
        const chevron = btn.querySelector(".chevron-toggle");
        dl.classList.toggle("collapsed");
        chevron.classList.toggle("collapsed");
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Navigation clavier globale                                          */
  /* ------------------------------------------------------------------ */

  document.addEventListener("keydown", (e) => {
    if (tourActive) return;
    const active = document.activeElement;
    const isTyping = active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA");
    if (isTyping) return;

    const route = parseHash();
    if (route.view === "record") {
      const index = CLIENTS.findIndex((c) => c.id === route.id);
      if (e.key === "ArrowRight" && index < CLIENTS.length - 1) {
        goTo(`#/client/${CLIENTS[index + 1].id}`);
      } else if (e.key === "ArrowLeft" && index > 0) {
        goTo(`#/client/${CLIENTS[index - 1].id}`);
      } else if (e.key === "Escape") {
        goTo("#/");
      }
    }
  });

  /* ------------------------------------------------------------------ */
  /* Onboarding : modal + visite guidée                                  */
  /* ------------------------------------------------------------------ */

  const ONBOARD_KEY = "hubspot_portfolio_onboarded";
  let tourActive = false;
  let tourStep = 0;

  const TOUR_STEPS = [
    {
      target: "#tour-table",
      title: "Voici mes clients",
      text: "Chaque ligne est un client accompagné, présenté comme une fiche dans un CRM HubSpot.",
      before: () => goTo("#/"),
    },
    {
      target: "#tour-view-tabs",
      title: "Filtrez par type d'accompagnement",
      text: "Accompagnement complet, hybride ou mission ponctuelle : les onglets filtrent réellement le tableau.",
      before: () => goTo("#/"),
    },
    {
      target: "#tour-record-left",
      title: "La fiche client",
      text: "En ouvrant un client, vous accédez à sa fiche complète — comme un vrai record HubSpot, en trois colonnes.",
      before: () => goTo(`#/client/${CLIENTS[0].id}`),
    },
    {
      target: "#tour-record-center",
      title: "Ce que j'ai fait pour lui",
      text: "Les réalisations sont consignées comme des activités dans la timeline de la fiche.",
      before: () => {},
    },
    {
      target: "#tour-record-right",
      title: "Ce que ça a changé",
      text: "Des résultats concrets, sans métriques inventées — et un moyen simple de me contacter.",
      before: () => {},
    },
  ];

  function markOnboarded() {
    try {
      localStorage.setItem(ONBOARD_KEY, "1");
    } catch (e) {
      /* stockage indisponible : pas bloquant */
    }
  }

  function hasOnboarded() {
    try {
      return localStorage.getItem(ONBOARD_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function showModal() {
    document.getElementById("welcome-overlay").classList.remove("hidden");
  }

  function hideModal() {
    document.getElementById("welcome-overlay").classList.add("hidden");
  }

  function startTour() {
    hideModal();
    markOnboarded();
    document.getElementById("help-fab").classList.remove("pulse");
    tourActive = true;
    tourStep = 0;
    runTourStep();
  }

  function skipTour() {
    tourActive = false;
    document.getElementById("tour-overlay").classList.add("hidden");
  }

  function maybeAdvanceTourOnRender() {
    if (!tourActive) return;
    requestAnimationFrame(positionTourStep);
  }

  function runTourStep() {
    const step = TOUR_STEPS[tourStep];
    if (!step) {
      skipTour();
      return;
    }
    step.before();
    document.getElementById("tour-overlay").classList.remove("hidden");
    requestAnimationFrame(() => requestAnimationFrame(positionTourStep));
  }

  function positionTourStep() {
    const step = TOUR_STEPS[tourStep];
    if (!step) return;
    const target = document.querySelector(step.target);
    const ring = document.getElementById("tour-ring");
    const bubble = document.getElementById("tour-bubble");

    document.getElementById("tour-step-label").textContent = `Étape ${tourStep + 1}/${TOUR_STEPS.length}`;
    document.getElementById("tour-title").textContent = step.title;
    document.getElementById("tour-text").textContent = step.text;
    document.getElementById("tour-next-btn").textContent =
      tourStep === TOUR_STEPS.length - 1 ? "Terminer" : "Suivant →";

    if (!target) {
      ring.classList.add("hidden");
      bubble.style.top = "50%";
      bubble.style.left = "50%";
      return;
    }

    const rect = target.getBoundingClientRect();
    const pad = 6;
    ring.classList.remove("hidden");
    ring.style.top = `${rect.top - pad}px`;
    ring.style.left = `${rect.left - pad}px`;
    ring.style.width = `${rect.width + pad * 2}px`;
    ring.style.height = `${rect.height + pad * 2}px`;

    const bubbleWidth = 300;
    let bubbleLeft = rect.left;
    if (bubbleLeft + bubbleWidth > window.innerWidth - 16) {
      bubbleLeft = window.innerWidth - bubbleWidth - 16;
    }
    if (bubbleLeft < 16) bubbleLeft = 16;

    let bubbleTop = rect.bottom + 16;
    if (bubbleTop + 160 > window.innerHeight) {
      bubbleTop = Math.max(16, rect.top - 176);
    }
    bubble.style.left = `${bubbleLeft}px`;
    bubble.style.top = `${bubbleTop}px`;
  }

  function nextTourStep() {
    tourStep += 1;
    if (tourStep >= TOUR_STEPS.length) {
      skipTour();
      return;
    }
    runTourStep();
  }

  window.addEventListener("resize", () => {
    if (tourActive) positionTourStep();
  });

  /* ------------------------------------------------------------------ */
  /* Initialisation                                                       */
  /* ------------------------------------------------------------------ */

  function init() {
    render();

    document.getElementById("tour-guided-btn").addEventListener("click", startTour);
    document.getElementById("explore-freely-btn").addEventListener("click", () => {
      hideModal();
      markOnboarded();
    });
    document.getElementById("tour-skip-btn").addEventListener("click", skipTour);
    document.getElementById("tour-next-btn").addEventListener("click", nextTourStep);
    document.getElementById("help-fab").addEventListener("click", startTour);

    if (hasOnboarded()) {
      document.getElementById("help-fab").classList.remove("pulse");
    } else {
      showModal();
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
