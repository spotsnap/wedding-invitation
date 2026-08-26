(function(){
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Loader ---------- */
  var loader = document.getElementById("loader");
  function hideLoader(){
    loader.classList.add("hide");
    startHeroAnimation();
  }
  setTimeout(hideLoader, reduceMotion ? 200 : 1400);

  /* ---------- Hero image (graceful fallback if not configured yet) ---------- */
  var heroMedia = document.getElementById("heroMedia");
  var heroPhoto = document.getElementById("heroPhoto");
  var heroImageSrc = heroPhoto.getAttribute("data-src");
  var heroPositionMobile = heroPhoto.getAttribute("data-position-mobile") || "center";
  var heroPositionDesktop = heroPhoto.getAttribute("data-position-desktop") || "center";

  function applyHeroPosition(){
    heroPhoto.style.objectPosition = window.innerWidth < 700 ? heroPositionMobile : heroPositionDesktop;
  }
  applyHeroPosition();
  window.addEventListener("resize", applyHeroPosition);

  if(heroImageSrc){
    var probe = new Image();
    probe.onload = function(){
      heroPhoto.src = heroImageSrc;
      heroMedia.classList.add("is-loaded");
    };
    probe.onerror = function(){ /* keep the elegant CSS fallback background */ };
    probe.src = heroImageSrc;
  }

  /* ---------- Hero particles (subtle, skipped under reduced motion) ---------- */
  var heroParticles = document.getElementById("heroParticles");
  if(!reduceMotion && heroParticles){
    var particleCount = window.innerWidth < 700 ? 16 : 24;
    for(var p = 0; p < particleCount; p++){
      var dot = document.createElement("span");
      dot.className = "particle";
      dot.style.left = (Math.random() * 100) + "%";
      dot.style.top = (Math.random() * 78) + "%";
      dot.style.animationDuration = (3 + Math.random() * 3.5) + "s";
      dot.style.animationDelay = (Math.random() * 5) + "s";
      dot.style.opacity = "0";
      heroParticles.appendChild(dot);
    }
  }

  /* ---------- Hero entrance animation ---------- */
  var hero = document.getElementById("hero");
  var heroNames = document.getElementById("heroNames");
  var heroStarted = false;
  function startHeroAnimation(){
    if(heroStarted) return;
    heroStarted = true;
    requestAnimationFrame(function(){
      hero.classList.add("animate");
      setTimeout(function(){ heroNames.classList.add("in"); }, reduceMotion ? 0 : 550);
    });
  }

  /* ---------- Nav scroll state ---------- */
  var nav = document.getElementById("nav");
  window.addEventListener("scroll", function(){
    nav.classList.toggle("scrolled", window.scrollY > 40);
  }, { passive:true });

  /* ---------- Mobile menu ---------- */
  var mnav = document.getElementById("mnav");
  var navToggle = document.getElementById("navToggle");
  var mnavClose = document.getElementById("mnavClose");
  function openMenu(){ mnav.classList.add("open"); navToggle.setAttribute("aria-expanded","true"); }
  function closeMenu(){ mnav.classList.remove("open"); navToggle.setAttribute("aria-expanded","false"); }
  navToggle.addEventListener("click", openMenu);
  mnavClose.addEventListener("click", closeMenu);
  mnav.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", closeMenu); });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal, .reveal-scale, .reveal-line");
  if("IntersectionObserver" in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0.15 });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add("in-view"); });
  }

  /* ---------- Venue parallax (subtle, disabled on reduced motion) ---------- */
  var venueSection = document.getElementById("venue");
  var venueParallax = document.getElementById("venueParallax");
  if(!reduceMotion && venueSection && venueParallax){
    window.addEventListener("scroll", function(){
      var rect = venueSection.getBoundingClientRect();
      var vh = window.innerHeight;
      if(rect.top < vh && rect.bottom > 0){
        var progress = 1 - (rect.top / vh);
        var shift = Math.max(-12, Math.min(12, (progress - 0.5) * 16));
        venueParallax.style.transform = "translateY(" + shift + "px)";
      }
    }, { passive:true });
  }

  /* ---------- RSVP guest quantity ---------- */
  var qtyValue = document.getElementById("qtyValue");
  var qty = 1;
  document.getElementById("qtyMinus").addEventListener("click", function(){
    qty = Math.max(1, qty - 1); qtyValue.textContent = qty;
  });
  document.getElementById("qtyPlus").addEventListener("click", function(){
    qty = Math.min(10, qty + 1); qtyValue.textContent = qty;
  });

  /* ---------- WhatsApp config (read from the JSON script tag) ---------- */
  var waConfig = { number: "", template: "" };
  try{
    var waEl = document.getElementById("waConfig");
    if(waEl) waConfig = JSON.parse(waEl.textContent);
  } catch(err){ /* leave waConfig empty — RSVP will just be logged server-side */ }

  var rsvpNote = document.getElementById("rsvpNote");
  if(waConfig.number && rsvpNote){
    rsvpNote.textContent = "You'll be taken to WhatsApp to send us your response.";
  }

  function fillTemplate(template, payload){
    return template
      .replace("{name}", payload.name)
      .replace("{attendance}", payload.attendance === "attending" ? "Attending" : "Not attending")
      .replace("{guests}", payload.guests)
      .replace("{message}", payload.message || "—");
  }

  /* ---------- RSVP submission ---------- */
  var rsvpForm = document.getElementById("rsvpForm");
  var rsvpSubmit = document.getElementById("rsvpSubmit");
  var rsvpSuccess = document.getElementById("rsvpSuccess");
  var rsvpError = document.getElementById("rsvpError");
  var submitting = false;

  rsvpForm.addEventListener("submit", function(e){
    e.preventDefault();
    if(submitting) return;

    var name = document.getElementById("rsvpName").value.trim();
    if(!name){
      document.getElementById("rsvpName").focus();
      return;
    }

    var payload = {
      name: name,
      attendance: rsvpForm.querySelector('input[name="attendance"]:checked').value,
      guests: qty,
      message: document.getElementById("rsvpMsg").value.trim()
    };

    submitting = true;
    rsvpSubmit.disabled = true;
    rsvpSubmit.textContent = "Sending…";
    rsvpError.classList.remove("show");

    // Open WhatsApp synchronously, inside the click/submit handler, so
    // browsers don't treat it as a blocked popup. This happens before the
    // network request below, so it never waits on the server.
    if(waConfig.number){
      var message = fillTemplate(waConfig.template, payload);
      var waUrl = "https://wa.me/" + waConfig.number + "?text=" + encodeURIComponent(message);
      window.open(waUrl, "_blank");
    }

    // Best-effort backup log on the server — doesn't block the confirmation
    // shown to the guest either way.
    fetch("/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(function(){ /* WhatsApp already has the response if configured */ });

    setTimeout(function(){
      submitting = false;
      rsvpSubmit.disabled = false;
      rsvpSubmit.textContent = "Send RSVP";
      rsvpSuccess.classList.add("show");
    }, reduceMotion ? 0 : 600);
  });

  /* ---------- Optional background music ---------- */
  var musicToggle = document.getElementById("musicToggle");
  var bgAudio = document.getElementById("bgAudio");
  var audioSrc = bgAudio ? bgAudio.getAttribute("data-src") : "";
  if(audioSrc){
    bgAudio.src = audioSrc;
    musicToggle.hidden = false;
    musicToggle.addEventListener("click", function(){
      if(bgAudio.paused){
        bgAudio.play().catch(function(){});
        musicToggle.classList.add("playing");
      } else {
        bgAudio.pause();
        musicToggle.classList.remove("playing");
      }
    });
  }

})();
