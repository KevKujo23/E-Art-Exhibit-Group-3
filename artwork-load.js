// artwork-load.js
// Load a single artwork and fill the detail page

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const typeEl      = document.getElementById("detail-type");
  const titleEl     = document.getElementById("detail-title");
  const artistEl    = document.getElementById("detail-artist");
  const yearEl      = document.getElementById("detail-year");
  const memberEl    = document.getElementById("detail-member");
  const imageEl     = document.getElementById("detail-image");
  const describeEl  = document.getElementById("detail-describe");
  const interpretEl = document.getElementById("detail-interpret");
  const evaluateEl  = document.getElementById("detail-evaluate");

  // No ID in URL
  if (!id) {
    titleEl.textContent = "Artwork not found";
    console.error("No artwork id in URL");
    return;
  }

  try {
    const docSnap = await db.collection("artworks").doc(id).get();

    if (!docSnap.exists) {
      titleEl.textContent = "Artwork not found";
      console.error("Artwork doc not found:", id);
      return;
    }

    const art = docSnap.data();

    // Hero text
    const typeLabel = (art.type || "Artwork").toString();
    typeEl.textContent = `Artwork detail · ${typeLabel}`;
    titleEl.textContent = art.title || "Untitled work";

    artistEl.textContent  = art.artist     || "Unknown artist";
    yearEl.textContent    = art.year       || "";
    memberEl.textContent  = art.memberName || "Unknown member";

    // Main sections
    describeEl.textContent  = art.describe  || "";
    interpretEl.textContent = art.interpret || "";
    evaluateEl.textContent  = art.evaluate  || "";

    // Image
    const imageUrl = art.imageUrl || art.imagePath || "";
    if (imageUrl) {
      imageEl.src = imageUrl;
      imageEl.alt = art.title || "Artwork image";
      imageEl.style.display = "";
    } else {
      imageEl.style.display = "none";
    }

    // Page title in browser tab
    document.title = `${art.title || "Artwork"} — Edo Reveries`;
  } catch (err) {
    console.error("Error loading artwork:", err);
    titleEl.textContent = "Error loading artwork";
  }
});
