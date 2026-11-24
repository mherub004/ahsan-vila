const SUPABASE_URL = 'https://qnojuhdoarwosqxjfpdv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFub2p1aGRvYXJ3b3NxeGpmcGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MDk1MTgsImV4cCI6MjEwNDE4NTUxOH0.ruKw1iNnwuygLWrHDs2RZtC6riaJ0t0MCzEz4wcKtCo';
const client = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let language = 'en';
let contactSettings = { email: null, whatsapp: null };
function applyLanguage() {
  document.documentElement.lang = language;
  document.querySelectorAll('[data-en][data-bn]').forEach(el => {
    const value = el.getAttribute('data-' + language);
    if (el.matches('h1,h2')) el.innerHTML = value;
    else el.textContent = value;
  });
  const button = document.getElementById('lang-toggle');
  button.textContent = language === 'en' ? 'বাংলা' : 'English';
  button.setAttribute('aria-label', language === 'en' ? 'Switch language to Bangla' : 'Switch language to English');
  renderContactSettings();
}
document.getElementById('lang-toggle').addEventListener('click', () => {
  language = language === 'en' ? 'bn' : 'en';
  applyLanguage();
});
function safeImagePath(path) {
  return typeof path === 'string' && /^flat-(101|102|301|302)\/[a-z0-9-]+\.(jpg|png|webp)$/.test(path) ? path : null;
}
function renderFlat(flat) {
  const number = escapeHtml(flat.flat_number);
  const free = flat.status === 'Free For Rent';
  const path = safeImagePath(flat.image_path);
  const src = path ? client.storage.from('flat-images').getPublicUrl(path).data.publicUrl : null;
  const specs = [
    [flat.area_sqft, 'SQ FT', 'বর্গফুট'],
    [flat.bedrooms, 'BEDROOMS', 'শোবার ঘর'],
    [flat.bathrooms, 'BATHROOMS', 'বাথরুম'],
    [flat.balconies, 'BALCONIES', 'বারান্দা']
  ].filter(([value]) => Number.isInteger(value) && value >= 0);
  const specsHtml = specs.length ? '<div class="flat-specs" aria-label="Flat details">' +
    specs.map(([value, en, bn]) => '<span><b>' + value + '</b> <small data-en="' + en + '" data-bn="' + bn + '">' + en + '</small></span>').join('') +
    '</div>' : '';
  const image = src ? `<img src="${escapeHtml(src)}" alt="Image for flat ${number}" loading="lazy" decoding="async">` : '<span data-en="IMAGE PENDING" data-bn="ছবি আসছে">IMAGE PENDING</span>';
  return `<article class="flat-row" id="flat-${number}">
    <span class="flat-no">/${number}</span>
    <div class="flat-primary"><span class="flat-status ${free ? '' : 'occupied'}" data-en="${free ? 'AVAILABLE' : 'OCCUPIED'}" data-bn="${free ? 'ভাড়া দেওয়া হবে' : 'ভাড়া দেওয়া হয়েছে'}">${free ? 'AVAILABLE' : 'OCCUPIED'}</span><h3>${escapeHtml(flat.title || '1,100 Sq Ft Apartment')}</h3><p class="flat-description">${escapeHtml(flat.description || 'A comfortable space for everyday living.')}</p>${specsHtml}</div>
    <div class="flat-price"><strong>${escapeHtml(flat.price || 'On request')}</strong><small data-en="PER MONTH" data-bn="প্রতি মাসে">PER MONTH</small></div>
    <div class="flat-image ${src ? '' : 'no-image'}">${image}</div>
  </article>`;
}
function renderIndex(flat) {
  const number = escapeHtml(flat.flat_number);
  const free = flat.status === 'Free For Rent';
  return `<a class="directory-row" href="#flat-${number}" aria-label="Flat ${number}: ${free ? 'available' : 'occupied'}"><strong>${number}</strong><span data-en="${free ? 'AVAILABLE' : 'OCCUPIED'}" data-bn="${free ? 'খালি' : 'ভাড়া দেওয়া'}">${free ? 'AVAILABLE' : 'OCCUPIED'}</span></a>`;
}
async function fetchFlats() {
  const container = document.getElementById('flats-container');
  const index = document.getElementById('hero-index');
  if (!client) {
    container.innerHTML = '<p class="load-error">Listings are temporarily unavailable. Please try again shortly.</p>';
    index.textContent = '101 / 102 / 301 / 302';
    return;
  }
  const { data, error } = await client.from('rentals').select('flat_number,title,description,price,status,image_path,bedrooms,bathrooms,balconies,area_sqft').order('flat_number');
  if (error) {
    container.innerHTML = '<p class="load-error">Could not load flats. Please refresh to try again.</p>';
    index.textContent = '101 / 102 / 301 / 302';
    return;
  }
  if (!data?.length) {
    container.innerHTML = '<p class="load-error">No flats are listed at the moment.</p>';
    index.textContent = 'No flats listed';
    return;
  }
  container.innerHTML = data.map(renderFlat).join('');
  index.innerHTML = data.map(renderIndex).join('');
  applyLanguage();
}
fetchFlats();

