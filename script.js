const pets = {
  rocky: {
    name: "Rocky",
    species: "Male rock golem",
    voice: "Voice: Puck",
    vibe: "Warm, loyal, curious, and gently playful.",
    hero: "Rocky lives on your screen.",
    copy: "A tiny AI companion for reminders, recurring tasks, morning digests, memory, and screen-aware help when you ask.",
    greeting: "Hi, I am Rocky. I can live on your desktop and help when you need me.",
    loopTitle: "Rocky turns tiny moments into a daily rhythm.",
    loopCopy: "The magic is not that a pet walks around. It is that Rocky remembers the thread, respects your focus, and shows up at the right time.",
    heroBg: "assets/rocky-banner.png",
    heroBgMode: "banner",
    idle: "pets/golem_male/idle.gif",
    happy: "pets/golem_male/happy.gif",
    thinking: "pets/golem_male/thinking.gif",
    talking: "pets/golem_male/talking.gif",
    sleeping: "pets/golem_male/sleeping.gif",
    dance: "pets/golem_male/dance.gif",
    dragUp: "pets/golem_male/drag_up.gif",
    dragDown: "pets/golem_male/drag_down.gif",
    walkRight: "pets/golem_male/walking_right.gif",
    walkLeft: "pets/golem_male/walking_left.gif",
    demoDigest: "pets/golem_male/talking.gif",
    demoReminder: "pets/golem_male/dance.gif",
    demoContinue: "pets/golem_male/walking_right.gif",
    demoScreen: "pets/golem_male/thinking.gif",
    capVoice: "pets/golem_male/talking.gif",
    capAnswers: "pets/golem_male/thinking.gif",
    capMemory: "pets/golem_male/happy.gif",
    capRhythm: "pets/golem_male/sleeping.gif",
    capTasks: "pets/golem_male/dance.gif",
    capHandoff: "pets/golem_male/drag_up.gif",
    alt: "Rocky idle animation",
  },
  rhea: {
    name: "Rhea",
    species: "Female crystal golem",
    voice: "Voice: Kore",
    vibe: "Bright, caring, quietly magical, and encouraging.",
    hero: "Rhea keeps your day steady.",
    copy: "She keeps reminders, routines, memory, and calm help close without crowding your screen.",
    greeting: "Hi, I am Rhea. I will keep things bright and gentle.",
    loopTitle: "Rhea turns tiny moments into a calmer day.",
    loopCopy: "Rhea keeps the helpful bits close: reminders, digest, follow-ups, and gentle nudges that respect your focus.",
    heroBg: "assets/rhea-banner.png",
    heroBgMode: "banner",
    idle: "pets/golem_female/idle.gif",
    happy: "pets/golem_female/happy.gif",
    thinking: "pets/golem_female/thinking.gif",
    talking: "pets/golem_female/talking.gif",
    sleeping: "pets/golem_female/sleep.gif",
    dance: "pets/golem_female/dance.gif",
    dragUp: "pets/golem_female/drag_up.gif",
    dragDown: "pets/golem_female/drag_down.gif",
    walkRight: "pets/golem_female/walk_right.gif",
    walkLeft: "pets/golem_female/walk_left.gif",
    demoDigest: "pets/golem_female/talking.gif",
    demoReminder: "pets/golem_female/dance.gif",
    demoContinue: "pets/golem_female/walk_right.gif",
    demoScreen: "pets/golem_female/thinking.gif",
    capVoice: "pets/golem_female/talking.gif",
    capAnswers: "pets/golem_female/thinking.gif",
    capMemory: "pets/golem_female/happy.gif",
    capRhythm: "pets/golem_female/sleep.gif",
    capTasks: "pets/golem_female/dance.gif",
    capHandoff: "pets/golem_female/drag_up.gif",
    alt: "Rhea idle animation",
  },
  pip: {
    name: "Pip",
    species: "Penguin desktop pet",
    voice: "Voice: Leda",
    vibe: "Cheerful, waddly, curious, and a little dramatic.",
    hero: "Pip keeps tasks light.",
    copy: "Pip handles little tasks, remembers what matters, and waddles in only when the moment is useful.",
    greeting: "Hi, I am Pip. I will waddle nearby while you look around.",
    loopTitle: "Pip makes useful work feel lighter.",
    loopCopy: "Pip keeps the small stuff moving: recurring reminders, next steps, screen-aware help, and tiny wins across the day.",
    heroBg: "assets/pip-banner.png",
    heroBgMode: "banner",
    idle: "pets/penguine/idle.gif",
    happy: "pets/penguine/happy.gif",
    thinking: "pets/penguine/thinking.gif",
    talking: "pets/penguine/talking.gif",
    sleeping: "pets/penguine/sleep.gif",
    dance: "pets/penguine/dance.gif",
    dragUp: "pets/penguine/drag_up.gif",
    dragDown: "pets/penguine/drag_down.gif",
    walkRight: "pets/penguine/walk_right.gif",
    walkLeft: "pets/penguine/walk_left.gif",
    searching: "pets/penguine/searching.gif",
    curious: "pets/penguine/curious.gif",
    drowsy: "pets/penguine/drowsy.gif",
    demoDigest: "pets/penguine/expressive_talking.gif",
    demoReminder: "pets/penguine/dance.gif",
    demoContinue: "pets/penguine/curious.gif",
    demoScreen: "pets/penguine/searching.gif",
    capVoice: "pets/penguine/expressive_talking.gif",
    capAnswers: "pets/penguine/searching.gif",
    capMemory: "pets/penguine/expressive_happy.gif",
    capRhythm: "pets/penguine/drowsy.gif",
    capTasks: "pets/penguine/dance.gif",
    capHandoff: "pets/penguine/drag_up.gif",
    alt: "Pip idle animation",
  },
};

