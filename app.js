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

  // Keep vertical swipes available for normal page scrolling. Only an
  // intentional horizontal drag controls the wide comparison table.
  document.querySelectorAll(".table-scroll").forEach((scroller) => {
    let startX = 0;
    let startY = 0;
    let startScrollLeft = 0;
    let direction = null;
    let dragged = false;

    scroller.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      startX = event.clientX;
      startY = event.clientY;
      startScrollLeft = scroller.scrollLeft;
      direction = null;
      dragged = false;
    });

    scroller.addEventListener("pointermove", (event) => {
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;

      if (!direction && Math.max(Math.abs(dx), Math.abs(dy)) > 7) {
        direction = Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
        if (direction === "horizontal") {
          scroller.setPointerCapture?.(event.pointerId);
          scroller.classList.add("is-dragging");
        }
      }

      if (direction === "horizontal") {
        dragged = true;
        scroller.scrollLeft = startScrollLeft - dx;
        event.preventDefault();
      }
    });

    const finishDrag = (event) => {
      if (scroller.hasPointerCapture?.(event.pointerId)) {
        scroller.releasePointerCapture(event.pointerId);
      }
      scroller.classList.remove("is-dragging");
      direction = null;
    };

    scroller.addEventListener("pointerup", finishDrag);
    scroller.addEventListener("pointercancel", finishDrag);

    scroller.addEventListener("click", (event) => {
      if (!dragged) return;
      event.preventDefault();
      event.stopPropagation();
      dragged = false;
    }, true);
  });

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
