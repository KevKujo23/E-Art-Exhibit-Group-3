// index-load.js
// Fetch artworks from Firestore and render cards on the index page

document.addEventListener("DOMContentLoaded", async () => {
  const gallery = document.getElementById("gallery");
  const statusEl = document.getElementById("gallery-status");

  if (!gallery) return;

  statusEl.textContent = "Loading exhibition…";

  try {
    const snap = await db
      .collection("artworks")
      .orderBy("createdAt", "desc")
      .get();

    if (snap.empty) {
      statusEl.textContent = "No artworks have been submitted yet.";
      return;
    }

    const fragment = document.createDocumentFragment();

    snap.forEach((doc) => {
      const art = doc.data();
      const id = doc.id;

      const col = document.createElement("div");
      col.className = "col-12 col-md-6";

      const card = document.createElement("article");
      card.className = "art-card fade-in";
      card.dataset.type = (art.type || "other").toLowerCase();

      const typeLabel = (art.type || "Other").toLowerCase();
      const snippet = makeSnippet(art.describe || "");

      card.innerHTML = `
        <div class="art-card-header">
          <div class="art-type-pill" data-type="${typeLabel}">
            ${capitalize(typeLabel)}
          </div>
          <h3 class="art-title">${escapeHtml(art.title || "Untitled work")}</h3>
          <p class="art-meta">
            ${escapeHtml(art.artist || "Unknown artist")}
            ${art.year ? " · " + escapeHtml(art.year) : ""}
          </p>
          <p class="art-member">
            Submitted by: <strong>${escapeHtml(art.memberName || "Unknown member")}</strong>
          </p>
        </div>

        <p class="card-snippet">
          ${escapeHtml(snippet)}
        </p>

        <a href="artwork.html?id=${encodeURIComponent(id)}" class="text-link">
          View details →
        </a>
      `;

      col.appendChild(card);
      fragment.appendChild(col);
    });

    gallery.innerHTML = "";
    gallery.appendChild(fragment);
    statusEl.textContent = "";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Error loading artworks. Please try again later.";
  }
});

// make a short snippet from the Describe text
function makeSnippet(fullText) {
  const clean = fullText.replace(/\s+/g, " ").trim();
  if (clean.length <= 180) return clean;
  return clean.slice(0, 180) + "…";
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// basic HTML escaping to avoid issues
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
