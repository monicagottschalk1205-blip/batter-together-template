/* ==========================================================
   Batter Together: edit the details below and they update
   everywhere on the page.
   ========================================================== */
const CONFIG = {
  ownerName: "Linda",
  city: "Kansas City",
  phone: "(816) 555-0147",
  email: "hello@battertogetherkc.com",
  instagram: "@battertogether",
};

document.documentElement.classList.remove("no-js");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Fill in config values ---------- */
document.querySelectorAll("[data-cfg]").forEach((el) => {
  const val = CONFIG[el.dataset.cfg];
  if (val) el.textContent = val;
});
document.querySelectorAll("[data-cfg-href]").forEach((el) => {
  const kind = el.dataset.cfgHref;
  if (kind === "tel") el.href = "tel:" + CONFIG.phone.replace(/[^\d+]/g, "");
  if (kind === "mailto") el.href = "mailto:" + CONFIG.email;
  if (kind === "ig") el.href = "https://instagram.com/" + CONFIG.instagram.replace(/^@/, "");
});
const yr = document.getElementById("yr");
if (yr) yr.textContent = new Date().getFullYear();

/* ---------- Mobile menu ---------- */
const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");
function setMenu(open) {
  nav.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}
menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

/* ---------- Rotating announcement bar ---------- */
const msgs = document.querySelectorAll(".announce-msg");
let msgIdx = 0;
if (msgs.length > 1 && !reduceMotion) {
  setInterval(() => {
    msgs[msgIdx].classList.remove("is-on");
    msgIdx = (msgIdx + 1) % msgs.length;
    msgs[msgIdx].classList.add("is-on");
  }, 4500);
}

/* ---------- Seamless ticker ---------- */
document.querySelectorAll(".ticker-track").forEach((track) => {
  track.innerHTML += track.innerHTML + track.innerHTML + track.innerHTML;
});

/* ---------- Header shadow + floating order button ---------- */
const header = document.querySelector(".site-header");
const floatCta = document.getElementById("floatCta");
const hero = document.querySelector(".hero");
const orderSec = document.getElementById("order");
function onScroll() {
  header.classList.toggle("scrolled", window.scrollY > 10);
  const pastHero = hero.getBoundingClientRect().bottom < 0;
  const atOrder = orderSec.getBoundingClientRect().top < window.innerHeight * 0.8;
  floatCta.classList.toggle("show", pastHero && !atOrder);
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- Holiday deadline carousel ---------- */
const slides = document.querySelectorAll(".dl-slide");
let slideIdx = 0;
let slideTimer;
function showSlide(i) {
  slides[slideIdx].classList.remove("is-on");
  slideIdx = (i + slides.length) % slides.length;
  slides[slideIdx].classList.add("is-on");
}
function startSlides() {
  if (reduceMotion) return;
  clearInterval(slideTimer);
  slideTimer = setInterval(() => showSlide(slideIdx + 1), 6000);
}
document.getElementById("dlPrev").addEventListener("click", () => { showSlide(slideIdx - 1); startSlides(); });
document.getElementById("dlNext").addEventListener("click", () => { showSlide(slideIdx + 1); startSlides(); });
startSlides();

/* ---------- Reveal on scroll ---------- */
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -30px 0px" });
  reveals.forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 70 + "ms";
    io.observe(el);
  });
} else {
  reveals.forEach((el) => el.classList.add("in"));
}

/* ---------- Order links preselect the treat ---------- */
const form = document.getElementById("bookForm");
const serviceSel = document.getElementById("fService");
const notes = document.getElementById("fNotes");
document.querySelectorAll("[data-service]").forEach((btn) => {
  btn.addEventListener("click", () => {
    serviceSel.value = btn.dataset.service;
    serviceSel.classList.remove("invalid");
  });
});
// The holiday carousel link also notes which deadline was showing.
document.querySelector("#deadlines .arrow-link").addEventListener("click", () => {
  const line = "Holiday order: " + slides[slideIdx].querySelector(".dl-big").textContent;
  if (!notes.value.includes(line)) notes.value = (line + "\n" + notes.value).trim();
});

/* ---------- Order form → prefilled email ---------- */
const errorBox = document.getElementById("formError");
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast.t);
  showToast.t = setTimeout(() => toast.classList.remove("show"), 4200);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(form));
  const problems = [];
  form.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));

  if (!d.name.trim()) { problems.push("your name"); form.name.classList.add("invalid"); }
  if (!d.email.trim() && !d.phone.trim()) { problems.push("an email or phone number"); form.email.classList.add("invalid"); form.phone.classList.add("invalid"); }
  if (!d.service) { problems.push("what you'd like"); serviceSel.classList.add("invalid"); }

  if (problems.length) {
    errorBox.textContent = "Almost there! Please add " + problems.join(", ") + ".";
    errorBox.hidden = false;
    return;
  }
  errorBox.hidden = true;

  const prettyDate = d.date
    ? new Date(d.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
    : "Flexible";

  const body = [
    "Hi " + CONFIG.ownerName + "!",
    "",
    "I'd love to place an order with Batter Together.",
    "",
    "Name: " + d.name.trim(),
    "Email: " + (d.email.trim() || "n/a"),
    "Phone: " + (d.phone.trim() || "n/a"),
    "Order: " + d.service,
    "Date needed: " + prettyDate,
    "Servings: " + (d.count || "Not sure yet"),
    "Pickup or delivery: " + (d.fulfil || "Not sure yet"),
    "",
    d.notes.trim() ? "Details:\n" + d.notes.trim() : "",
  ].join("\n").trim();

  const subject = "Order request: " + d.service;
  window.location.href = "mailto:" + CONFIG.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  showToast("Opening your email… just hit send!");
});
