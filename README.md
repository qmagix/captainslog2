# captainslog2

A minimal, local-first journaling MVP for capturing text, audio, image, and short video entries. Everything lives in the browser using local storage for a single user.


## Run locally

```bash
python -m http.server 8000
```

Open `http://localhost:8000` in your browser.

---
# Captain’s Log

Captain’s Log is a **local-first, private journaling app**.

It is not social media.  
It is not a productivity tool.  
It is not an AI therapist.

It is a place to quietly record your life — in text, voice, images, or video — as a continuous personal log.

> “Captain’s log, supplemental…”

---

## 🧭 Core Principles

- **Single user**
- **Local-first storage**
- **No accounts**
- **No cloud**
- **No social features**
- **No gamification**
- **No AI in MVP**

Captain’s Log prioritizes **presence over polish** and **reflection over performance**.

---

## 🎯 MVP Scope

### What this app does

- Create log entries using:
  - Text
  - Audio (voice recording)
  - Image(s)
  - Short video
- View entries in a chronological timeline
- Open and replay individual entries
- Store everything locally on the device

---

### What this app deliberately does NOT do (yet)

- ❌ User accounts
- ❌ Cloud sync
- ❌ Sharing
- ❌ AI summaries or prompts
- ❌ Search
- ❌ Reminders
- ❌ Streaks or metrics
- ❌ Public feeds

If it doesn’t help record a moment clearly, it doesn’t belong here.

---

## 🗂 Data Model (MVP)

Each log entry uses a minimal schema:

```ts
LogEntry {
  id: string
  createdAt: number
  type: "text" | "audio" | "image" | "video"
  textContent?: string
  mediaUri?: string
  durationSec?: number
  mood?: "🙂" | "😐" | "😔"
}

