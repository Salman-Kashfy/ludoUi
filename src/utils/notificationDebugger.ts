/**
 * Notification Debugger
 * 
 * Use in browser console to debug FCM and notification setup
 * Just copy-paste the code below in browser console
 */

// ============================================
// FRONTEND DEBUGGER
// ============================================

const NotificationDebugger = {
  /**
   * Check overall notification setup
   */
  fullCheck: () => {
    console.clear();
    console.log('%c🔔 NOTIFICATION SYSTEM DEBUG', 'font-size: 16px; font-weight: bold; color: #2196F3;');
    console.log('');
    
    NotificationDebugger.checkBrowserSupport();
    console.log('');
    NotificationDebugger.checkSecurityContext();
    console.log('');
    NotificationDebugger.checkNotificationPermission();
    console.log('');
    NotificationDebugger.checkTokens();
    console.log('');
    NotificationDebugger.checkServiceWorker();
    console.log('');
    NotificationDebugger.checkLocalStorage();
  },

  /**
   * Check if browser supports notifications
   */
  checkBrowserSupport: () => {
    console.log('%c1️⃣  BROWSER SUPPORT', 'font-weight: bold; color: #1976D2;');
    const checks = {
      'Notification API': 'Notification' in window ? '✅' : '❌',
      'Service Worker': 'serviceWorker' in navigator ? '✅' : '❌',
      'Promise Support': typeof Promise !== 'undefined' ? '✅' : '❌',
      'IndexedDB': 'indexedDB' in window ? '✅' : '❌'
    };
    Object.entries(checks).forEach(([name, status]) => {
      console.log(`  ${status} ${name}`);
    });
  },

  /**
   * Check security context (HTTPS/localhost)
   */
  checkSecurityContext: () => {
    console.log('%c2️⃣  SECURITY CONTEXT', 'font-weight: bold; color: #1976D2;');
    const isSecure = window.isSecureContext;
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    
    console.log(`  ${isSecure ? '✅' : '❌'} Secure Context: ${isSecure}`);
    console.log(`  Protocol: ${protocol}//`);
    console.log(`  Host: ${host}`);
    
    if (!isSecure) {
      console.warn('  ⚠️  HTTPS or localhost:* required!');
    }
  },

  /**
   * Check notification permission status
   */
  checkNotificationPermission: () => {
    console.log('%c3️⃣  NOTIFICATION PERMISSION', 'font-weight: bold; color: #1976D2;');
    const permission = (window as any).Notification?.permission || 'unknown';
    
    const statusEmoji = {
      'granted': '✅',
      'denied': '❌',
      'default': '❓'
    };
    
    console.log(`  ${statusEmoji[permission as keyof typeof statusEmoji] || '❌'} Permission: ${permission}`);
    
    if (permission === 'denied') {
      console.warn('  ⚠️  You blocked notifications. Reset in browser settings.');
    } else if (permission === 'default') {
      console.log('  ℹ️  Browser will ask on first request.');
    }
  },

  /**
   * Check if tokens are stored
   */
  checkTokens: () => {
    console.log('%c4️⃣  TOKENS IN STORAGE', 'font-weight: bold; color: #1976D2;');
    
    const fcmToken = localStorage.getItem('LRCL_FCM_TOKEN');
    const deviceToken = localStorage.getItem('LRCL_DEVICE_TOKEN');
    
    console.log(`  ${fcmToken ? '✅' : '❌'} FCM Token: ${fcmToken ? fcmToken.substring(0, 30) + '...' : 'NOT FOUND'}`);
    console.log(`  ${deviceToken ? '✅' : '❌'} Device Token: ${deviceToken ? deviceToken.substring(0, 30) + '...' : 'NOT FOUND'}`);
    
    if (!fcmToken) {
      console.warn('  ⚠️  No FCM token. Register or grant notification permission.');
    }
  },

  /**
   * Check service workers
   */
  checkServiceWorker: async () => {
    console.log('%c5️⃣  SERVICE WORKERS', 'font-weight: bold; color: #1976D2;');
    
    if (!('serviceWorker' in navigator)) {
      console.warn('  ❌ Service Workers not supported');
      return;
    }
    
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      if (registrations.length === 0) {
        console.warn('  ❌ No service workers registered');
      } else {
        registrations.forEach((reg, idx) => {
          const scope = reg.scope;
          const active = reg.active ? '✅ Active' : '❌ Inactive';
          console.log(`  ${active} - ${scope}`);
        });
      }
    } catch (err) {
      console.error('  ❌ Error checking service workers:', err);
    }
  },

  /**
   * Check localStorage contents
   */
  checkLocalStorage: () => {
    console.log('%c6️⃣  LOCALSTORAGE', 'font-weight: bold; color: #1976D2;');
    const keys = Object.keys(localStorage);
    const relevantKeys = keys.filter(k => k.includes('FCM') || k.includes('DEVICE') || k.includes('TOKEN'));
    
    if (relevantKeys.length === 0) {
      console.warn('  ❌ No notification-related keys found');
    } else {
      relevantKeys.forEach(key => {
        const value = localStorage.getItem(key);
        const displayValue = value ? value.substring(0, 40) + (value.length > 40 ? '...' : '') : '(empty)';
        console.log(`  📍 ${key}: ${displayValue}`);
      });
    }
  },

  /**
   * Get summary status
   */
  summary: () => {
    console.clear();
    const checks = {
      'Browser Support': 'Notification' in window && 'serviceWorker' in navigator,
      'Secure Context': window.isSecureContext,
      'Permission Granted': (window as any).Notification?.permission === 'granted',
      'FCM Token Present': !!localStorage.getItem('LRCL_FCM_TOKEN'),
      'Device Token Present': !!localStorage.getItem('LRCL_DEVICE_TOKEN')
    };

    const allPassed = Object.values(checks).every(v => v === true);
    
    console.log(`%c${allPassed ? '✅ READY FOR NOTIFICATIONS' : '⚠️  ISSUES FOUND'}`, 
      `font-size: 14px; font-weight: bold; color: ${allPassed ? '#4CAF50' : '#FF9800'};`);
    
    console.table(checks);
  }
};

// Run full check
NotificationDebugger.fullCheck();

// Also show summary
NotificationDebugger.summary();

console.log('');
console.log('%cAvailable commands:', 'font-weight: bold; color: #666;');
console.log('  NotificationDebugger.fullCheck()  - Full diagnostic');
console.log('  NotificationDebugger.summary()     - Quick summary');
console.log('  NotificationDebugger.checkBrowserSupport() - Browser only');
console.log('  NotificationDebugger.checkTokens() - Check stored tokens');
