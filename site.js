const SUPABASE_URL = 'https://qnojuhdoarwosqxjfpdv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFub2p1aGRvYXJ3b3NxeGpmcGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MDk1MTgsImV4cCI6MjEwNDE4NTUxOH0.ruKw1iNnwuygLWrHDs2RZtC6riaJ0t0MCzEz4wcKtCo';
const client = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let language = 'en';
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