const body = document.body;
const brandPet = document.querySelector("#brand-pet");
const brandName = document.querySelector("#brand-name");
const heroBg = document.querySelector("#hero-bg");
const heroTitle = document.querySelector("#hero-title");
const heroCopy = document.querySelector(".hero-copy");
const featuredPet = document.querySelector("#featured-pet");
const featuredName = document.querySelector("#featured-name");
const featuredVibe = document.querySelector("#featured-vibe");
const featuredSpecies = document.querySelector("#featured-species");
const featuredVoice = document.querySelector("#featured-voice");
const scenePet = document.querySelector("#scene-pet");
const desktopScene = document.querySelector(".desktop-scene");
const downloadPet = document.querySelector("#download-pet");
const loopPet = document.querySelector("#loop-pet");
const loopTitle = document.querySelector("#loop-title");
const loopCopy = document.querySelector("#loop-copy");
const playPet = document.querySelector("#play-pet");
const playLabel = document.querySelector("#play-label");
const playTitleCard = document.querySelector("#play-title-card");
const playCopy = document.querySelector("#play-copy");
const playTags = document.querySelector("#play-tags");
const capabilityEmotes = document.querySelectorAll(".capability-emote");
const petButtons = document.querySelectorAll("[data-pet]");
const commandButtons = document.querySelectorAll(".command-chip");
const navLinks = document.querySelectorAll(".site-nav nav a");
const nav = document.querySelector(".site-nav");
const hero = document.querySelector(".hero");
const windowsDownloadLink = document.querySelector("#windows-download-link");
const windowsDownloadLabel = document.querySelector("#windows-download-label");
const windowsDownloadVersion = document.querySelector("#windows-download-version");
const releaseNote = document.querySelector("#release-note");
const releaseList = document.querySelector("#release-list");
const authModal = document.querySelector("#auth-modal");
const authPet = document.querySelector("#auth-pet");
const authMessage = document.querySelector("#auth-message");
const authHelper = document.querySelector("#auth-helper");
const googleSigninButton = document.querySelector("#google-signin-button");
const authDownloadButton = document.querySelector("#auth-download-button");
const authCloseButtons = document.querySelectorAll("[data-auth-close]");
const downloadAuthStatus = document.querySelector("#download-auth-status");

let activePetId = "rocky";
let firebaseAuthState = null;
let firebaseProvider = null;
let firebaseAuthPromise = null;
let signedInUser = null;
let pendingDownloadAfterSignIn = false;

const firebaseSdkVersion = "10.14.1";
const firebaseRequiredFields = ["apiKey", "authDomain", "projectId", "appId"];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

