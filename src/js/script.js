(() => {
  "use strict";
  const mobileButton = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const goToApp = () => { window.location.href = "./app.html#/triage"; };

  document.querySelectorAll(".js-triagem").forEach((button) => {
    button.type = "button";
    button.addEventListener("click", goToApp);
  });

  if (mobileButton && mobileMenu) {
    mobileButton.type = "button";
    mobileButton.setAttribute("aria-expanded", "false");
    mobileButton.setAttribute("aria-controls", "mobileMenu");
    mobileButton.setAttribute("aria-label", "Abrir menu");
    mobileButton.addEventListener("click", () => {
      const expanded = mobileMenu.classList.toggle("is-open");
      mobileButton.setAttribute("aria-expanded", String(expanded));
      mobileButton.setAttribute("aria-label", expanded ? "Fechar menu" : "Abrir menu");
      mobileButton.textContent = expanded ? "✕" : "☰";
    });
    mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
      mobileMenu.classList.remove("is-open");
      mobileButton.setAttribute("aria-expanded", "false");
      mobileButton.setAttribute("aria-label", "Abrir menu");
      mobileButton.textContent = "☰";
    }));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        mobileMenu.classList.remove("is-open");
        mobileButton.setAttribute("aria-expanded", "false");
        mobileButton.textContent = "☰";
      }
    });
  }

  document.getElementById("logoHome")?.addEventListener("click", () => {
    window.location.hash = "#inicio";
  });
})();
