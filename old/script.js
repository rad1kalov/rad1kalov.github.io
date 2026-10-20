/**
 * rad1kalov.github.io — Interactive micro-interactions & clipboard management
 * - Discord copy to clipboard with modern async API & legacy execCommand fallback
 * - Debounced floating toast notification & button state transition
 * - Card mouse-tracking spotlight interaction (60fps requestAnimationFrame)
 * - Accessibility: respects prefers-reduced-motion
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // Discord Copy to Clipboard with Debounced Toast Feedback
  // --------------------------------------------------------------------------
  const DISCORD_TAG = 'rad1kalov';
  const DEFAULT_DISCORD_LABEL = 'Скопировать Discord тег: rad1kalov';
  const FEEDBACK_DURATION_MS = 2000;

  let toastTimer = null;

  async function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        // Modern API rejected (e.g. permission denied or document not focused) -> proceed to legacy fallback
      }
    }

    // Fallback for sandboxed environments or non-HTTPS origins
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    } catch (err) {
      if (textArea.parentNode) {
        textArea.parentNode.removeChild(textArea);
      }
      throw err;
    }
  }

  function handleDiscordCopy(button) {
    if (!button) return;

    const toast = document.getElementById('toast');

    copyTextToClipboard(DISCORD_TAG)
      .then(() => {
        // Clear previous timeout if user clicks rapidly
        if (toastTimer) {
          clearTimeout(toastTimer);
          toastTimer = null;
        }

        // Apply active feedback classes
        button.classList.add('copied');
        button.setAttribute('aria-label', 'Скопировано: rad1kalov');

        if (toast) {
          toast.textContent = 'Скопировано: rad1kalov';
          toast.classList.add('visible');
        }

        // Restore original UI state after configured duration (~2000ms)
        toastTimer = setTimeout(() => {
          button.classList.remove('copied');
          button.setAttribute('aria-label', DEFAULT_DISCORD_LABEL);
          if (toast) {
            toast.classList.remove('visible');
          }
          toastTimer = null;
        }, FEEDBACK_DURATION_MS);
      })
      .catch((err) => {
        console.warn('Clipboard copy failed:', err);
        button.classList.remove('copied');
        button.setAttribute('aria-label', DEFAULT_DISCORD_LABEL);
        // Show fallback information in toast if available
        if (toast) {
          toast.textContent = 'Discord тег: rad1kalov';
          toast.classList.add('visible');
          if (toastTimer) {
            clearTimeout(toastTimer);
          }
          toastTimer = setTimeout(() => {
            toast.classList.remove('visible');
            toastTimer = null;
          }, FEEDBACK_DURATION_MS);
        }
      });
  }

  // --------------------------------------------------------------------------
  // Interactive Spotlight Micro-Interaction
  // --------------------------------------------------------------------------
  function initCardSpotlight() {
    const card = document.querySelector('.card');
    if (!card) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) return;

    let rafId = null;

    card.addEventListener('pointermove', (event) => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });

    card.addEventListener('pointerleave', () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      card.style.removeProperty('--mouse-x');
      card.style.removeProperty('--mouse-y');
    });
  }

  // --------------------------------------------------------------------------
  // Initialization
  // --------------------------------------------------------------------------
  function init() {
    const discordBtn = document.getElementById('btn-discord-copy');
    if (discordBtn) {
      discordBtn.addEventListener('click', () => handleDiscordCopy(discordBtn));
    }

    initCardSpotlight();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
