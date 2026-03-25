// Calendar and modal logic migrated from bookings.html

// API Configuration - automatically detects environment
const getApiUrl = () => {
  // Check if we're in development (localhost, file://, or 127.0.0.1)
  const isDev = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' ||
                window.location.hostname === '' ||  // file:// protocol
                window.location.protocol === 'file:';
  
  // Always use localhost backend in development
  if (isDev) {
    return 'http://localhost:8080';
  }
  
  // In production, use the Render backend
  return 'https://gympie-inflatable-nightclub-backend.onrender.com';
};

const API_BASE_URL = getApiUrl();
console.log('🔗 API Base URL:', API_BASE_URL);

// Calendar functionality
let currentDate = new Date();
let bookedDates = [];

async function fetchBookedDates() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/bookings`);
    const bookings = await response.json();
    bookedDates = bookings.map(booking => booking.date);
    console.log('Fetched booked dates:', bookedDates);
  } catch (error) {
    console.error('Error fetching booked dates:', error);
    bookedDates = [];
  }
}

function isDateBooked(dateString) {
  return bookedDates.includes(dateString);
}

function renderCalendar() {
  const calendarElement = document.getElementById('calendar');
  if (!calendarElement) return;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  calendarElement.innerHTML = `
    <div class="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
      <div class="bg-gray-800 p-6 flex justify-between items-center">
        <button onclick="changeMonth(-1)" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors">
          ←
        </button>
        <h2 class="text-2xl font-bold text-white">${monthNames[month]} ${year}</h2>
        <button onclick="changeMonth(1)" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors">
          →
        </button>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-7 gap-2 mb-4">
          <div class="text-center p-3 font-semibold text-gray-400">Sun</div>
          <div class="text-center p-3 font-semibold text-gray-400">Mon</div>
          <div class="text-center p-3 font-semibold text-gray-400">Tue</div>
          <div class="text-center p-3 font-semibold text-gray-400">Wed</div>
          <div class="text-center p-3 font-semibold text-gray-400">Thu</div>
          <div class="text-center p-3 font-semibold text-gray-400">Fri</div>
          <div class="text-center p-3 font-semibold text-gray-400">Sat</div>
        </div>
        <div class="grid grid-cols-7 gap-2" id="calendar-dates">
          <!-- Calendar dates will be inserted here -->
        </div>
      </div>
    </div>
  `;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const datesContainer = document.getElementById('calendar-dates');

  for (let i = 0; i < firstDay; i++) {
    datesContainer.innerHTML += '<div class="p-3"></div>';
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isPast = date < today.setHours(0, 0, 0, 0);
    const isBooked = isDateBooked(dateString);

    let dayClass = 'p-3 text-center cursor-pointer rounded-lg transition-all duration-300 hover:scale-105';
    let clickHandler = '';

    if (isPast) {
      dayClass += ' bg-gray-700 text-gray-500 cursor-not-allowed';
    } else if (isBooked) {
      dayClass += ' bg-red-600 text-white cursor-not-allowed';
    } else {
      dayClass += ' bg-gray-800 text-white hover:bg-blue-600';
      clickHandler = `onclick=\"redirectToSurvey('${dateString}')\"`;
    }

    datesContainer.innerHTML += `
      <div class="${dayClass}" ${clickHandler}>
        ${day}
      </div>
    `;
  }
}

function changeMonth(direction) {
  currentDate.setMonth(currentDate.getMonth() + direction);
  renderCalendar();
}

async function redirectToSurvey(date) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/bookings`);
    const bookings = await response.json();
    const bookedDates = bookings.map(booking => booking.date);

    if (bookedDates.includes(date)) {
      alert('Sorry, this date has just been booked by someone else. Please choose another date.');
      await fetchBookedDates();
      renderCalendar();
      return;
    }

    openSurvey(date);
  } catch (error) {
    console.error('Error checking date availability:', error);
    alert('Error checking availability. Please try again.');
  }
}

// Multi-step form logic
let currentStepNum = 1;
const totalSteps = 5;

function validateStep(stepNum) {
  console.log('Validating step:', stepNum);
  switch(stepNum) {
    case 1:
      const selectedPackage = document.querySelector('input[name="package"]:checked');
      console.log('Selected package:', selectedPackage);
      if (!selectedPackage) {
        alert('⚠️ Please select a package before proceeding.');
        return false;
      }
      console.log('✓ Package selected:', selectedPackage.value);
      return true;
    case 2:
      const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'suburb', 'city', 'postcode', 'partyDate', 'partyTime'];
      for (let field of requiredFields) {
        const input = document.querySelector(`[name="${field}"]`);
        if (!input || !input.value.trim()) {
          alert(`⚠️ Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
          if (input) input.focus();
          return false;
        }
      }
      return true;
    case 3:
      const partyFields = ['partyType', 'partySize', 'vibe', 'ageGroup'];
      for (let field of partyFields) {
        const select = document.querySelector(`[name="${field}"]`);
        if (!select || !select.value) {
          alert(`⚠️ Please select ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}.`);
          if (select) select.focus();
          return false;
        }
      }
      return true;
    case 4:
      const spaceFields = ['clearSpace', 'spaceSize'];
      for (let field of spaceFields) {
        const select = document.querySelector(`[name="${field}"]`);
        if (!select || !select.value) {
          alert(`⚠️ Please answer the question about ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}.`);
          if (select) select.focus();
          return false;
        }
      }
      return true;
    case 5:
      const agreementCheckbox = document.getElementById('agreementCheckbox');
      if (!agreementCheckbox || !agreementCheckbox.checked) {
        alert('⚠️ You must read and agree to the Customer Agreement before proceeding.');
        if (agreementCheckbox) agreementCheckbox.focus();
        return false;
      }
      return true;
    default:
      return true;
  }
}

