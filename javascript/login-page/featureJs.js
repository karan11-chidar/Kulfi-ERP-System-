
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('passwordInput');
    const eyeOpen = document.getElementById('eyeOpen');
    const eyeClosed = document.getElementById('eyeClosed');

    togglePassword.addEventListener('click', function () {
      // Toggle input type
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      // Toggle icons
      if (type === 'text') {
        eyeOpen.classList.add('hidden');
        eyeClosed.classList.remove('hidden');
      } else {
        eyeOpen.classList.remove('hidden');
        eyeClosed.classList.add('hidden');
      }
    });

