const express = require("express");
const path = require("path");
const fs = require("fs");
const config = require("./config/wedding.config");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

const DATA_DIR = path.join(__dirname, "data");
const RSVP_FILE = path.join(DATA_DIR, "rsvps.json");

function buildMapsUrl(venue) {
  const query =
    venue.mapsQuery && venue.mapsQuery.trim()
      ? venue.mapsQuery.trim()
      : venue.address;
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query);
}

app.get("/", (req, res) => {
  res.render("index", {
    couple: config.couple,
    date: config.date,
    muhurtham: config.muhurtham,
    dinner: config.dinner,
    venue: config.venue,
    mapsUrl: buildMapsUrl(config.venue),
    contacts: config.contacts,
    whatsapp: config.whatsapp,
    hero: config.hero,
    audio: config.audio,
    credit: config.credit,
    seo: config.seo
  });
});

// Best-effort backup log of RSVP responses, written to data/rsvps.json.
// This runs alongside (not instead of) the WhatsApp redirect on the
// client — see public/js/main.js.
app.post("/rsvp", (req, res) => {
  const { name, attendance, guests, message } = req.body || {};

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ ok: false, error: "Name is required." });
  }

  const entry = {
    name: name.trim(),
    attendance: attendance === "not-attending" ? "not-attending" : "attending",
    guests: Number(guests) > 0 ? Number(guests) : 1,
    message: typeof message === "string" ? message.trim() : "",
    submittedAt: new Date().toISOString()
  };

  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const existing = fs.existsSync(RSVP_FILE)
      ? JSON.parse(fs.readFileSync(RSVP_FILE, "utf8") || "[]")
      : [];
    existing.push(entry);
    fs.writeFileSync(RSVP_FILE, JSON.stringify(existing, null, 2));
    res.json({ ok: true });
  } catch (err) {
    console.error("Failed to save RSVP:", err);
    res.status(500).json({ ok: false, error: "Could not save RSVP." });
  }
});

app.listen(PORT, () => {
  console.log(`Wedding invitation running at http://localhost:${PORT}`);
});
