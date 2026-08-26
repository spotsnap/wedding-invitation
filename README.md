# Manikanta & Lakshmi — Wedding Invitation (Express app)

A small Express + EJS site. Every editable detail — names, dates, venue,
phone numbers, hero photo, WhatsApp number — lives in **one file**:
`config/wedding.config.js`. You should never need to touch the HTML, CSS,
or JS to change content.

```
wedding-invitation/
├── server.js                  ← Express app (routes, RSVP handling)
├── config/
│   └── wedding.config.js      ← ★ EDIT THIS FILE for all content changes
├── views/
│   └── index.ejs               the page template (reads from config)
├── public/
│   ├── css/style.css           all styling
│   ├── js/main.js              animations + RSVP/WhatsApp logic
│   └── images/                 ← put your hero photo in here
└── data/
    └── rsvps.json               auto-created backup log of RSVP replies
```

## 1. Run it locally

```bash
npm install
npm start
```

Then open **http://localhost:3000**.

(`npm run dev` restarts automatically on file changes, using Node's
built-in `--watch` — no extra install needed on Node 18+.)

---

## 2. Adding the hero photo

1. Copy your photo into `public/images/` — e.g. `public/images/hero.jpg`.
2. Open `config/wedding.config.js` and set:
   ```js
   hero: {
     image: "/images/hero.jpg",
     positionMobile: "center",   // or "top", "50% 20%", etc.
     positionDesktop: "center"
   }
   ```
   `positionMobile`/`positionDesktop` control which part of the photo stays
   visible when it's cropped on narrow vs. wide screens — nudge these if a
   face gets cropped out on phones.
3. Restart the server (or just refresh if using `npm run dev`).

If `hero.image` points to a file that doesn't exist yet, the hero section
falls back to an elegant emerald/gold gradient automatically — nothing
looks broken while you're still deciding on the photo.

Also update `seo.ogImage` the same way once you have a photo you're happy
with — that's the image shown in the WhatsApp link preview when you share
the site. Use a **full absolute URL** once deployed, e.g.
`https://yourdomain.com/images/hero.jpg` (WhatsApp can't fetch a relative
path from its own servers).

---

## 3. Adding the venue location

The **"Get Directions"** button always uses a real Google Maps link built
from the address — no coordinates are ever invented.

**Option A — address only (default, no setup needed)**
Just keep `venue.address` accurate in the config. The button searches
Google Maps for that text. This works well for most addresses.

**Option B — precise GPS pin (recommended for a house / unnamed venue)**
If Maps can't find the exact spot from the address text alone (common for
village addresses or "at our home"), pin the exact location instead:

1. Open Google Maps on your phone, long-press the exact spot to drop a pin.
2. Tap the pin → note the coordinates shown (e.g. `16.7581, 81.7458`).
3. In `config/wedding.config.js`, set:
   ```js
   venue: {
     name: "At Our Home",
     address: "Pithanivaripalem, Devarapalli-533238, Ravulapalem, Konaseema",
     mapsQuery: "16.7581,81.7458"
   }
   ```
   `mapsQuery` takes priority over `address` for the directions link, so
   the button now opens Maps at the exact pin. The address text still
   displays on the page as-is.

**Option C — embed an actual map on the page (optional)**
Not included by default (keeps the page light and avoids requiring a
Google Maps API key), but if you'd like a visible embedded map instead of
just a button, add this inside the `.venue__frame` block in
`views/index.ejs`, right after the address:

```html
<iframe
  style="width:100%; height:220px; border:0; margin-top:20px;"
  loading="lazy"
  src="https://maps.google.com/maps?q=<%= encodeURIComponent(venue.mapsQuery || venue.address) %>&z=15&output=embed">
</iframe>
```

This uses the no-API-key embed trick, so it works without billing setup.

---

## 4. Setting up WhatsApp for RSVP

When a guest submits the RSVP form, this site can hand the response
straight to **your** WhatsApp so you see it immediately — no separate
backend or paid API needed.

### How it works
The form builds a `wa.me` link with the guest's answers already typed into
the message box, and opens it. The guest just has to tap **Send** in
WhatsApp to deliver it to you. This is the standard free "click to chat"
link WhatsApp provides — it does **not** send silently in the background
(that would require the paid WhatsApp Business API through Meta or a
provider like Twilio, which needs business verification and isn't set up
here).

### Setup
In `config/wedding.config.js`:

```js
whatsapp: {
  number: "919493962477",   // country code + number, digits only
  messageTemplate:
    "Hello! I'd like to RSVP for Manikanta & Lakshmi's wedding.\n" +
    "Name: {name}\n" +
    "Attending: {attendance}\n" +
    "Guests: {guests}\n" +
    "Message: {message}"
}
```

- `number` — international format, **digits only**: no `+`, no spaces, no
  leading `0`. For an Indian mobile number `94939 62477`, that's
  `"919493962477"` (`91` is India's country code).
- `messageTemplate` — keep the `{name}`, `{attendance}`, `{guests}`, and
  `{message}` placeholders; they're swapped for the guest's real answers
  before WhatsApp opens.
- Leave `number` as `""` to turn this off entirely — the RSVP form will
  then only save to `data/rsvps.json` (see below) with a plain "Thank You"
  confirmation, no WhatsApp redirect.

### Backup copy on the server
Every RSVP is also POSTed to `/rsvp` and appended to `data/rsvps.json`
regardless of whether WhatsApp is configured — handy if a guest's
WhatsApp doesn't open (e.g. desktop browser without WhatsApp Web linked)
or if you just want a plain list. Each entry looks like:

```json
{
  "name": "Priya Rao",
  "attendance": "attending",
  "guests": 2,
  "message": "So happy for you both!",
  "submittedAt": "2026-08-26T10:12:00.000Z"
}
```

---

## 5. Everything else you can edit in the config

`config/wedding.config.js` also controls:
- `couple.groom` / `couple.bride` — names shown throughout
- `date`, `muhurtham.date`, `muhurtham.time`, `dinner` — the details cards
- `contacts` — phone numbers in the Contact section (tap-to-call)
- `audio.src` — optional background music file; leave blank to hide the
  music toggle entirely
- `credit.instagram` / `credit.email` — the small credit line at the very
  bottom of the page
- `seo.title` / `seo.description` / `seo.ogImage` — browser tab title and
  the WhatsApp/social link-preview card

---

## 6. Deploying

This is a real Node/Express server now (not a static file), so it needs a
host that runs Node — a few easy free/cheap options:

- **Render.com** — connect the repo, set build command `npm install` and
  start command `npm start`. Free tier available.
- **Railway.app** — similar one-click deploy from a repo.
- Any VPS — `npm install && npm start` behind a process manager like
  `pm2`, with a reverse proxy (nginx/Caddy) for HTTPS.

Once deployed, share the live HTTPS URL on WhatsApp — the Open Graph tags
already produce a title, description, and preview image in the chat.
