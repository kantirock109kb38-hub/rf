import { getSupabase } from './supabase-client.js';

function showMsg(el, type, text) {
  el.className = `enquiry-form-msg ${type}`;
  el.textContent = text;
  el.style.display = 'block';
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name) || '';
}

function initEnquiryForm() {
  const form = document.getElementById('enquiry-form');
  if (!form) return;

  const msg = document.getElementById('enquiry-form-msg');
  const honeypot = form.querySelector('[name="website"]');
  const productField = form.querySelector('[name="product_interest"]');
  const sourcePage = form.querySelector('[name="source_page"]');
  const sourceUrl = form.querySelector('[name="source_url"]');

  const productFromUrl = getQueryParam('product');
  if (productFromUrl && productField) {
    productField.value = decodeURIComponent(productFromUrl.replace(/\+/g, ' '));
  }
  if (sourcePage) sourcePage.value = document.title;
  if (sourceUrl) sourceUrl.value = getQueryParam('from') || document.referrer || window.location.href;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (honeypot?.value) return;

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending…';

    const fd = new FormData(form);
    const payload = {
      name: fd.get('name')?.toString().trim(),
      email: fd.get('email')?.toString().trim(),
      phone: fd.get('phone')?.toString().trim() || null,
      company: fd.get('company')?.toString().trim() || null,
      product_interest: fd.get('product_interest')?.toString().trim() || null,
      message: fd.get('message')?.toString().trim() || null,
      source_page: fd.get('source_page')?.toString() || null,
      source_url: fd.get('source_url')?.toString() || null,
      status: 'new',
    };

    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('leads').insert(payload);
      if (error) throw error;

      try {
        await fetch('/api/send-enquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (mailErr) {
        console.warn('Email notification failed (lead saved):', mailErr);
      }

      showMsg(msg, 'success', 'Thank you! Your enquiry has been submitted. A confirmation email has been sent. We will contact you shortly.');
      form.reset();
      if (productFromUrl && productField) {
        productField.value = decodeURIComponent(productFromUrl.replace(/\+/g, ' '));
      }
    } catch (err) {
      showMsg(
        msg,
        'error',
        err.message?.includes('not configured')
          ? 'Form temporarily unavailable. Please email sales@rfflanges.com directly.'
          : 'Something went wrong. Please try again or call +91-9920142161.'
      );
      console.error(err);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Submit Enquiry';
    }
  });
}

document.addEventListener('DOMContentLoaded', initEnquiryForm);
