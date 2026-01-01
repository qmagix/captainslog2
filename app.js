const storageKey = "captains-log-entries";

const screens = {
  timeline: document.querySelector("#timeline"),
  create: document.querySelector("#create"),
  view: document.querySelector("#view"),
};

const timelineList = document.querySelector("[data-timeline]");
const emptyState = document.querySelector("[data-empty]");
const entryForm = document.querySelector("[data-entry-form]");
const viewCard = document.querySelector("[data-view]");
const backButton = document.querySelector("[data-back]");
const mediaLabel = document.querySelector("[data-media-label]");
const textLabel = document.querySelector("[data-text-label]");

let entries = loadEntries();

function loadEntries() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Failed to parse entries", error);
    return [];
  }
}

function saveEntries() {
  localStorage.setItem(storageKey, JSON.stringify(entries));
}

function showScreen(name) {
  Object.entries(screens).forEach(([key, element]) => {
    element.hidden = key !== name;
  });
}

function formatDate(iso) {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function createId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `entry-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function updateTimeline() {
  timelineList.innerHTML = "";
  const sorted = [...entries].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  if (sorted.length === 0) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  sorted.forEach((entry) => {
    const item = document.createElement("li");
    item.className = "timeline-item";

    const info = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = `${entry.type.toUpperCase()} entry`;

    const details = document.createElement("div");
    details.className = "meta";
    details.textContent = formatDate(entry.createdAt);

    info.append(title, details);

    const action = document.createElement("button");
    action.textContent = "View";
    action.addEventListener("click", () => {
      renderEntry(entry.id);
      showScreen("view");
    });

    item.append(info, action);
    timelineList.append(item);
  });
}

function createMediaElement(entry) {
  if (!entry.mediaUri) return null;
  if (entry.type === "image") {
    const img = document.createElement("img");
    img.src = entry.mediaUri;
    img.alt = "Log entry media";
    img.className = "entry-media";
    return img;
  }
  if (entry.type === "audio") {
    const audio = document.createElement("audio");
    audio.controls = true;
    audio.src = entry.mediaUri;
    audio.className = "entry-media";
    return audio;
  }
  if (entry.type === "video") {
    const video = document.createElement("video");
    video.controls = true;
    video.src = entry.mediaUri;
    video.className = "entry-media";
    return video;
  }
  return null;
}

function renderEntry(id) {
  const entry = entries.find((item) => item.id === id);
  if (!entry) return;

  viewCard.innerHTML = "";

  const heading = document.createElement("h2");
  heading.textContent = `${entry.type.toUpperCase()} entry`;

  const meta = document.createElement("div");
  meta.className = "meta";
  const items = [
    `Created: ${formatDate(entry.createdAt)}`,
    entry.mood ? `Mood: ${entry.mood}` : null,
    entry.duration ? `Duration: ${entry.duration}s` : null,
  ].filter(Boolean);
  meta.textContent = items.join(" • ");

  viewCard.append(heading, meta);

  if (entry.textContent) {
    const text = document.createElement("p");
    text.textContent = entry.textContent;
    viewCard.append(text);
  }

  const media = createMediaElement(entry);
  if (media) {
    viewCard.append(media);
  }
}

function resetForm() {
  entryForm.reset();
  textLabel.hidden = false;
  mediaLabel.hidden = true;
}

function updateFormForType(type) {
  if (type === "text") {
    textLabel.hidden = false;
    mediaLabel.hidden = true;
  } else {
    textLabel.hidden = false;
    mediaLabel.hidden = false;
  }
}

async function readFileAsDataUrl(file) {
  if (!file) return null;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function getMediaDuration(type, dataUrl) {
  if (!dataUrl || (type !== "audio" && type !== "video")) return null;
  return new Promise((resolve) => {
    const element = document.createElement(type);
    element.preload = "metadata";
    element.src = dataUrl;
    element.onloadedmetadata = () => {
      const duration = Number.isFinite(element.duration)
        ? Math.round(element.duration)
        : null;
      resolve(duration);
    };
    element.onerror = () => resolve(null);
  });
}

entryForm.addEventListener("change", (event) => {
  if (event.target.name === "type") {
    updateFormForType(event.target.value);
  }
});

entryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(entryForm);
  const type = formData.get("type");
  const textContent = formData.get("textContent")?.toString().trim();
  const mood = formData.get("mood")?.toString();
  const mediaFile = formData.get("media");

  let mediaUri = null;
  let duration = null;

  if (type !== "text") {
    if (mediaFile && mediaFile.size > 0) {
      mediaUri = await readFileAsDataUrl(mediaFile);
      duration = await getMediaDuration(type, mediaUri);
    }
  }

  const entry = {
    id: createId(),
    createdAt: new Date().toISOString(),
    type,
    textContent: textContent || null,
    mediaUri,
    duration,
    mood: mood || null,
  };

  entries = [entry, ...entries];
  saveEntries();
  updateTimeline();
  resetForm();
  showScreen("timeline");
});

backButton.addEventListener("click", () => {
  showScreen("timeline");
});

Array.from(document.querySelectorAll(".nav-button")).forEach((button) => {
  button.addEventListener("click", () => {
    showScreen(button.dataset.screen);
  });
});

updateTimeline();
updateFormForType(entryForm.elements.type.value);
