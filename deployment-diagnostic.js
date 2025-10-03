/* DEPLOYMENT DIAGNOSTIC SCRIPT */
/* Add this to your browser console on the deployed site to debug CSS issues */

console.log('🚀 DEPLOYMENT DIAGNOSTIC STARTING...');

// Check if ProfilePage exists
const profilePage = document.querySelector('.profile-page');
console.log('📄 ProfilePage element found:', !!profilePage);

if (profilePage) {
  console.log('📐 ProfilePage computed styles:');
  const styles = window.getComputedStyle(profilePage);
  console.log({
    background: styles.background,
    minHeight: styles.minHeight,
    fontFamily: styles.fontFamily,
    paddingTop: styles.paddingTop,
    position: styles.position,
    zIndex: styles.zIndex
  });
}

// Check body classes
console.log('🎯 Body classes:', document.body.classList.toString());

// Check if our deployment CSS is loaded
const deploymentStyles = document.querySelectorAll('style[id*="profile-page-deployment"]');
console.log('🎨 Deployment styles injected:', deploymentStyles.length);

// Check for conflicting stylesheets
const stylesheets = Array.from(document.styleSheets);
console.log('📋 Total stylesheets loaded:', stylesheets.length);

// Check CSS variables
const rootStyles = window.getComputedStyle(document.documentElement);
console.log('🔧 CSS Variables available:', {
  primaryColor: rootStyles.getPropertyValue('--color-primary'),
  fontSans: rootStyles.getPropertyValue('--font-sans')
});

// Force apply emergency styles
console.log('🚨 APPLYING EMERGENCY STYLES...');

document.body.style.cssText = `
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #e2e8f0 75%, #cbd5e1 100%) !important;
  min-height: 100vh !important;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow-x: hidden !important;
`;

if (profilePage) {
  profilePage.style.cssText = `
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #e2e8f0 75%, #cbd5e1 100%) !important;
    min-height: 100vh !important;
    padding-top: 64px !important;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    position: relative !important;
    z-index: 1 !important;
    width: 100% !important;
    margin: 0 !important;
    overflow-x: hidden !important;
  `;
}

// Apply to profile hero
const profileHero = document.querySelector('.profile-hero');
if (profileHero) {
  profileHero.style.cssText = `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    color: white !important;
    padding: 40px 30px !important;
    border-radius: 20px !important;
    margin-bottom: 30px !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    position: relative !important;
    z-index: 3 !important;
  `;
}

// Apply to profile cards
const profileCards = document.querySelectorAll('.profile-card');
profileCards.forEach(card => {
  card.style.cssText = `
    background: white !important;
    border-radius: 20px !important;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
    margin-bottom: 30px !important;
    overflow: hidden !important;
    position: relative !important;
    z-index: 3 !important;
  `;
});

console.log('✅ EMERGENCY STYLES APPLIED! Check if the page looks correct now.');
console.log('📝 If it looks correct after running this script, the issue is with CSS loading/specificity.');
console.log('🔄 Try refreshing the page and running this script again.');

// Environment detection
console.log('🌍 Environment info:', {
  userAgent: navigator.userAgent,
  viewport: `${window.innerWidth}x${window.innerHeight}`,
  hostname: window.location.hostname,
  protocol: window.location.protocol
});
