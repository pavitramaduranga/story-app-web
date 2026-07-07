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

const signupForms = document.querySelectorAll('[data-early-bird-form]');
const shareSignupButton = document.getElementById('share-signup');

if (!signupForms.length) {
  console.warn('Early bird signup form not found on the page.');
}

const firebaseConfig = window.firebaseConfig;
let db = null;

const shareData = {
  title: 'Baboo Stories early access',
  text: 'Join the Baboo Stories early bird list for launch updates and exclusive story samplers.',
  url: 'https://baboostories.com/early-bird-signup.html',
};

const shareByEmail = () => {
  const subject = encodeURIComponent(shareData.title);
  const body = encodeURIComponent(`${shareData.text} ${shareData.url}`);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
};

if (shareSignupButton) {
  shareSignupButton.addEventListener('click', async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error.name === 'AbortError') {
          return;
        }

        console.warn('Native sharing failed, falling back to email:', error);
      }
    }

    shareByEmail();
  });
}

if (!firebaseConfig || !firebaseConfig.apiKey) {
  console.warn(
    'Firebase configuration is missing. Update assets/js/firebase-config.js with your project credentials.'
  );

  signupForms.forEach((form) => {
    const formStatus = document.getElementById(form.dataset.statusTarget);

    if (formStatus) {
      formStatus.textContent =
        'The signup form is not connected yet. Please check back soon.';
      formStatus.classList.add('error');
    }
  });
} else {
  try {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (error) {
    console.error('Unable to initialise Firebase:', error);

    signupForms.forEach((form) => {
      const formStatus = document.getElementById(form.dataset.statusTarget);

      if (formStatus) {
        formStatus.textContent =
          'We had trouble starting our database. Please try again later.';
        formStatus.classList.add('error');
      }
    });
  }
}

signupForms.forEach((form) => {
  const formStatus = document.getElementById(form.dataset.statusTarget);
  const signupShare = document.getElementById(form.dataset.shareTarget);

  if (!db) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      if (formStatus) {
        formStatus.textContent =
          'We are getting things ready. Please try again soon.';
        formStatus.classList.add('error');
      }
    });

    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const defaultButtonText = submitButton ? submitButton.textContent : '';

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    }

    if (formStatus) {
      formStatus.textContent = 'Sending your details...';
      formStatus.classList.remove('error', 'success');
    }

    if (signupShare) {
      signupShare.hidden = true;
    }

    const formData = new FormData(form);
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

      if (signupShare) {
        signupShare.hidden = false;
      }

      form.reset();
    } catch (error) {
      console.error('Firestore submission failed:', error);

      if (formStatus) {
        formStatus.textContent =
          'Something went wrong. Please try again or email hello@baboostories.com.';
        formStatus.classList.add('error');
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = defaultButtonText;
      }
    }
  });
});
