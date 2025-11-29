// Read ?id= from URL
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (!id) {
  document.body.innerHTML = "<p>Invalid artwork ID.</p>";
  throw new Error("No doc ID");
}

// Load from Firestore
db.collection("artworks").doc(id).get().then(doc => {
  if (!doc.exists) {
    document.body.innerHTML = "<p>Artwork not found.</p>";
    return;
  }

  const a = doc.data();

  document.getElementById("detail-type").textContent = "Artwork Detail · " + a.type;
  document.getElementById("detail-title").textContent = a.title;
  document.getElementById("detail-artist").textContent = a.artist;
  document.getElementById("detail-year").textContent = a.year;
  document.getElementById("detail-member").textContent = a.memberName;

  document.getElementById("detail-image").src = a.imageUrl;
  document.getElementById("detail-image").alt = a.title;

  document.getElementById("detail-describe").textContent = a.describe;
  document.getElementById("detail-interpret").textContent = a.interpret;
  document.getElementById("detail-evaluate").textContent = a.evaluate;
});

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const el = id ? {} : null;
  const typeEl = document.getElementById("detail-type");
  const titleEl = document.getElementById("detail-title");
  const artistEl = document.getElementById("detail-artist");
  const yearEl = document.getElementById("detail-year");
  const memberEl = document.getElementById("detail-member");
  const imageEl = document.getElementById("detail-image");
  const describeEl = document.getElementById("detail-describe");
  const interpretEl = document.getElementById("detail-interpret");
  const evaluateEl = document.getElementById("detail-evaluate");

  if (!id) {
    titleEl.textContent = "Artwork not found";
    console.error("No artwork id in URL");
    return;
  }

  try {
    const doc = await db.collection("artworks").doc(id).get();
    if (!doc.exists) {
      titleEl.textContent = "Artwork not found";
      console.error("Artwork doc not found:", id);
      return;
    }

    const art = doc.data();

    // Populate text content (use textContent to avoid accidental HTML)
    typeEl.textContent = art.type ? art.type : "";
    titleEl.textContent = art.title || "Untitled work";
    artistEl.textContent = art.artist || "Unknown artist";
    yearEl.textContent = art.year || "";
    memberEl.textContent = art.memberName || "Unknown member";
    describeEl.textContent = art.describe || "";
    interpretEl.textContent = art.interpret || "";
    evaluateEl.textContent = art.evaluate || "";

    // Image handling
    const imageUrl = art.imageUrl || art.imagePath || "";
    if (imageUrl) {
      imageEl.src = imageUrl;
      imageEl.alt = art.title || "Artwork image";
      imageEl.style.display = "";
    } else {
      imageEl.style.display = "none";
    }

    // Optional: set document title
    document.title = `${art.title || "Artwork"} — Edo Reveries`;
  } catch (err) {
    console.error("Error loading artwork:", err);
    titleEl.textContent = "Error loading artwork";
  }
});