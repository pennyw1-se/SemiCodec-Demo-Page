(() => {
  "use strict";

  const players = [...document.querySelectorAll(".audio-button")];
  let activeAudio = null;
  let activeButton = null;

  function resetActive() {
    if (activeButton) {
      activeButton.classList.remove("playing");
      activeButton.textContent = "Play";
      activeButton.setAttribute("aria-label", activeButton.dataset.label || "Play audio");
    }
    activeAudio = null;
    activeButton = null;
  }

  players.forEach((button) => {
    const audio = new Audio();
    audio.preload = "none";
    audio.src = button.dataset.src;

    button.addEventListener("click", async () => {
      if (activeAudio === audio && !audio.paused) {
        audio.pause();
        resetActive();
        return;
      }

      if (activeAudio && activeAudio !== audio) {
        activeAudio.pause();
        activeAudio.currentTime = 0;
        resetActive();
      }

      activeAudio = audio;
      activeButton = button;
      button.classList.remove("error");
      button.classList.add("playing");
      button.textContent = "Pause";
      button.setAttribute("aria-label", `Pause ${button.dataset.label}`);

      try {
        await audio.play();
      } catch (error) {
        button.classList.remove("playing");
        button.classList.add("error");
        button.textContent = "Unavailable";
        activeAudio = null;
        activeButton = null;
      }
    });

    audio.addEventListener("ended", resetActive);
    audio.addEventListener("error", () => {
      if (activeAudio === audio) resetActive();
      button.classList.add("error");
      button.textContent = "Unavailable";
    });
  });
})();
