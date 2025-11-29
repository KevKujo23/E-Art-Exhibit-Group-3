document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".reveal-on-scroll");

  if (!("IntersectionObserver" in window)) {
    // Fallback: just show them
    items.forEach(el => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15
    }
  );

  items.forEach(el => observer.observe(el));
});
