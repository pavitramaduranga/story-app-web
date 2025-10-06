import {
  initializeApp,
  getApps,
  getApp,
} from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';

const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

if (!contactForm) {
  console.warn('Contact form not found on the page.');
}

const firebaseConfig = window.firebaseConfig;
let db = null;

if (!firebaseConfig || !firebaseConfig.apiKey) {
  console.warn(
    'Firebase configuration is missing. Update assets/js/firebase-config.js with your project credentials.'
  );

  if (formStatus) {
    formStatus.textContent =
      'The signup form is not connected yet. Please check back soon.';
    formStatus.classList.add('error');
  }
} else {
  try {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (error) {
    console.error('Unable to initialise Firebase:', error);

    if (formStatus) {
      formStatus.textContent =
        'We had trouble starting our database. Please try again later.';
      formStatus.classList.add('error');
    }
  }
}

if (contactForm && db) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) {
      return;
    }

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const defaultButtonText = submitButton ? submitButton.textContent : '';

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    }

    if (formStatus) {
      formStatus.textContent = 'Sending your details...';
      formStatus.classList.remove('error', 'success');
    }

    const formData = new FormData(contactForm);
    const payload = {
      name: (formData.get('name') || '').toString().trim(),
      email: (formData.get('email') || '').toString().trim(),
      childrenAges: (formData.get('childrenAges') || '').toString().trim(),
      expectations: (formData.get('expectations') || '').toString().trim(),
      referralSource: (formData.get('referralSource') || '').toString().trim(),
      userAgent: navigator.userAgent,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'earlyBirdSignups'), payload);

      if (formStatus) {
        formStatus.textContent = "You're on the list! We'll be in touch soon.";
        formStatus.classList.add('success');
      }

      contactForm.reset();
    } catch (error) {
      console.error('Firestore submission failed:', error);

      if (formStatus) {
        formStatus.textContent =
          'Something went wrong. Please try again or email hello@baboostories.app.';
        formStatus.classList.add('error');
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = defaultButtonText;
      }
    }
  });
} else if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (formStatus) {
      formStatus.textContent =
        'We are getting things ready. Please try again soon.';
      formStatus.classList.add('error');
    }
  });
}
