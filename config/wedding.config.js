/**
 * ============================================================
 *  WEDDING CONFIGURATION
 *  This is the ONLY file you should need to edit for content.
 *  Every value here flows into views/index.ejs automatically.
 * ============================================================
 */

module.exports = {
  couple: {
    groom: "Manikanta Swamy "
,
    bride: "Lakshmi Kalyani"
  },

  date: "03 September 2026",

  muhurtham: {
    date: "04-Sep-2026",
    time: "2:59 AM"
  },

  dinner: "03-Sep-2026, 6:30 PM",

  venue: {
    name: "At Our Home",
    address: "Pithanivaripalem, Devarapalli-533238, Ravulapalem, Konaseema",

    // OPTIONAL — leave this blank to link guests to Google Maps using the
    // address text above (works fine for most places). If Maps doesn't find
    // the exact spot from the address alone, paste GPS coordinates here
    // instead, e.g. "16.7581,81.7458" — see README.md "Adding the venue
    // location" for how to get these from Google Maps.
    mapsQuery: "16.723053, 81.871456"
  },

  // Phone numbers shown (and tappable) in the Contact section.
  contacts: ["9493962477", "8885483332", "8886178666"],

  // RSVP → WhatsApp. See README.md "Setting up WhatsApp for RSVP".
  whatsapp: {
    // Number that RSVP replies should be sent to, in international format,
    // digits only — no "+", no spaces, no dashes.
    // Example: for an Indian number 94939 62477 this is "919493962477"
    // Leave this as an empty string to disable WhatsApp redirect — the
    // RSVP form will then only save responses on the server (see
    // data/rsvps.json).
    number: "918886178666",

    // Message pre-filled into WhatsApp when a guest submits the RSVP form.
    // Keep the {placeholders} — they get swapped for the guest's actual
    // answers before WhatsApp opens.
    messageTemplate:
      "Hello! I'd like to RSVP for Manikanta & Lakshmi's wedding.\n" +
      "Name: {name}\n" +
      "Attending: {attendance}\n" +
      "Guests: {guests}\n" +
      "Message: {message}"
  },

  hero: {
    // Path to the hero photo, relative to /public. Drop the file into
    // public/images/ and point this at it. See README.md "Adding the hero
    // photo". If this file doesn't exist yet, an elegant emerald/gold
    // placeholder is shown instead — nothing breaks.
    image: "/images/hero.jpeg",
    positionMobile: "center",
    positionDesktop: "center"
  },

  // OPTIONAL background music. Leave src empty to hide the music toggle.
  audio: {
    src: ""
  },

  // Small credit line at the very bottom of the page.
  credit: {
    instagram: "thespotsnap",
    email: "spotsnapofficial@gmail.com"
  },

  // Used for the browser tab title and WhatsApp link-preview card.
  seo: {
    title: "Manikanta Swami & Lakshmi Kalyani — Wedding Invitation",
    description:
      "Join us as we celebrate the wedding of Manikanta Swami & Lakshmi Kalyani on 03 September 2026.",
    // Absolute URL once deployed, e.g. "https://yourdomain.com/images/og-preview.jpg"
    ogImage: "/images/og-preview.jpg"
  }
};
