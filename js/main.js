/**
 * Main Entry Point
 * Initializing the core UI components
 */

document.addEventListener("DOMContentLoaded", () => {
  console.log("IT Academy Foundation Loaded...");
  initFoundation();
});

function initFoundation() {
  // Phase 1 specific logic: Simple greeting or loading states
  const courseGrid = document.getElementById("featured-courses");

  // Logic to simulate dynamic loading (to be replaced in Phase 2/4)
  if (courseGrid) {
    setTimeout(() => {
      renderPlaceholderCards();
    }, 500);
  }
}

function renderPlaceholderCards() {
  const container = document.getElementById("featured-courses");
  const placeholders = ["Windows Server", "Linux Admin", "Cyber Security"];

  container.innerHTML = placeholders
    .map(
      (title) => `
        <div class="card">
            <h3>${title}</h3>
            <p>Master the essentials of ${title} in a production environment.</p>
            <br>
            <a href="#" class="text-primary" style="font-weight: 600;">Explore Path →</a>
        </div>
    `,
    )
    .join("");
}
