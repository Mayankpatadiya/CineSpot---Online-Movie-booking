(function () {
  'use strict';

  const PATTERNS = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone: /^[0-9]{10}$/,
    phoneFlexible: /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,15}$/,
    passwordStrong: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,25}$/,
    cardNumber: /^[0-9]{16}$/,
    cardExpiry: /^(0[1-9]|1[0-2])\/?([0-9]{2})$/,
    cardCvv: /^[0-9]{3,4}$/
  };

  function getFeedbackElement(input) {
    if (!input) return null;

    const id = input.id || '';
    const name = input.name || '';
    let feedback = null;

    if (id) {
      const cleanId = id.replace(/^(reg-|login-|card-)/, '');
      feedback = document.getElementById(cleanId + 'Error') || document.getElementById(id + 'Error');
    }

    if (!feedback && name) {
      feedback = document.getElementById(name + 'Error');
    }

    if (!feedback && input.parentElement) {
      feedback = input.parentElement.querySelector('.invalid-feedback');
    }

    if (!feedback && input.closest('.input-group')) {
      feedback = input.closest('.input-group').parentElement.querySelector('.invalid-feedback');
    }

    return feedback;
  }

  function showError(input, message) {
    if (!input) return;

    input.classList.add('is-invalid');
    input.classList.remove('is-valid');

    const feedback = getFeedbackElement(input);
    if (feedback) {
      feedback.textContent = message;
      feedback.style.display = 'block';
    }
  }

  function showSuccess(input) {
    if (!input) return;

    input.classList.remove('is-invalid');

    const hasValue = input.type === 'checkbox' ? input.checked : input.value.trim() !== '';
    input.classList.toggle('is-valid', hasValue);

    const feedback = getFeedbackElement(input);
    if (feedback) {
      feedback.textContent = '';
      feedback.style.display = 'none';
    }
  }

  function validateField(input) {
    if (!input) return true;

    const value = input.value ? input.value.trim() : '';
    const type = input.type || '';
    const rules = (input.getAttribute('data-validation') || '').toLowerCase().split(/\s+/).filter(Boolean);
    const isRequired = input.hasAttribute('required') || rules.includes('required');
    const minLength = parseInt(input.getAttribute('data-min') || '0', 10);
    const maxLength = parseInt(input.getAttribute('data-max') || '9999', 10);

    if (type === 'checkbox') {
      if (isRequired && !input.checked) {
        showError(input, 'You must agree to the terms and conditions.');
        return false;
      }
      showSuccess(input);
      return true;
    }

    if (isRequired && value === '') {
      const label = input.placeholder || input.name || 'This field';
      showError(input, `${label.replace('Enter ', '')} is required.`);
      return false;
    }

    if (!isRequired && value === '') {
      showSuccess(input);
      return true;
    }

    if (type === 'email' || rules.includes('email') || input.name === 'email' || input.id.includes('email')) {
      if (!PATTERNS.email.test(value)) {
        showError(input, 'Please enter a valid email address (e.g. name@example.com).');
        return false;
      }
    }

    if (type === 'tel' || rules.includes('phone') || input.name === 'phone' || input.id.includes('phone')) {
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length !== 10 && !PATTERNS.phoneFlexible.test(value)) {
        showError(input, 'Please enter a valid 10-digit mobile number.');
        return false;
      }
    }

    if (rules.includes('strongpassword')) {
      if (value.length < 8) {
        showError(input, 'Password must be at least 8 characters long.');
        return false;
      }
      if (!/[A-Z]/.test(value)) {
        showError(input, 'Password must contain at least one uppercase letter (A-Z).');
        return false;
      }
      if (!/[a-z]/.test(value)) {
        showError(input, 'Password must contain at least one lowercase letter (a-z).');
        return false;
      }
      if (!/[0-9]/.test(value)) {
        showError(input, 'Password must contain at least one number (0-9).');
        return false;
      }
      if (!/[@$!%*?&]/.test(value)) {
        showError(input, 'Password must contain at least one special character (@$!%*?&).');
        return false;
      }
    }

    if (rules.includes('confirmpassword') || input.id === 'reg-confirm-password') {
      const targetId = input.getAttribute('data-password-id') || 'reg-password';
      const targetInput = document.getElementById(targetId);
      const targetValue = targetInput ? targetInput.value : '';

      if (value !== targetValue) {
        showError(input, 'Passwords do not match. Please re-enter.');
        return false;
      }
    }

    if (input.id === 'card-number' || rules.includes('cardnumber')) {
      const digitsOnly = value.replace(/\s+/g, '');
      if (!PATTERNS.cardNumber.test(digitsOnly)) {
        showError(input, 'Please enter a valid 16-digit card number.');
        return false;
      }
    }

    if (input.id === 'card-expiry' || rules.includes('cardexpiry')) {
      const match = value.match(PATTERNS.cardExpiry);
      if (!match) {
        showError(input, 'Enter expiry in MM/YY format (e.g. 12/28).');
        return false;
      }

      const month = parseInt(match[1], 10);
      const year = parseInt(`20${match[2]}`, 10);
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      if (month < 1 || month > 12) {
        showError(input, 'Invalid month (01-12).');
        return false;
      }

      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        showError(input, 'Card has already expired.');
        return false;
      }
    }

    if (input.id === 'card-cvv' || rules.includes('cardcvv')) {
      if (!PATTERNS.cardCvv.test(value)) {
        showError(input, 'Enter a valid 3 or 4 digit CVV.');
        return false;
      }
    }

    if (minLength > 0 && value.length < minLength) {
      showError(input, `Must be at least ${minLength} characters.`);
      return false;
    }

    if (maxLength < 9999 && value.length > maxLength) {
      showError(input, `Must not exceed ${maxLength} characters.`);
      return false;
    }

    showSuccess(input);
    return true;
  }

  function validateForm(formOrSelector) {
    const form = typeof formOrSelector === 'string' ? document.querySelector(formOrSelector) : formOrSelector;
    if (!form) return true;

    let isFormValid = true;
    let firstInvalid = null;

    form.querySelectorAll('input, select, textarea').forEach((input) => {
      if (input.type === 'hidden' || input.disabled) return;

      const valid = validateField(input);
      if (!valid) {
        isFormValid = false;
        if (!firstInvalid) firstInvalid = input;
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
    }

    return isFormValid;
  }

  function attachFieldValidation(form) {
    if (!form || form.dataset.validationBound === 'true') return;

    form.dataset.validationBound = 'true';

    form.addEventListener('input', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.matches('input, select, textarea')) {
        validateField(target);
        if (target.id === 'reg-password') {
          const confirmField = document.getElementById('reg-confirm-password');
          if (confirmField && confirmField.value) {
            validateField(confirmField);
          }
        }
      }
    });

    form.addEventListener('change', (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.matches('input, select, textarea')) {
        validateField(target);
      }
    });

    form.addEventListener('blur', (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.matches('input, select, textarea')) {
        validateField(target);
      }
    }, true);
  }

  function bindFormSubmit(form) {
    if (!form) return;

    const customHandlers = {
      'register-form': () => {
        const nameInput = document.getElementById('reg-name');
        const userName = nameInput ? nameInput.value.trim() : 'User';

        if (window.CineUI && window.CineUI.showToast) {
          window.CineUI.showToast(`Registration successful! Welcome to CineSpots, ${userName}.`, 'success');
        } else {
          alert(`Registration successful! Welcome to CineSpots, ${userName}.`);
        }

        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1200);
      },
      'login-form': () => {
        const emailInput = document.getElementById('login-email');
        const userValue = emailInput ? emailInput.value.trim() : 'User';

        if (window.CineUI && window.CineUI.showToast) {
          window.CineUI.showToast(`Sign in successful! Welcome back, ${userValue}.`, 'success');
        } else {
          alert(`Sign in successful! Welcome back, ${userValue}.`);
        }

        setTimeout(() => {
          window.location.href = '../index.html';
        }, 1200);
      },
      'forgot-password-form': () => {
        const message = document.getElementById('reset-request-message');
        if (message) {
          message.textContent = 'Your request was submitted. Password reset email delivery is not configured in this demo.';
          message.classList.remove('text-danger');
          message.classList.add('text-secondary');
        }
      },
      'payment-card-form': () => {
        if (window.CineUI && window.CineUI.showToast) {
          window.CineUI.showToast('Payment verified successfully! Generating your digital ticket...', 'success');
        } else {
          alert('Payment verified successfully! Generating your digital ticket...');
        }

        setTimeout(() => {
          window.location.href = 'booking-confirmation.html';
        }, 1200);
      }
    };

    form.addEventListener('submit', (event) => {
      if (!validateForm(form)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);

    const handler = customHandlers[form.id];
    if (handler) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        handler();
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('form').forEach((form) => {
      attachFieldValidation(form);
      bindFormSubmit(form);
    });
  });

  window.validateField = validateField;
  window.validateForm = validateForm;
})();
