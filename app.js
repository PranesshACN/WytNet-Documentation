document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lucide Icons
  lucide.createIcons();

  // ==========================================================================
  // 2. Theme Switching Logic
  // ==========================================================================
  const themeToggleBtn = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('theme') || 'dark';
  
  document.documentElement.setAttribute('data-theme', currentTheme);

  themeToggleBtn.addEventListener('click', () => {
    const activeTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  // ==========================================================================
  // 3. ScrollSpy Navigation (Active State Highlighter)
  // ==========================================================================
  const sections = document.querySelectorAll('.content-section');
  const navItems = document.querySelectorAll('.nav-item');

  const onScroll = () => {
    let scrollPos = window.scrollY || document.documentElement.scrollTop;

    // Highlight Navigation Items
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navItems.forEach(item => {
          item.classList.remove('active');
          if (item.getAttribute('href') === `#${sectionId}`) {
            item.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', onScroll);
  onScroll(); // Run once initially to highlight active section on load

  // ==========================================================================
  // 4. Checklist Progress Tracker Logic (Saved in LocalStorage)
  // ==========================================================================
  const taskCheckboxes = document.querySelectorAll('.task-checkbox');
  const progressPercentText = document.getElementById('progress-percent');
  const progressFill = document.getElementById('progress-fill');
  const resetBtn = document.getElementById('reset-checklist');

  // Load saved checklist states
  const loadChecklistState = () => {
    const savedStates = JSON.parse(localStorage.getItem('wytnet_checklist') || '{}');
    taskCheckboxes.forEach(checkbox => {
      if (savedStates[checkbox.id] !== undefined) {
        checkbox.checked = savedStates[checkbox.id];
      }
    });
    updateProgress();
  };

  // Calculate and update progress details
  const updateProgress = () => {
    const total = taskCheckboxes.length;
    const checkedCount = Array.from(taskCheckboxes).filter(cb => cb.checked).length;
    const percentage = total > 0 ? Math.round((checkedCount / total) * 100) : 0;
    
    if (progressPercentText) progressPercentText.textContent = `${percentage}%`;
    if (progressFill) progressFill.style.width = `${percentage}%`;

    // Sync flow step nodes completion states
    updateFlowStepCompletion(percentage);
  };

  // Checkbox change listener
  taskCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const savedStates = JSON.parse(localStorage.getItem('wytnet_checklist') || '{}');
      savedStates[checkbox.id] = checkbox.checked;
      localStorage.setItem('wytnet_checklist', JSON.stringify(savedStates));
      updateProgress();
    });
  });

  // Reset checklist controls
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      localStorage.removeItem('wytnet_checklist');
      taskCheckboxes.forEach(cb => cb.checked = false);
      updateProgress();
    });
  }

  loadChecklistState();

  // Sync checklist percentage into flow steps
  function updateFlowStepCompletion(percentage) {
    const flowNodes = document.querySelectorAll('.flow-node');
    if (flowNodes.length === 0) return;
    
    const userRegChecked = Array.from(document.querySelectorAll('[data-category="user-reg"] input')).filter(cb => cb.checked).length;
    const devAccountChecked = Array.from(document.querySelectorAll('[data-category="dev-account"] input')).filter(cb => cb.checked).length;
    const appListingChecked = Array.from(document.querySelectorAll('[data-category="app-creation"] input, [data-category="app-edit"] input')).filter(cb => cb.checked).length;
    const ssoPaymentChecked = Array.from(document.querySelectorAll('[data-category="sso"] input, [data-category="payment"] input')).filter(cb => cb.checked).length;
    const settlementsChecked = Array.from(document.querySelectorAll('[data-category="settlements"] input')).filter(cb => cb.checked).length;

    toggleNodeClass(flowNodes[0], userRegChecked >= 2);
    toggleNodeClass(flowNodes[1], devAccountChecked >= 2);
    toggleNodeClass(flowNodes[2], appListingChecked >= 4);
    toggleNodeClass(flowNodes[3], ssoPaymentChecked >= 4);
    toggleNodeClass(flowNodes[4], settlementsChecked >= 2);
  }

  function toggleNodeClass(node, condition) {
    if (!node) return;
    if (condition) {
      node.classList.add('completed');
    } else {
      node.classList.remove('completed');
    }
  }

  // ==========================================================================
  // 5. Interactive Flow / Workflow Steps Controller
  // ==========================================================================
  const flowNodes = document.querySelectorAll('.flow-node');
  const flowStepTitle = document.getElementById('flow-step-title');
  const flowStepDesc = document.getElementById('flow-step-desc');

  const stepsDetails = {
    '1': {
      title: '1. User Account Registration',
      desc: 'Users register on WytNet using their name, verified email, username, phone number, and password. This unified profile acts as their digital passport across all third-party applications inside the WytNet network.'
    },
    '2': {
      title: '2. Developer Account Approval',
      desc: 'Users apply for merchant / developer status by providing detailed organization metadata (domains, official contact info, descriptions). Administrators verify legitimacy before activating publishing rights.'
    },
    '3': {
      title: '3. Application Listing & Review',
      desc: 'Developers submit app details, high-quality media screenshots, logos, and OAuth configuration redirects. WytNet staff verifies compliance, features, and assets prior to public release.'
    },
    '4': {
      title: '4. SSO & Centralized Payments integration',
      desc: 'Apps deploy WytPass SSO Client ID/Secrets for user login. The Centralized Payments webhook handles instant redirect checkouts, enforcing Allowed Domains configuration to prevent payment spoofing.'
    },
    '5': {
      title: '5. balance Settlements',
      desc: 'Every purchase updates the developer account balance. Payouts are manually requested once the balance exceeds minimum parameters, processing directly into verified merchant routing banks.'
    }
  };

  flowNodes.forEach(node => {
    node.addEventListener('click', () => {
      flowNodes.forEach(n => n.classList.remove('active'));
      node.classList.add('active');

      const step = node.getAttribute('data-step');
      if (stepsDetails[step] && flowStepTitle && flowStepDesc) {
        flowStepTitle.textContent = stepsDetails[step].title;
        flowStepDesc.textContent = stepsDetails[step].desc;
      }
    });
  });

  // ==========================================================================
  // 6. Search Overlay Modal Handler (AlloWear Search Overlay style)
  // ==========================================================================
  const searchTrigger = document.getElementById('search-trigger');
  const searchModal = document.getElementById('search-modal');
  const searchModalClose = document.getElementById('search-modal-close');
  const modalSearchInput = document.getElementById('modal-search-input');
  const searchResultsGroups = document.querySelectorAll('.search-results-group');
  const searchNoResults = document.getElementById('search-no-results');

  const openSearchModal = () => {
    if (!searchModal) return;
    searchModal.style.display = 'flex';
    setTimeout(() => {
      if (modalSearchInput) modalSearchInput.focus();
    }, 50);
  };

  const closeSearchModal = () => {
    if (!searchModal) return;
    searchModal.style.display = 'none';
    if (modalSearchInput) modalSearchInput.value = '';
    
    // Reset matches view
    searchResultsGroups.forEach(group => {
      group.style.display = 'flex';
      const items = group.querySelectorAll('.search-result-item');
      items.forEach(i => i.style.display = 'flex');
    });
    if (searchNoResults) searchNoResults.style.display = 'none';
  };

  if (searchTrigger) searchTrigger.addEventListener('click', openSearchModal);
  if (searchModalClose) searchModalClose.addEventListener('click', closeSearchModal);

  if (searchModal) {
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) {
        closeSearchModal();
      }
    });
  }

  // Real-time overlay query filtering
  if (modalSearchInput) {
    modalSearchInput.addEventListener('input', () => {
      const query = modalSearchInput.value.toLowerCase().trim();
      let totalMatches = 0;

      searchResultsGroups.forEach(group => {
        const items = group.querySelectorAll('.search-result-item');
        let groupMatches = 0;

        items.forEach(item => {
          const searchText = item.getAttribute('data-search-text') || '';
          const labelText = item.querySelector('span') ? item.querySelector('span').textContent : '';
          const textToMatch = `${searchText} ${labelText}`.toLowerCase();

          if (query === '' || textToMatch.includes(query)) {
            item.style.display = 'flex';
            groupMatches++;
            totalMatches++;
          } else {
            item.style.display = 'none';
          }
        });

        // Hide/show the group title depending on if it has matching children
        if (groupMatches > 0) {
          group.style.display = 'flex';
        } else {
          group.style.display = 'none';
        }
      });

      // Display "no results" state
      if (searchNoResults) {
        if (totalMatches === 0 && query !== '') {
          searchNoResults.style.display = 'flex';
        } else {
          searchNoResults.style.display = 'none';
        }
      }
    });
  }

  // Search shortcut hotkey (Ctrl + K or Cmd + K)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openSearchModal();
    }
    if (e.key === 'Escape' && searchModal && searchModal.style.display === 'flex') {
      closeSearchModal();
    }
  });

  // Handle clicking search results to close modal
  const searchResultsItems = document.querySelectorAll('.search-result-item');
  searchResultsItems.forEach(item => {
    item.addEventListener('click', () => {
      closeSearchModal();
    });
  });

  // ==========================================================================
  // 7. FAQ Accordions Logic (AlloWear Accordion style)
  // ==========================================================================
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const faqItem = question.parentElement;
      const faqAnswer = faqItem.querySelector('.faq-answer');
      const isActive = faqItem.classList.contains('active');

      // Collapse all FAQ items
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
        const answer = item.querySelector('.faq-answer');
        if (answer) answer.style.maxHeight = null;
      });

      // If clicked item was not active, expand it
      if (!isActive && faqAnswer) {
        faqItem.classList.add('active');
        faqAnswer.style.maxHeight = faqAnswer.scrollHeight + 'px';
      }
    });
  });

  // ==========================================================================
  // 8. Carousel Handler (App Creation Slideshow)
  // ==========================================================================
  const carouselSlides = document.querySelectorAll('.carousel-slide');
  const carouselDots = document.querySelectorAll('.carousel-dots .dot');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  let activeIndex = 0;

  const showSlide = (index) => {
    if (carouselSlides.length === 0) return;
    carouselSlides.forEach(slide => slide.classList.remove('active'));
    carouselDots.forEach(dot => dot.classList.remove('active'));

    carouselSlides[index].classList.add('active');
    carouselDots[index].classList.add('active');
    activeIndex = index;
  };

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      let index = activeIndex - 1;
      if (index < 0) index = carouselSlides.length - 1;
      showSlide(index);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      let index = activeIndex + 1;
      if (index >= carouselSlides.length) index = 0;
      showSlide(index);
    });
  }

  carouselDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.getAttribute('data-slide'));
      showSlide(index);
    });
  });

  // ==========================================================================
  // 9. Fullscreen Lightbox Overlay Controller
  // ==========================================================================
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const lightboxTriggers = document.querySelectorAll('.lightbox-trigger');

  let activeLightboxIndex = 0;
  const imageList = Array.from(lightboxTriggers);

  const openLightbox = (index) => {
    if (!lightboxImg || !lightboxCaption || !lightboxModal) return;
    const trigger = imageList[index];
    lightboxImg.src = trigger.src;
    lightboxCaption.textContent = trigger.alt;
    lightboxModal.style.display = 'flex';
    activeLightboxIndex = index;
  };

  lightboxTriggers.forEach((trigger, index) => {
    trigger.addEventListener('click', () => {
      openLightbox(index);
    });
  });

  // Close Lightbox
  const closeLightbox = () => {
    if (lightboxModal) lightboxModal.style.display = 'none';
  };

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        closeLightbox();
      }
    });
  }

  // Navigate Lightbox images
  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      let index = activeLightboxIndex - 1;
      if (index < 0) index = imageList.length - 1;
      openLightbox(index);
    });
  }

  if (lightboxNext) {
    lightboxNext.addEventListener('click', (e) => {
      e.stopPropagation();
      let index = activeLightboxIndex + 1;
      if (index >= imageList.length) index = 0;
      openLightbox(index);
    });
  }

  // Keyboard navigation for Lightbox
  document.addEventListener('keydown', (e) => {
    if (lightboxModal && lightboxModal.style.display === 'flex') {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft' && lightboxPrev) {
        lightboxPrev.click();
      } else if (e.key === 'ArrowRight' && lightboxNext) {
        lightboxNext.click();
      }
    }
  });

  // ==========================================================================
  // 10. Code Clipboard Copy Utility
  // ==========================================================================
  const copyButtons = document.querySelectorAll('.copy-btn');

  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-copy-target');
      const codeElement = document.getElementById(targetId);
      if (codeElement) {
        navigator.clipboard.writeText(codeElement.textContent).then(() => {
          btn.textContent = 'Copied!';
          btn.style.borderColor = 'var(--success-color)';
          btn.style.color = 'var(--success-color)';
          
          setTimeout(() => {
            btn.textContent = 'Copy Code';
            btn.style.borderColor = 'var(--card-border)';
            btn.style.color = 'var(--text-secondary)';
          }, 2000);
        }).catch(err => {
          console.error('Failed to copy code: ', err);
        });
      }
    });
  });

});
