/**
 * BERKLAND — forms.js
 * Talks to the backend over plain fetch(). See /backend for the API this expects:
 *   POST {API_BASE_URL}/api/leads        (quote wizard)
 *   POST {API_BASE_URL}/api/appointments (booking form)
 *   POST {API_BASE_URL}/api/messages     (contact form)
 * Each returns { success: boolean, message: string, id?: string }.
 */

async function postToApi(path, payload) {
  if (SITE_CONFIG.API_NOT_YET_DEPLOYED) {
    // Backend isn't live yet — fail soft with a clear, honest message instead
    // of a broken network error. Flip API_NOT_YET_DEPLOYED to false in config.js
    // once /backend is deployed and API_BASE_URL points at it.
    await new Promise(r => setTimeout(r, 500));
    return {
      success: false,
      message: "Online booking is being finalized — please call us at " + SITE_CONFIG.COMPANY_PHONE + " and we'll take care of this right away."
    };
  }
  const res = await fetch(SITE_CONFIG.API_BASE_URL + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Request failed (' + res.status + ')');
  return res.json();
}

function showAlert(el, ok, message) {
  el.style.display = 'block';
  el.style.background = ok ? '#DCFCE7' : '#FEE2E2';
  el.style.color = ok ? '#15803D' : '#DC2626';
  el.innerHTML = (ok ? '<i class="fa-solid fa-circle-check"></i> ' : '') + message;
}

/* ---------------- Booking (walkthrough / cleaning visit) ---------------- */
function handleDirectWalkthrough(e) {
  e.preventDefault();
  const btn = document.getElementById('btnWtSubmit');
  const alertBox = document.getElementById('wtAlert');
  if (document.getElementById('wt_hp').value.trim() !== '') return false; // honeypot

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing Walkthrough Booking...';
  alertBox.style.display = 'none';

  const payload = {
    name: document.getElementById('wtName').value,
    email: document.getElementById('wtEmail').value,
    phone: document.getElementById('wtPhone').value,
    date: document.getElementById('wtDate').value,
    timeSlot: document.getElementById('wtTime').value,
    address: document.getElementById('wtAddress').value,
    notes: document.getElementById('wtNotes').value
  };

  postToApi('/api/appointments', payload)
    .then(res => {
      showAlert(alertBox, res.success, res.message);
      if (res.success) document.getElementById('walkthroughForm').reset();
    })
    .catch(err => showAlert(alertBox, false, 'Connection error: ' + err.message))
    .finally(() => {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-calendar-check"></i> Confirm Booking';
    });
  return false;
}

/* ---------------- Quote Wizard ---------------- */
let wizardPropertyType = null;

function selectPropertyType(type, card) {
  wizardPropertyType = type;
  document.querySelectorAll('.ptype-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  document.getElementById('fieldsResidential').style.display = type === 'Residential' ? 'block' : 'none';
  document.getElementById('fieldsCommercial').style.display = type === 'Commercial' ? 'block' : 'none';
  document.getElementById('fieldsSpecialty').style.display = type === 'Specialty' ? 'block' : 'none';
}

function setWizardStep(n) {
  document.querySelectorAll('.wizard-step').forEach(s => s.classList.toggle('active', s.getAttribute('data-step') == n));
  document.querySelectorAll('.wizard-dot').forEach(d => {
    const step = parseInt(d.getAttribute('data-step'));
    d.classList.toggle('active', step === n);
    d.classList.toggle('done', step < n);
  });
  document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function wizardNext(current) {
  if (current === 1 && !wizardPropertyType) { alert('Please select a property type to continue.'); return; }
  setWizardStep(current + 1);
}
function wizardBack(current) { setWizardStep(current - 1); }

document.addEventListener('change', (e) => {
  if (e.target.classList && e.target.classList.contains('addon-cb')) {
    let total = 0;
    document.querySelectorAll('.addon-cb:checked').forEach(cb => total += parseFloat(cb.getAttribute('data-price')) || 0);
    const disp = document.getElementById('addonTotalDisplay');
    if (disp) disp.textContent = '$' + total;
  }
});

function collectSelectedAddons() {
  const items = []; let total = 0;
  document.querySelectorAll('.addon-cb:checked').forEach(cb => {
    items.push(cb.getAttribute('data-label') + ' ($' + cb.getAttribute('data-price') + '+)');
    total += parseFloat(cb.getAttribute('data-price')) || 0;
  });
  return { items, total };
}

function resetWizard() {
  wizardPropertyType = null;
  document.querySelectorAll('.ptype-card').forEach(c => c.classList.remove('selected'));
  ['fieldsResidential', 'fieldsCommercial', 'fieldsSpecialty'].forEach(id => document.getElementById(id).style.display = 'none');
  document.querySelectorAll('.addon-cb').forEach(cb => cb.checked = false);
  const disp = document.getElementById('addonTotalDisplay');
  if (disp) disp.textContent = '$0';
  setWizardStep(1);
}

function handleWebsiteQuote(e) {
  e.preventDefault();
  const btn = document.getElementById('btnSubmitQuote');
  const alertBox = document.getElementById('quoteAlert');
  if (document.getElementById('website_hp').value.trim() !== '') return false; // honeypot

  if (!wizardPropertyType) { alert('Please select a property type before submitting.'); return false; }

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending Your Request...';
  alertBox.style.display = 'none';

  const addons = collectSelectedAddons();
  let sector, serviceType, sqft, org;
  const notesParts = [];

  if (wizardPropertyType === 'Residential') {
    sector = 'Residential Cleaning';
    serviceType = document.getElementById('resCleanType').value;
    sqft = document.getElementById('resSqft').value;
    org = document.getElementById('resPropType').value + ' — ' + (document.getElementById('leadAddress').value || 'Address TBD');
    notesParts.push('Property Type: ' + document.getElementById('resPropType').value);
    notesParts.push('Bedrooms: ' + document.getElementById('resBedrooms').value);
    notesParts.push('Bathrooms: ' + document.getElementById('resBathrooms').value);
    notesParts.push('Frequency: ' + document.getElementById('resFrequency').value);
    notesParts.push('Pets: ' + document.getElementById('resPets').value);
    notesParts.push('Last Professional Cleaning: ' + document.getElementById('resLastCleaned').value);
  } else if (wizardPropertyType === 'Commercial') {
    sector = 'Commercial Cleaning';
    serviceType = document.getElementById('comFacType').value;
    sqft = document.getElementById('comSqft').value;
    org = document.getElementById('comOrgName').value;
    notesParts.push('Facility Type: ' + document.getElementById('comFacType').value);
    notesParts.push('Frequency: ' + document.getElementById('comFrequency').value);
    notesParts.push('Preferred Time: ' + document.getElementById('comTime').value);
  } else {
    sector = 'Specialty / Specialized Facility';
    serviceType = document.getElementById('spService').value;
    sqft = 'N/A';
    org = document.getElementById('spService').value + ' — ' + (document.getElementById('leadAddress').value || 'Address TBD');
  }

  if (addons.items.length) notesParts.push('Add-Ons Requested: ' + addons.items.join(', ') + ' (Est. Add-On Total: $' + addons.total + ')');
  const extra = document.getElementById('quoteExtraNotes').value;
  if (extra) notesParts.push('Additional Info: ' + extra);
  notesParts.push('Preferred Contact Method: ' + document.getElementById('leadContactMethod').value);
  const address = document.getElementById('leadAddress').value;
  if (address) notesParts.push('Service Address: ' + address);

  const payload = {
    name: document.getElementById('leadName').value,
    org, email: document.getElementById('leadEmail').value,
    phone: document.getElementById('leadPhone').value,
    sector, type: serviceType, sqft,
    notes: notesParts.join(' | ')
  };

  postToApi('/api/leads', payload)
    .then(res => {
      showAlert(alertBox, res.success, res.message);
      if (res.success) { document.getElementById('quoteForm').reset(); resetWizard(); }
    })
    .catch(err => showAlert(alertBox, false, 'Connection error: ' + err.message))
    .finally(() => {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Get My Free Quote';
    });
  return false;
}

/* ---------------- Contact message ---------------- */
function handleDirectContactMessage(e) {
  e.preventDefault();
  const btn = document.getElementById('btnMsgSubmit');
  const alertBox = document.getElementById('msgAlert');
  if (document.getElementById('msg_hp').value.trim() !== '') return false; // honeypot

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
  alertBox.style.display = 'none';

  const payload = {
    name: document.getElementById('msgName').value,
    email: document.getElementById('msgEmail').value,
    phone: document.getElementById('msgPhone').value,
    subject: document.getElementById('msgSubject').value,
    message: document.getElementById('msgBody').value
  };

  postToApi('/api/messages', payload)
    .then(res => {
      showAlert(alertBox, res.success, res.message);
      if (res.success) document.getElementById('contactMessageForm').reset();
    })
    .catch(err => showAlert(alertBox, false, 'Connection error: ' + err.message))
    .finally(() => {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-envelope-circle-check"></i> Send Message';
    });
  return false;
}
