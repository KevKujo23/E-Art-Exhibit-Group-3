// index-filter.js
// Filter gallery cards by type (all / painting / sculpture / architecture)

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".filter-btn");
  const gallery = document.getElementById("gallery");
  if (!gallery || buttons.length === 0) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter");

      // set active state
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // show/hide cards
      const cols = gallery.querySelectorAll(".col-12.col-md-6");
      cols.forEach((col) => {
        const card = col.querySelector(".art-card");
        if (!card) return;

        const type = card.dataset.type || "other";
        if (filter === "all" || filter === type) {
          col.style.display = "";
        } else {
          col.style.display = "none";
        }
      });
    });
  });
});
