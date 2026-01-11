// Site configuration for BooknSleep
const siteConfig = {
  // Launch target date: 2026-05-15T00:00:00Z (124 days from 2026-01-11)
  launchDate: '2026-05-15T00:00:00Z',
  // Progress tracking
  signupGoal: 100,
};

// Export for use in other scripts (if using modules) or make available globally
if (typeof module !== 'undefined' && module.exports) {
  module.exports = siteConfig;
} else {
  window.siteConfig = siteConfig;
}
