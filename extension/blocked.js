/**
 * FocusFlow Focus Shield Blocked Page Script.
 * Coordinates countdown display updates and intercepts tab queries.
 */

document.addEventListener("DOMContentLoaded", () => {
  console.log("[FocusShield] Blocked page loaded");

  // Extract query parameters
  const params = new URLSearchParams(window.location.search);
  const websiteDomain = params.get("website") || "";
  const originalUrl = params.get("url") || "";

  console.log("[FocusShield] Website parameter:", websiteDomain);
  console.log("[FocusShield] URL parameter:", originalUrl);

  const domainEl = document.getElementById("blocked-domain");
  const faviconEl = document.getElementById("blocked-favicon");
  const countdownEl = document.getElementById("countdown");
  const backBtn = document.getElementById("back-btn");
  const closeBtn = document.getElementById("close-btn");

  // Immediately set the fallback website domain text before any storage logic
  if (websiteDomain) {
    domainEl.textContent = websiteDomain;
  }

  // Parse the hostname from the url parameter if available
  let domainToShow = websiteDomain;
  if (originalUrl) {
    try {
      const parsedUrl = new URL(originalUrl);
      domainToShow = parsedUrl.hostname.replace("www.", "");
      console.log("[FocusShield] Hostname parsed:", domainToShow);
    } catch (err) {
      console.warn("[FocusShield] Failed to parse URL hostname:", err);
    }
  }

  // Display the resolved domain
  if (domainToShow) {
    domainEl.textContent = domainToShow;
  }

  // Load favicon dynamically if domain resolves
  if (domainToShow) {
    faviconEl.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domainToShow)}&sz=32`;
    faviconEl.style.display = "block";
  }

  let timeLeft = 0;
  let timerInterval = null;

  // Format seconds into MM:SS format
  function formatTime(seconds) {
    if (seconds <= 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Update countdown digits display
  function updateDisplay() {
    countdownEl.textContent = formatTime(timeLeft);
  }

  // Redirect the user back to the original destination URL
  function redirectBack() {
    if (originalUrl) {
      window.location.href = originalUrl;
    } else {
      window.close();
    }
  }

  // Start local countdown ticking
  function startLocalTimer() {
    if (timerInterval) return;

    timerInterval = setInterval(() => {
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        redirectBack();
      }

      // Background updates the timer.
      // We don't decrement it here.
    }, 1000);
  }

  // Log the blocked navigation attempt to MongoDB
  async function logBlockedAttempt(domain) {
    try {
      const cache = await chrome.storage.local.get(["token"]);
      if (cache && cache.token && domain) {
        await fetch("http://localhost:5000/api/focus-attempt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${cache.token}`
          },
          body: JSON.stringify({ website: domain })
        });
        console.log(`[FocusShield] Blocked attempt logged for: ${domain}`);
      }
    } catch (err) {
      console.error("[FocusShield] Attempt log failed:", err);
    }
  }

  // Read remainingTime and shieldActive from chrome.storage.local
  chrome.storage.local.get(["remainingTime", "shieldActive"], (result) => {
    const remainingTime = result ? result.remainingTime : 0;
    const shieldActive = result ? result.shieldActive : false;

    console.log("[FocusShield] Remaining Time loaded:", remainingTime);
    console.log("[FocusShield] Shield Active loaded:", shieldActive);

    // Display the timer immediately after reading storage
    timeLeft = remainingTime || 0;
    updateDisplay();

    if (shieldActive) {
      startLocalTimer();
      if (domainToShow) {
        logBlockedAttempt(domainToShow);
      }
    } else {
      // Wait 1.5 seconds for background script port to sync before redirecting
      setTimeout(() => {
        if (!timeLeft && !timerInterval) {
          redirectBack();
        }
      }, 1500);
    }
  });

  // Open runtime connection port to keep service worker alive and sync timer updates
  try {
    const port = chrome.runtime.connect({ name: "blocked-page" });
    port.postMessage({
      type: "REQUEST_TIMER"
    });
    port.onMessage.addListener((msg) => {
      if (msg && msg.type === "TIMER_UPDATE") {
        console.log("[FocusShield] Timer Update received:", msg);
        timeLeft = msg.timeLeft;
        updateDisplay();

        if (msg.shieldActive) {
          if (!timerInterval) {
            startLocalTimer();
          }
        } else {
          redirectBack();
        }
      }
    });

    // Ping background to prevent worker idle timeout
    setInterval(() => {
      try {
        port.postMessage({ type: "PING" });
      } catch (e) { }
    }, 5000);
  } catch (err) {
    console.warn("[FocusShield] Failed to establish port connection:", err);
  }

  // Listen for storage changes to sync timer with background worker updates
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && changes) {
      if (changes.remainingTime) {
        timeLeft = changes.remainingTime.newValue || 0;
        updateDisplay();
      }
      if (changes.shieldActive) {
        if (changes.shieldActive.newValue) {
          if (!timerInterval) {
            startLocalTimer();
          }
        } else {
          // Redirect immediately if shield active is disabled/ends
          redirectBack();
        }
      }
    }
  });

  // Link back to local dashboard port
  backBtn.addEventListener("click", () => {
    window.location.href = "http://localhost:5174/";
  });

  // Close the current tab
  closeBtn.addEventListener("click", () => {
    window.close();
  });
});