function showStep(stepNum) {
  for (let i = 1; i <= totalSteps; i++) {
    const step = document.getElementById(`step${i}`);
    if (step) step.classList.add('hidden');
  }
  const currentStep = document.getElementById(`step${stepNum}`);
  if (currentStep) currentStep.classList.remove('hidden');
  const progress = (stepNum / totalSteps) * 100;
  const progressBar = document.getElementById('progressBar');
  if (progressBar) progressBar.style.width = progress + '%';
  const stepIndicator = document.getElementById('currentStep');
  if (stepIndicator) stepIndicator.textContent = stepNum;
  updateNavigationButtons(stepNum);
}

function updateNavigationButtons(stepNum) {
  console.log('🔘 updateNavigationButtons called with step:', stepNum);
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');
  
  console.log('🔘 Button elements found:', {
    prevBtn: !!prevBtn,
    nextBtn: !!nextBtn,
    submitBtn: !!submitBtn
  });
  
  if (prevBtn) {
    if (stepNum === 1) prevBtn.classList.add('hidden');
    else prevBtn.classList.remove('hidden');
  }
  if (stepNum === totalSteps) {
    if (nextBtn) nextBtn.classList.add('hidden');
    if (submitBtn) {
      submitBtn.classList.remove('hidden');
      updateSubmitButtonState();
    }
  } else {
    if (nextBtn) {
      nextBtn.classList.remove('hidden');
      nextBtn.disabled = false;
      console.log('🔘 Next button should now be visible. Classes:', nextBtn.className);
      console.log('🔘 Next button computed display:', window.getComputedStyle(nextBtn).display);
    }
    if (submitBtn) submitBtn.classList.add('hidden');
  }
}

function nextStep() {
  console.log('nextStep called, current step:', currentStepNum);
  const isValid = validateStep(currentStepNum);
  console.log('Validation result:', isValid);
  
  if (!isValid) {
    console.log('Validation failed, not moving forward');
    return;
  }
  
  if (currentStepNum < totalSteps) {
    currentStepNum++;
    console.log('Moving to step:', currentStepNum);
    showStep(currentStepNum);
  } else {
    console.log('Already at last step');
  }
}

function prevStep() {
  if (currentStepNum > 1) {
    currentStepNum--;
    showStep(currentStepNum);
  }
}

function updateSubmitButtonState() {
  const agreementCheckbox = document.getElementById('agreementCheckbox');
  const submitBtn = document.getElementById('submitBtn');
  const agreementStatus = document.getElementById('agreementStatus');
  if (agreementCheckbox && submitBtn) {
    if (agreementCheckbox.checked) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      if (agreementStatus) agreementStatus.classList.remove('hidden');
    } else {
      submitBtn.disabled = true;
      submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
      if (agreementStatus) agreementStatus.classList.add('hidden');
    }
  }
}

function openSurvey(date) {
  const modal = document.getElementById('surveyModal');
  if (modal) {
    if (date) {
      const dateInput = modal.querySelector('input[name="partyDate"]');
      if (dateInput) dateInput.value = date;
    }
    // Close mobile menu if open
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) mobileMenu.classList.add('hidden');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
    currentStepNum = 1;
    setTimeout(() => {
      showStep(1);
      setupButtonListeners();
    }, 100);
  }
}

