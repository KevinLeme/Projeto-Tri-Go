/*
 * Iconografia de interface (traços vetoriais).
 * Elementos originais do Figma poderão substituir estes ícones após exportação.
 */
(() => {
  "use strict";

  const icon = (body, size = 20) =>
    '<svg class="ui-icon" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + body + '</svg>';

  const drawings = {
    house: '<path d="m3 10 9-7 9 7"/><path d="M5 9v12h14V9"/><path d="M9 21v-7h6v7"/>',
    pin: '<path d="M20 10c0 5.5-8 12-8 12S4 15.5 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    visit: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6m0-6-6 6"/>',
    person: '<circle cx="12" cy="8" r="4"/><path d="M5 20c0-4 3-6 7-6s7 2 7 6"/><circle cx="12" cy="12" r="10"/>',
    search: '<circle cx="10.8" cy="10.8" r="6.9"/><path d="m16.1 16.1 4.4 4.4"/>',
    sliders: '<path d="M4 7h10M18 7h2M4 17h2m4 0h10"/><path d="M14 4v6M8 14v6"/>',
    clipboard: '<rect x="5" y="5" width="14" height="16" rx="2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 11h6M9 15h6M9 18h4"/>',
    stethoscope: '<path d="M6 3v6a5 5 0 0 0 10 0V3M4 3h4m6 0h4"/><path d="M11 14v1.5a4.5 4.5 0 0 0 9 0V13"/><circle cx="20" cy="11.5" r="2"/>',
    baby: '<circle cx="12" cy="13" r="8"/><path d="M10 5c0-2 4-3 5 0"/><path d="M9 12h.01M15 12h.01M9.5 16a3.4 3.4 0 0 0 5 0"/>',
    bone: '<path d="M17 4a3 3 0 0 1 4 4 3 3 0 0 1-3 4l-6 6a3 3 0 0 1-4 3 3 3 0 0 1-4-4 3 3 0 0 1 3-4l6-6a3 3 0 0 1 4-3Z"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
    arrow: '<path d="M4 12h16m-7-7 7 7-7 7"/>',
    heart: '<path d="M20.8 4.8a5.5 5.5 0 0 0-7.8 0L12 5.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z"/>',
    thermometer: '<path d="M9 14V5a3 3 0 0 1 6 0v9a5 5 0 1 1-6 0Z"/><path d="M12 9v9"/><circle cx="12" cy="19" r="1.2"/>',
    headache: '<circle cx="12" cy="12" r="9"/><path d="m12 5-3 7h3l-1 7 5-10h-3l1-4"/>',
    lungs: '<path d="M12 3v8M9 8c-2-1-4 1-5 4-1 3-2 8 2 9 4 1 5-3 6-7M15 8c2-1 4 1 5 4 1 3 2 8-2 9-4 1-5-3-6-7"/><path d="m8 11 4 3 4-3"/>',
    chest: '<path d="M20.5 5c-2-2-5.6-1.8-8.5 1.2C9 3.2 5.5 3 3 5c-4 4 2 10 9 16 7-6 13-12 8.5-16Z"/><path d="m5 12 4 0 2-3 2 6 2-3h4"/>',
    nausea: '<path d="M15 3c-2 2-2 4 1 6s5 4 5 7a6 6 0 0 1-12 0c0-3 2-6 2-8s-1-4-1-5"/><path d="m8 13-3-2m2 6-4 1"/>',
    plusCircle: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
    cough: '<path d="M4 8h7c3 0 4 2 4 4s-1 3-4 3H8M15 9h5M17 6l3 3-3 3M5 18c2-2 4-2 6 0M14 18h5"/>',
    abdomen: '<path d="M8 3v5c-3 2-4 5-4 8a8 8 0 0 0 16 0c0-3-1-6-4-8V3"/><path d="M8 13c1 3 3 4 5 3M12 10h.01"/>',
    dizzy: '<circle cx="12" cy="12" r="9"/><path d="M8 10a4 4 0 0 1 8 0c0 3-3 3-3 5"/><path d="M13 19h.01M4 6l2-2M20 6l-2-2"/>',
    body: '<circle cx="12" cy="4.5" r="2"/><path d="m9 8-4 5m10-5 4 5M12 7v9m-4 6 4-6 4 6M8 10l4 2 4-2"/>'
  };

  const apply = (selectors, shape, size) => {
    document.querySelectorAll(selectors).forEach((element) => {
      element.innerHTML = icon(drawings[shape], size);
    });
  };

  apply('.bottom-nav a[data-nav="home"] > span, .side-links a[data-nav="home"] > span', 'house', 21);
  apply('.bottom-nav a[data-nav="clinics"] > span, .side-links a[data-nav="clinics"] > span', 'pin', 21);
  apply('.bottom-nav a[data-nav="bookings"] > span, .side-links a[data-nav="bookings"] > span', 'visit', 21);
  apply('.bottom-nav a[data-nav="profile"] > span, .side-links a[data-nav="profile"] > span', 'person', 21);
  apply('#screen-home .search-wrap > span, #screen-clinics .search-wrap > span', 'search', 19);
  apply('#screen-home .search-wrap .icon-button', 'sliders', 18);
  apply('#screen-home .callout-icon', 'clipboard', 23);
  apply('#screen-home .specialty-grid button:nth-child(1) span', 'stethoscope', 23);
  apply('#screen-home .specialty-grid button:nth-child(2) span', 'baby', 23);
  apply('#screen-home .specialty-grid button:nth-child(3) span', 'bone', 23);
  apply('#screen-home .preview-appointment .appointment-info .appointment-calendar-icon', 'calendar', 14);
  apply('#screen-home .preview-appointment .appointment-info .appointment-location-icon', 'pin', 14);
  apply('#screen-home .triage-callout .btn .button-arrow', 'arrow', 17);
  apply('#screen-triage .symptom-option:nth-child(1) .symptom-glyph', 'thermometer', 20);
  apply('#screen-triage .symptom-option:nth-child(2) .symptom-glyph', 'headache', 20);
  apply('#screen-triage .symptom-option:nth-child(3) .symptom-glyph', 'lungs', 20);
  apply('#screen-triage .symptom-option:nth-child(4) .symptom-glyph', 'chest', 20);
  apply('#screen-triage .symptom-option:nth-child(5) .symptom-glyph', 'nausea', 20);
  apply('#screen-triage .symptom-option:nth-child(6) .symptom-glyph', 'cough', 20);
  apply('#screen-triage .symptom-option:nth-child(7) .symptom-glyph', 'abdomen', 20);
  apply('#screen-triage .symptom-option:nth-child(8) .symptom-glyph', 'dizzy', 20);
  apply('#screen-triage .symptom-option:nth-child(9) .symptom-glyph', 'body', 20);
  apply('#screen-triage .symptom-option:nth-child(10) .symptom-glyph', 'plusCircle', 20);

})();