const demos = {
  digest: {
    label: "Morning digest",
    title: "A personalized start",
    copy: "Rocky gathers your reminders, preferred news, weather, unfinished work, and the first useful next step.",
    emote: "demoDigest",
    tags: ["Weather", "Projects", "Reminders"],
  },
  reminder: {
    label: "Recurring task",
    title: "A habit Rocky can own",
    copy: "It turns a casual request into a visible recurring reminder with timing, tone, and cooldowns you can edit later.",
    emote: "demoReminder",
    tags: ["Weekly", "Autosaved", "Editable"],
  },
  continue: {
    label: "Task continuity",
    title: "The thread comes back",
    copy: "Rocky remembers what you were working on, the likely next step, and whether Codex should inspect the project.",
    emote: "demoContinue",
    tags: ["Memory", "Projects", "Codex handoff"],
  },
  screen: {
    label: "Screen-aware help",
    title: "A nudge with restraint",
    copy: "When screen sharing is enabled, Rocky can notice stuck states and ask before stepping in.",
    emote: "demoScreen",
    tags: ["Opt-in", "Cooldowns", "Control"],
  },
};

function setDemo(demoId) {
  const demo = demos[demoId] || demos.digest;
  const pet = pets[activePetId];
  playLabel.textContent = demo.label;
  playTitleCard.textContent = demo.title;
  playCopy.textContent = demo.copy;
  playPet.src = pet[demo.emote] || pet.talking;
  playTags.innerHTML = demo.tags.map((tag) => `<span>${tag}</span>`).join("");

  commandButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.demo === demoId);
  });
}

function setPet(petId, announce = false) {
  const pet = pets[petId];
  if (!pet) return;
  activePetId = petId;
  body.dataset.pet = petId;
  body.style.setProperty("--active-banner", `url("${pet.heroBg}")`);

  brandPet.src = pet.idle;
  brandName.textContent = pet.name;
  heroBg.src = pet.heroBg;
  heroBg.classList.toggle("hero-bg-banner", pet.heroBgMode === "banner");
  heroTitle.textContent = pet.hero;
  heroCopy.textContent = pet.copy;

  featuredPet.src = pet.idle;
  featuredPet.alt = pet.alt;
  featuredName.textContent = pet.name;
  featuredVibe.textContent = pet.vibe;
  featuredSpecies.textContent = pet.species;
  featuredVoice.textContent = pet.voice;

  scenePet.src = pet.thinking;
  scenePet.alt = `${pet.name} thinking beside a desktop window`;
  downloadPet.src = pet.happy;
  downloadPet.alt = `${pet.name} waving happily`;
  loopPet.src = pet.happy;
  loopTitle.textContent = pet.loopTitle;
  loopCopy.textContent = pet.loopCopy;
  playPet.src = pet.talking;

  capabilityEmotes.forEach((emote) => {
    const key = emote.dataset.emote;
    emote.src = pet[key] || pet.idle;
  });

  if (desktopScene) {
    desktopScene.style.setProperty("--scene-bg", `url("${pet.heroBg}")`);
  }

  petButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.pet === petId);
  });

  const activeDemo = document.querySelector(".command-chip.active")?.dataset.demo || "digest";
  setDemo(activeDemo);
}

petButtons.forEach((button) => {
  button.addEventListener("click", () => setPet(button.dataset.pet, false));
});

commandButtons.forEach((button) => {
  button.addEventListener("click", () => setDemo(button.dataset.demo));
});

if (windowsDownloadLink) {
  windowsDownloadLink.addEventListener("click", handleWindowsDownloadClick);
}

if (googleSigninButton) {
  googleSigninButton.addEventListener("click", signInWithGoogle);
}

if (authDownloadButton) {
  authDownloadButton.addEventListener("click", () => {
    pendingDownloadAfterSignIn = false;
    startWindowsDownload();
  });
}

authCloseButtons.forEach((button) => {
  button.addEventListener("click", closeAuthModal);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && authModal && !authModal.hidden) {
    closeAuthModal();
  }
});

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  nav.classList.toggle("scrolled", scrollY > 24);
  const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
  document.documentElement.style.setProperty("--scroll-progress", `${clamp(scrollY / maxScroll, 0, 1)}`);
  if (hero) {
    hero.style.setProperty("--hero-drift", `${Math.min(70, scrollY * 0.08)}px`);
  }
});