function setupButtonListeners() {
  console.log('Setting up button listeners...');
  
  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.getElementById('prevBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const agreementCheckbox = document.getElementById('agreementCheckbox');
  const surveyForm = document.getElementById('surveyForm');
  
  // Remove existing listeners by cloning and replacing
  if (nextBtn && !nextBtn.dataset.listenerAdded) {
    nextBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Next button clicked');
      nextStep();
    });
    nextBtn.dataset.listenerAdded = 'true';
  }
  
  if (prevBtn && !prevBtn.dataset.listenerAdded) {
    prevBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Previous button clicked');
      prevStep();
    });
    prevBtn.dataset.listenerAdded = 'true';
  }
  
  if (cancelBtn && !cancelBtn.dataset.listenerAdded) {
    cancelBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Cancel button clicked');
      closeSurvey();
    });
    cancelBtn.dataset.listenerAdded = 'true';
  }
  
  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn && !submitBtn.dataset.listenerAdded) {
    submitBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      console.log('Submit button clicked');
      if (validateStep(5)) {
        // Trigger form submission
        const form = document.getElementById('surveyForm');
        if (form) {
          const event = new Event('submit', { bubbles: true, cancelable: true });
          form.dispatchEvent(event);
        }
      }
    });
    submitBtn.dataset.listenerAdded = 'true';
  }
  
  if (agreementCheckbox && !agreementCheckbox.dataset.listenerAdded) {
    agreementCheckbox.addEventListener('change', updateSubmitButtonState);
    agreementCheckbox.dataset.listenerAdded = 'true';
  }
  
  const packageInputs = document.querySelectorAll('input[name="package"]');
  packageInputs.forEach(input => {
    if (!input.dataset.listenerAdded) {
      const card = input.closest('.package-card');
      if (card) {
        card.addEventListener('click', function(e) {
          if (e.target !== input) {
            input.checked = true;
            console.log('Package selected:', input.value);
          }
        });
      }
      input.dataset.listenerAdded = 'true';
    }
  });
  
  if (surveyForm && !surveyForm.dataset.listenerAdded) {
    surveyForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      if (!validateStep(5)) return;
      const submitBtn = document.getElementById('submitBtn');
      const originalText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.innerHTML = '⏳ Submitting...';
        submitBtn.disabled = true;
      }
      try {
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        const agreementCheckbox = document.getElementById('agreementCheckbox');
        data.customerAgreementAccepted = agreementCheckbox ? agreementCheckbox.checked : false;
        data.agreementAcceptedTimestamp = new Date().toISOString();
        if (data.partyDate && data.partyTime) {
          const dateObj = new Date(data.partyDate);
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
          const dayNumber = dateObj.getDate();
          const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });
          const year = dateObj.getFullYear();
          const [hours, minutes] = data.partyTime.split(':');
          const hour24 = parseInt(hours);
          const hour12 = hour24 > 12 ? hour24 - 12 : (hour24 === 0 ? 12 : hour24);
          const ampm = hour24 >= 12 ? 'PM' : 'AM';
          const timeFormatted = `${hour12}:${minutes} ${ampm}`;
          data.datetime = `${dayName} ${dayNumber}${getOrdinalSuffix(dayNumber)} ${monthName} ${year}, ${timeFormatted}`;
          data.date = data.partyDate;
          data.time = data.partyTime;
          delete data.partyDate;
          delete data.partyTime;
        }
        function getOrdinalSuffix(day) {
          if (day >= 11 && day <= 13) return 'th';
          switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
          }
        }
        if (data.ageGroup) {
          data.agegroup = data.ageGroup;
          delete data.ageGroup;
        }
        const response = await fetch(`${API_BASE_URL}/api/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
          if (submitBtn) {
            submitBtn.innerHTML = '✅ Booking Submitted!';
            submitBtn.classList.remove('from-green-500', 'to-green-600');
            submitBtn.classList.add('bg-green-600');
          }
          setTimeout(() => {
            closeSurvey();
            alert('🎉 Your booking request has been submitted! We\'ll get back to you soon.');
            fetchBookedDates().then(() => {
              renderCalendar();
            });
          }, 1500);
        } else {
          throw new Error(result.message || 'Submission failed');
        }
      } catch (error) {
        if (submitBtn) {
          submitBtn.innerHTML = '❌ Try Again';
          submitBtn.classList.remove('from-green-500', 'to-green-600');
          submitBtn.classList.add('bg-red-600');
          setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.classList.remove('bg-red-600');
            submitBtn.classList.add('from-green-500', 'to-green-600');
            submitBtn.disabled = false;
          }, 2000);
        }
        alert('❌ There was an error submitting your booking. Please try again.');
      }
    });
    surveyForm.dataset.listenerAdded = 'true';
  }
  
  console.log('Button listeners setup complete');
}

function closeSurvey() {
  const modal = document.getElementById('surveyModal');
  const form = document.getElementById('surveyForm');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  document.body.style.overflow = '';
  if (form) form.reset();
  currentStepNum = 1;
}

document.addEventListener('DOMContentLoaded', function() {
  fetchBookedDates().then(() => {
    renderCalendar();
  });
  showStep(1);
  setupButtonListeners();
});
