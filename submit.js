// Access code gate
const ACCESS_CODE = "edo2025";

const gateCard = document.getElementById("gate-card");
const gateStatus = document.getElementById("gate-status");
const submitSection = document.getElementById("submit-section");
const manageSection = document.getElementById("manage-section");
const unlockBtn = document.getElementById("unlockBtn");
const accessInput = document.getElementById("accessCode");

unlockBtn.addEventListener("click", () => {
  const value = accessInput.value.trim();
  if (value === ACCESS_CODE) {
    gateStatus.textContent = "";
    gateCard.style.display = "none";
    submitSection.classList.remove("hidden");
    manageSection.classList.remove("hidden");
    accessInput.value = "";
    loadArtworkList();
  } else {
    gateStatus.textContent = "Incorrect code. Please check with your group.";
    gateStatus.style.color = "var(--danger)";
  }
});

// Form + status
const form = document.getElementById("artwork-form");
const statusEl = document.getElementById("form-status");
const submitBtn = document.getElementById("submit-btn");

// Edit state
let editingArtworkId = null;
let editingImagePath = null;
let editingImageUrl = null;

// Submit handler: create or update
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "";
  statusEl.style.color = "var(--text-muted)";

  const fileInput = document.getElementById("imageFile");
  const file = fileInput.files[0];

  const data = {
    memberName: form.memberName.value.trim(),
    title: form.title.value.trim(),
    artist: form.artist.value.trim(),
    year: form.year.value.trim(),
    type: form.type.value,
    describe: form.describe.value.trim(),
    interpret: form.interpret.value.trim(),
    evaluate: form.evaluate.value.trim()
  };

  if (
    !data.memberName ||
    !data.title ||
    !data.artist ||
    !data.year ||
    !data.type ||
    !data.describe ||
    !data.interpret ||
    !data.evaluate
  ) {
    statusEl.textContent = "Please fill in all fields before submitting.";
    statusEl.style.color = "var(--danger)";
    return;
  }

  // For new submissions, image is required.
  // For edits, image is optional (keep old if not changed).
  if (!editingArtworkId && !file) {
    statusEl.textContent = "Please upload an image for new submissions.";
    statusEl.style.color = "var(--danger)";
    return;
  }

  try {
    let imageUrl = editingImageUrl || null;
    let imagePath = editingImagePath || null;

    // If a new file was provided, upload to Supabase
    if (file) {
      statusEl.textContent = editingArtworkId
        ? "Uploading new image..."
        : "Uploading image...";

      const safeTitle = data.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
      const filePath = `artworks/${Date.now()}-${safeTitle}-${file.name}`;

      // Upload new image
      const { error: uploadError } = await supabase.storage
        .from("artworks")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error from Supabase:", uploadError);
        statusEl.textContent = "Error uploading image: " + (uploadError.message || "");
        statusEl.style.color = "var(--danger)";
        return;
      }


      // Get public URL
      const {
        data: { publicUrl }
      } = supabase.storage.from("artworks").getPublicUrl(filePath);

      // If we had an old image and we're editing, remove old file
      if (editingArtworkId && editingImagePath && editingImagePath !== filePath) {
        await supabase.storage.from("artworks").remove([editingImagePath]);
      }

      imageUrl = publicUrl;
      imagePath = filePath;
    }

    if (editingArtworkId) {
      // UPDATE existing artwork
      statusEl.textContent = "Saving changes...";

      await db.collection("artworks").doc(editingArtworkId).update({
        ...data,
        imageUrl,
        imagePath
      });

      statusEl.textContent = "Changes saved.";
    } else {
      // CREATE new artwork
      statusEl.textContent = "Saving artwork info...";

      await db.collection("artworks").add({
        ...data,
        imageUrl,
        imagePath,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      statusEl.textContent = "Submitted! Your artwork is now in the exhibition.";
    }

    // Reset form + state
    form.reset();
    fileInput.value = "";
    editingArtworkId = null;
    editingImagePath = null;
    editingImageUrl = null;
    submitBtn.textContent = "Submit artwork";

    // Reload list
    loadArtworkList();
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Error saving artwork. Please try again.";
    statusEl.style.color = "var(--danger)";
  }
});

// Load artworks into manage section
async function loadArtworkList() {
  const list = document.getElementById("artwork-list");
  list.innerHTML = "<p class='section-subtext'>Loading artworks…</p>";

  try {
    const snap = await db.collection("artworks").orderBy("createdAt", "desc").get();

    if (snap.empty) {
      list.innerHTML = "<p class='section-subtext'>No submissions yet.</p>";
      return;
    }

    let html = "";
    snap.forEach((doc) => {
      const art = doc.data();
      html += `
        <div class="admin-item" style="
          padding: 0.8rem 0;
          border-bottom: 1px solid rgba(0,0,0,0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.8rem;
        ">
          <div>
            <strong>${art.title}</strong>
            <div class="section-subtext" style="margin-top: 4px;">
              ${art.memberName} · ${art.type || ""}
            </div>
          </div>
          <div style="display:flex; gap:0.4rem;">
            <button
              style="border:none; border-radius:999px; padding:0.3rem 0.7rem; font-size:0.8rem; cursor:pointer;"
              onclick="handleEdit('${doc.id}')"
            >
              Edit
            </button>
            <button
              style="border:none; border-radius:999px; padding:0.3rem 0.7rem; font-size:0.8rem; cursor:pointer; background:#c0473d; color:#fff;"
              onclick="handleDelete('${doc.id}')"
            >
              Delete
            </button>
          </div>
        </div>
      `;
    });

    list.innerHTML = html;
  } catch (err) {
    console.error(err);
    list.innerHTML = "<p class='section-subtext'>Error loading artworks.</p>";
  }
}

// Delete artwork (image + Firestore doc)
async function handleDelete(id) {
  if (!confirm("Delete this artwork permanently?")) return;

  try {
    const docRef = db.collection("artworks").doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      alert("Artwork not found.");
      return;
    }

    const art = snap.data();

    // Delete image from Supabase if we have a path
    if (art.imagePath) {
      await supabase.storage.from("artworks").remove([art.imagePath]);
    }

    // Delete doc from Firestore
    await docRef.delete();

    alert("Artwork deleted.");
    loadArtworkList();
  } catch (err) {
    console.error(err);
    alert("Error deleting artwork.");
  }
}

// Edit artwork: load into form
async function handleEdit(id) {
  try {
    const docRef = db.collection("artworks").doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      alert("Artwork not found.");
      return;
    }

    const art = snap.data();

    // Fill form
    form.memberName.value = art.memberName || "";
    form.title.value = art.title || "";
    form.artist.value = art.artist || "";
    form.year.value = art.year || "";
    form.type.value = art.type || "";
    form.describe.value = art.describe || "";
    form.interpret.value = art.interpret || "";
    form.evaluate.value = art.evaluate || "";

    // Set edit state
    editingArtworkId = id;
    editingImagePath = art.imagePath || null;
    editingImageUrl = art.imageUrl || null;

    submitBtn.textContent = "Save changes";
    statusEl.textContent = "Editing existing artwork. Update fields and click 'Save changes'.";
    statusEl.style.color = "var(--text-muted)";

    // Scroll to form
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) {
    console.error(err);
    alert("Error loading artwork for edit.");
  }
}

// make edit/delete usable from inline onclick
window.handleEdit = handleEdit;
window.handleDelete = handleDelete;
