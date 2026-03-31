# Notification Queue System - Implementation & Debugging Guide

## 📋 Overview

Your project now has a **proper notification queue system** that handles multiple notifications efficiently without losing any messages.

### What Was Fixed

| Issue | Before | After |
|-------|--------|-------|
| **Multiple notifications** | Lost/overwritten | Queued and displayed sequentially |
| **Rapid notifications** | Only last one shown | All shown in order |
| **Display duration** | Fixed 2000ms | Configurable per notification |
| **Notification types** | success/error only | success/error/warning/info |
| **Debug capability** | No visibility | Full queue monitoring |

---

## 🔄 How the Queue Works

```
Notification comes in
    ↓
Added to queue
    ↓
Display current notification (if none showing)
    ↓
Wait for duration
    ↓
Remove notification
    ↓
Show next in queue
    ↓
Repeat until queue empty
```

---

## 📚 Usage Examples

### 1. In React Components

```typescript
import { useToast } from '@/utils/toast';

export function MyComponent() {
  const { successToast, errorToast, warningToast, infoToast } = useToast();

  const handleAction = async () => {
    // Show success toast (3000ms default)
    successToast('Operation completed!');

    // Show error with custom duration
    errorToast('Something went wrong', 4000);

    // Show warning
    warningToast('Please review before proceeding', 3500);

    // Show info
    infoToast('New message available', 3000);
  };

  return <button onClick={handleAction}>Try it</button>;
}
```

### 2. In API Services

```typescript
// api.service.ts
import { notificationQueue } from '@/utils/notificationQueue';

export const userService = {
  async saveUser(user: User) {
    try {
      const response = await api.post('/users', user);
      notificationQueue.enqueue('User saved successfully', 'success', 3000);
      return response;
    } catch (error) {
      notificationQueue.enqueue(`Error: ${error.message}`, 'error', 4000);
      throw error;
    }
  }
};
```

### 3. Multiple Rapid Notifications

```typescript
async function bulkOperation() {
  const { successToast } = useToast();

  for (let i = 0; i < 5; i++) {
    await saveItem(i);
    successToast(`Item ${i} saved`); // All will queue properly!
  }
}
```

---

## 🔍 Debugging in Browser Console

The notification queue exposes a global `NotificationQueue` object for debugging:

### Check Current Queue

```javascript
// View all queued notifications
NotificationQueue.getQueue()

// View currently displayed notification
NotificationQueue.getCurrent()

// View statistics
NotificationQueue.getStats()
```

**Output example:**
```
{
  total: 3,
  pending: 2,
  current: "notif-123456-abc123",
  oldestAge: 2500  // ms old
}
```

### Test Queue Manually

```javascript
// Add test notifications
NotificationQueue.enqueue('Success message', 'success');
NotificationQueue.enqueue('Error occurred', 'error', 5000);
NotificationQueue.enqueue('Warning incoming', 'warning');
NotificationQueue.enqueue('Info update', 'info', 2000);

// Clear all
NotificationQueue.clear();

// View help
NotificationQueue.help();
```

---

## 🔧 Configuration

### Default Durations

Each severity level has a default duration:

```typescript
successToast(msg)      // 3000ms (3 sec)
errorToast(msg)        // 4000ms (4 sec)
warningToast(msg)      // 3500ms (3.5 sec)
infoToast(msg)         // 3000ms (3 sec)
```

### Custom Duration

```typescript
const { successToast } = useToast();

// Show for 2 seconds instead of default
successToast('Quick notification', 2000);

// Show for 10 seconds
errorToast('Important error', 10000);
```

---

## 🔌 FCM Integration

### Using Enhanced Message Handler

```typescript
// In your App.tsx or main.tsx
import { listenForMessagesWithQueue } from '@/config/firebase.service';

// Initialize with queue support
const messaging = await initializeFirebase();
listenForMessagesWithQueue((message) => {
  console.log('Message received:', message);
  // Your custom handling
});
```

### How FCM Messages Get Queued

When FCM sends a message:

```json
{
  "notification": {
    "title": "Order Confirmed",
    "body": "Your order #123 is confirmed"
  },
  "data": {
    "type": "success",
    "duration": "3000"
  }
}
```

Results in:
1. Toast notification queued
2. Native browser notification shown
3. Proper spacing maintained between messages

---

## 📊 Queue Logs

Watch console for queue activity:

```
[NotifQueue] ✅ Enqueued: success | "User saved successfully"... (Queue size: 1)
[NotifQueue] 📢 Showing: success | "User saved successfully"...
[NotifQueue] ❌ Dequeued: notif-123456-abc (Queue size: 0)
[NotifQueue] ⏸️  Queue empty, waiting for new notifications
```

---

## 🐛 Troubleshooting

### Issue: Notifications not showing

1. Check if ToastProvider wraps your app (in App.tsx)
2. Verify useToast() is called within ToastProvider
3. Check browser console for errors
4. Run: `NotificationQueue.getStats()`

### Issue: FCM notifications not appearing

1. Ensure listenForMessagesWithQueue() is called
2. Check Service Worker is registered: `console.log(await navigator.serviceWorker.getRegistrations())`
3. Verify FCM token is set: `localStorage.getItem('LRCL_FCM_TOKEN')`
4. Check Firebase config is loaded: `window.firebaseConfig`

### Issue: Too many notifications at once

Notifications are automatically queued, but if you want to:
- **Clear all**: `notificationQueue.clear()`
- **Remove specific**: `notificationQueue.dequeue(id)`
- **Limit by type**: Use `maxNotifications` in queue (can be added)

---

## 🚀 Performance Improvements

- ✅ No lost notifications
- ✅ Proper async queuing
- ✅ Configurable display duration
- ✅ Memory efficient (notifications auto-remove)
- ✅ Console debugging for monitoring
- ✅ Type-safe TypeScript

---

## 📝 Implementation Checklist

- [x] Created `notificationQueue.ts` - Core queue system
- [x] Updated `toast.tsx` - Uses queue provider
- [x] Updated `AppToast.tsx` - Supports all severity types
- [x] Enhanced `firebase.service.ts` - Queue-aware FCM handler
- [x] Global queue API for debugging
- [x] Proper TypeScript types
- [x] Logging with emoji indicators

---

## 🔄 Next Steps (Optional Enhancements)

If needed later, you can add:

1. **Persistent notification history** - Store in localStorage
2. **Notification grouping** - Combine similar notifications
3. **Priority queue** - Errors show before warnings
4. **Toast position variants** - Top/bottom/left/right
5. **Sound/haptic feedback** - On notification show
6. **Undo functionality** - For certain notification types

---

**Status:** ✅ Notification queue system fully implemented and ready to use!
