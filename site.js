const SUPABASE_URL = 'https://qnojuhdoarwosqxjfpdv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFub2p1aGRvYXJ3b3NxeGpmcGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MDk1MTgsImV4cCI6MjEwNDE4NTUxOH0.ruKw1iNnwuygLWrHDs2RZtC6riaJ0t0MCzEz4wcKtCo';
let language = 'en';
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const client = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function applyLanguage() {
  document.documentElement.lang = language;
  document.querySelectorAll('[data-en][data-bn]').forEach(el => {
    const value = el.getAttribute('data-' + language);
    if (el.matches('h1,h2')) el.innerHTML = value;
    else el.textContent = value;
  });
  const button = document.getElementById('lang-toggle');
  button.innerHTML = language === 'en' ? 'বাংলা <span aria-hidden="true">↗</span>' : 'English <span aria-hidden="true">↗</span>';
  button.setAttribute('aria-label', language === 'en' ? 'Switch language to Bangla' : 'Switch language to English');
}
document.getElementById('lang-toggle').addEventListener('click', () => {
  language = language === 'en' ? 'bn' : 'en';
  applyLanguage();
});

function renderFlat(flat) {
  const number = escapeHtml(flat.flat_number);
  const free = flat.status === 'Free For Rent';
  const imagePath = typeof flat.image_path === 'string' && /^flat-(101|102|301|302)\/[a-z0-9-]+\.(jpg|png|webp)$/.test(flat.image_path) ? flat.image_path : null;
  const imageUrl = imagePath ? client.storage.from('flat-images').getPublicUrl(imagePath).data.publicUrl : null;
  const image = imageUrl
    ? `<img src="${escapeHtml(imageUrl)}" alt="Flat ${number}" loading="lazy" decoding="async">`
    : '<div class="flat-empty"><span data-en="Photo coming soon" data-bn="ছবি শীঘ্রই আসছে">Photo coming soon</span></div>';
  return `<article class="flat-card">
    <div class="flat-media">${image}<span class="flat-number">FLAT ${number}</span></div>
    <div class="flat-body">
      <div class="flat-top"><span data-en="Ahsanvila residence" data-bn="আহসানভিলা আবাসন">Ahsanvila residence</span><span class="status ${free ? '' : 'occupied'}" data-en="${free ? 'Available' : 'Occupied'}" data-bn="${free ? 'ভাড়া দেওয়া হবে' : 'ভাড়া দেওয়া হয়েছে'}">${free ? 'Available' : 'Occupied'}</span></div>
      <h3>${escapeHtml(flat.title || '1,100 sq ft apartment')}</h3>
      <p class="flat-description">${escapeHtml(flat.description || 'A comfortable space for everyday living.')}</p>
      <div class="flat-bottom"><div><span class="price-label" data-en="Monthly rent" data-bn="মাসিক ভাড়া">Monthly rent</span><span class="price">${escapeHtml(flat.price || 'On request')} <small data-en="/ month" data-bn="/ মাস">/ month</small></span></div><a href="#location" data-en="View location ↗" data-bn="অবস্থান দেখুন ↗">View location ↗</a></div>
    </div>
  </article>`;
}
async function fetchFlats() {
  const container = document.getElementById('flats-container');
  if (!client) {
    container.innerHTML = '<p class="load-error">The listings are temporarily unavailable. Please try again shortly.</p>';
    return;
  }
  const { data, error } = await client.from('rentals').select('flat_number,title,description,price,status,image_path').order('flat_number');
  if (error) {
    container.innerHTML = '<p class="load-error">The listings could not be loaded. Please refresh the page to try again.</p>';
    return;
  }
  if (!data?.length) {
    container.innerHTML = '<p class="load-error">No flats are listed at the moment.</p>';
    return;
  }
  container.innerHTML = data.map(renderFlat).join('');
  applyLanguage();
}
fetchFlats();