function primeNavState() {
  if (!navLinks.length || !("IntersectionObserver" in window)) return;

  const sections = [...navLinks]
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${visible.target.id}`;
        link.classList.toggle("active", isActive);
        if (isActive) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    },
    { rootMargin: "-28% 0px -58% 0px", threshold: [0.08, 0.18, 0.32] }
  );

  sections.forEach((section) => observer.observe(section));
}

function primeScrollMotion() {
  const animatedElements = [
    ".loop-copy",
    ".loop-orbit",
    ".loop-moments article",
    ".section-kicker",
    ".section-heading",
    ".pet-stage",
    ".pet-card",
    ".desktop-scene",
    ".story-copy",
    ".routine-grid div",
    ".command-playground",
    ".command-chip",
    ".play-response",
    ".capability-grid article",
    ".privacy-band",
    ".download-card",
  ];

  const targets = document.querySelectorAll(animatedElements.join(","));
  targets.forEach((target, index) => {
    target.classList.add("reveal");
    target.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 70}ms`);
  });

  const revealVisibleTargets = () => {
    targets.forEach((target) => {
      const rect = target.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.94 && rect.bottom > window.innerHeight * -0.1) {
        target.classList.add("is-visible");
      }
    });
  };

  if (!("IntersectionObserver" in window)) {
    revealVisibleTargets();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );

  targets.forEach((target) => observer.observe(target));
  requestAnimationFrame(revealVisibleTargets);
  window.addEventListener("load", revealVisibleTargets, { once: true });
  window.addEventListener("hashchange", () => requestAnimationFrame(revealVisibleTargets));
  window.addEventListener("scroll", revealVisibleTargets, { passive: true });
}

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function getWindowsDownloadUrl() {
  const syncedUrl = windowsDownloadLink?.dataset.downloadUrl;
  return isValidHttpUrl(syncedUrl) ? syncedUrl : "";
}

function updateAuthStatus(message) {
  if (downloadAuthStatus) {
    downloadAuthStatus.textContent = message;
  }
}

function isFirebaseConfigured() {
  const config = window.ROCKY_FIREBASE_CONFIG || window.firebaseConfig;
  if (!config || typeof config !== "object") return false;

  return firebaseRequiredFields.every((field) => {
    const value = String(config[field] || "").trim();
    return value && !value.startsWith("PASTE_") && !value.includes("PASTE_PROJECT_ID");
  });
}

function openAuthModal(message) {
  if (!authModal) return;
  const pet = pets[activePetId];

  if (authPet && pet) {
    authPet.src = pet.happy;
    authPet.alt = `${pet.name} happy animation`;
  }

  if (message && authMessage) {
    authMessage.textContent = message;
  }

  authModal.hidden = false;
  document.body.classList.add("auth-open");
  requestAnimationFrame(() => googleSigninButton?.focus());
}

function closeAuthModal() {
  if (!authModal) return;
  authModal.hidden = true;
  document.body.classList.remove("auth-open");
  pendingDownloadAfterSignIn = false;
}

function setAuthBusy(isBusy) {
  if (googleSigninButton) {
    googleSigninButton.disabled = isBusy;
    googleSigninButton.textContent = isBusy ? "Opening Google..." : "Continue with Google";
  }
}

function setSignedInUser(user) {
  signedInUser = user || null;
  const displayName = signedInUser?.displayName || signedInUser?.email || "Google account";

  if (authDownloadButton) {
    authDownloadButton.hidden = !signedInUser;
  }

  if (signedInUser) {
    updateAuthStatus(`Signed in as ${displayName}. Download is ready.`);
    if (authMessage) {
      authMessage.textContent = `You are signed in as ${displayName}. Rocky is ready to download.`;
    }
    if (authHelper) {
      authHelper.textContent = "You can start the installer download now.";
    }
    if (windowsDownloadLabel) {
      windowsDownloadLabel.textContent = "Download for Windows";
    }
  } else {
    updateAuthStatus("Google sign-in required before download.");
    if (authHelper) {
      authHelper.textContent = "Your browser will open Google's secure sign-in window.";
    }
    if (windowsDownloadLabel) {
      windowsDownloadLabel.textContent = "Sign in to download";
    }
  }
}

