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