function renderContactSettings() {
  const emailValue = document.getElementById('contact-email-value');
  const whatsappValue = document.getElementById('contact-whatsapp-value');
  const form = document.getElementById('enquiry-form');
  if (!emailValue || !whatsappValue || !form) return;
  const en = language === 'en';
  const emailLink = document.getElementById('contact-email-link');
  const whatsappLink = document.getElementById('contact-whatsapp-link');
  const emailButton = document.getElementById('enquiry-email');
  const whatsappButton = document.getElementById('enquiry-whatsapp');
  const note = document.getElementById('enquiry-note');
  emailValue.textContent = contactSettings.email || (en ? 'Email address coming soon' : 'ইমেইল ঠিকানা শীঘ্রই আসছে');
  whatsappValue.textContent = contactSettings.whatsapp || (en ? 'WhatsApp number coming soon' : 'হোয়াটসঅ্যাপ নম্বর শীঘ্রই আসছে');
  emailLink.hidden = !contactSettings.email;
  whatsappLink.hidden = !contactSettings.whatsapp;
  if (contactSettings.email) emailLink.href = 'mailto:' + contactSettings.email;
  else emailLink.removeAttribute('href');
  if (contactSettings.whatsapp) whatsappLink.href = 'https://wa.me/' + contactSettings.whatsapp.slice(1);
  else whatsappLink.removeAttribute('href');
  emailButton.disabled = !contactSettings.email;
  whatsappButton.disabled = !contactSettings.whatsapp;
  emailButton.textContent = en ? 'SEND VIA EMAIL ↗' : 'ইমেইলে পাঠান ↗';
  whatsappButton.textContent = en ? 'SEND VIA WHATSAPP ↗' : 'হোয়াটসঅ্যাপে পাঠান ↗';
  note.textContent = en
    ? 'Your chosen app opens with your details filled in. Review the message and press Send there.'
    : 'আপনার তথ্যসহ নির্বাচিত অ্যাপ খুলবে। বার্তাটি দেখে সেখানে Send চাপুন।';
}
async function fetchContactSettings() {
  if (!client) return;
  const { data, error } = await client.from('site_contact').select('contact_email,whatsapp_number').eq('id', 1).maybeSingle();
  if (error || !data) return;
  const email = data.contact_email?.trim();
  const whatsapp = data.whatsapp_number?.trim();
  contactSettings = {
    email: email && /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$/.test(email) ? email : null,
    whatsapp: whatsapp && /^\\+[1-9][0-9]{7,14}$/.test(whatsapp) ? whatsapp : null
  };
  renderContactSettings();
}
const enquiryForm = document.getElementById('enquiry-form');
function enquiryDetails() {
  if (!enquiryForm.reportValidity()) return null;
  const values = new FormData(enquiryForm);
  const name = String(values.get('name') || '').trim();
  const reply = String(values.get('reply') || '').trim();
  const flat = String(values.get('flat') || '').trim();
  const message = String(values.get('message') || '').trim();
  if (!name || !message) return null;
  return { name, reply, flat, message };
}
if (enquiryForm) {
  enquiryForm.addEventListener('submit', event => event.preventDefault());
  document.getElementById('enquiry-email').addEventListener('click', () => {
    if (!contactSettings.email) return;
    const details = enquiryDetails();
    if (!details) return;
    const subject = 'Ahsanvila flat enquiry' + (details.flat ? ' — Flat ' + details.flat : '');
    const body = ['Name: ' + details.name, details.reply ? 'Reply email: ' + details.reply : '', 'Flat: ' + (details.flat || 'Not specified'), '', details.message].filter((line, index) => line || index === 3).join('\\n');
    window.location.href = 'mailto:' + contactSettings.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });
  document.getElementById('enquiry-whatsapp').addEventListener('click', () => {
    if (!contactSettings.whatsapp) return;
    const details = enquiryDetails();
    if (!details) return;
    const body = ['Ahsanvila flat enquiry', 'Name: ' + details.name, details.reply ? 'Reply email: ' + details.reply : '', 'Flat: ' + (details.flat || 'Not specified'), '', details.message].filter(Boolean).join('\\n');
    window.open('https://wa.me/' + contactSettings.whatsapp.slice(1) + '?text=' + encodeURIComponent(body), '_blank', 'noopener,noreferrer');
  });
}
fetchContactSettings();