async function getFirebaseAuth() {
  if (firebaseAuthPromise) return firebaseAuthPromise;

  firebaseAuthPromise = (async () => {
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase is not configured yet.");
    }

    const [{ initializeApp, getApps }, authModule] = await Promise.all([
      import(`https://www.gstatic.com/firebasejs/${firebaseSdkVersion}/firebase-app.js`),
      import(`https://www.gstatic.com/firebasejs/${firebaseSdkVersion}/firebase-auth.js`),
    ]);

    const app = getApps().length ? getApps()[0] : initializeApp(window.ROCKY_FIREBASE_CONFIG || window.firebaseConfig);
    const auth = authModule.getAuth(app);
    const provider = new authModule.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    authModule.onAuthStateChanged(auth, (user) => {
      setSignedInUser(user);
      if (user && pendingDownloadAfterSignIn) {
        pendingDownloadAfterSignIn = false;
        startWindowsDownload();
      }
    });

    firebaseAuthState = { auth, authModule };
    firebaseProvider = provider;
    return firebaseAuthState;
  })();

  return firebaseAuthPromise;
}

async function signInWithGoogle() {
  setAuthBusy(true);

  try {
    const { auth, authModule } = await getFirebaseAuth();
    const result = await authModule.signInWithPopup(auth, firebaseProvider);
    setSignedInUser(result.user);
    if (pendingDownloadAfterSignIn) {
      pendingDownloadAfterSignIn = false;
      startWindowsDownload();
    }
  } catch (error) {
    console.warn("Google sign-in failed.", error);

    if (authMessage) {
      authMessage.textContent = isFirebaseConfigured()
        ? "Google sign-in could not complete. Check that popups are allowed and this domain is authorized in Firebase."
        : "Firebase is not configured yet. Add your web app values in firebase-config.js, then enable Google sign-in in Firebase.";
    }

    if (authHelper) {
      authHelper.textContent = "The download will stay locked until sign-in is working.";
    }
  } finally {
    setAuthBusy(false);
  }
}

function startWindowsDownload() {
  const downloadUrl = getWindowsDownloadUrl();
  if (!downloadUrl) {
    openAuthModal("The latest Windows download URL is still loading. Please try again in a moment.");
    return;
  }

  window.location.assign(downloadUrl);
}

async function handleWindowsDownloadClick(event) {
  event.preventDefault();

  if (signedInUser) {
    startWindowsDownload();
    return;
  }

  pendingDownloadAfterSignIn = true;
  openAuthModal("Sign in with Google once, then Rocky will start downloading automatically.");

  if (!isFirebaseConfigured()) {
    if (authMessage) {
      authMessage.textContent = "Firebase is not configured yet. Fill firebase-config.js with your Firebase web app values first.";
    }
    if (authHelper) {
      authHelper.textContent = "After setup, this same button will open Google sign-in and then start the download.";
    }
    return;
  }

  try {
    await getFirebaseAuth();
  } catch (error) {
    console.warn("Firebase auth is not ready.", error);
  }
}

async function syncWindowsDownload() {
  if (!windowsDownloadLink) return;

  const versionUrl = windowsDownloadLink.dataset.versionUrl;
  if (!versionUrl) return;

  try {
    const response = await fetch(`${versionUrl}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Version metadata request failed: ${response.status}`);

    const release = await response.json();
    if (!release || !isValidHttpUrl(release.download_url)) return;

    windowsDownloadLink.dataset.downloadUrl = release.download_url;
    windowsDownloadLink.dataset.releaseVersion = release.version || "";

    if (windowsDownloadVersion && release.version) {
      windowsDownloadVersion.textContent = `v${String(release.version).replace(/^v/i, "")}`;
    }

    if (releaseNote && release.key_note) {
      releaseNote.textContent = release.key_note;
    }

    if (releaseList && Array.isArray(release.whats_new)) {
      releaseList.replaceChildren(
        ...release.whats_new.slice(0, 4).map((item) => {
          const listItem = document.createElement("li");
          listItem.textContent = item;
          return listItem;
        })
      );
    }
  } catch (error) {
    console.warn("Using fallback Windows download link.", error);
  }
}

const requestedPet = new URLSearchParams(window.location.search).get("pet");
setPet(pets[requestedPet] ? requestedPet : "rocky", true);
primeScrollMotion();
primeNavState();
syncWindowsDownload();
if (isFirebaseConfigured()) {
  getFirebaseAuth().catch((error) => console.warn("Firebase auth could not initialize.", error));
}
