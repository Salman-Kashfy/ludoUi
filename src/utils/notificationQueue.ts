/**
 * Notification Queue System
 * Manages multiple notifications with proper queuing and display logic
 */

export interface QueuedNotification {
  id: string;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  timestamp: number;
}

interface NotificationQueueListener {
  (notifications: QueuedNotification[]): void;
}

class NotificationQueueManager {
  private queue: QueuedNotification[] = [];
  private listeners: Set<NotificationQueueListener> = new Set();
  private currentNotificationId: string | null = null;
  private readonly DEFAULT_DURATION = 3000;

  /**
   * Add notification to queue
   */
  enqueue(message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info', duration?: number) {
    const id = this.generateId();
    const notification: QueuedNotification = {
      id,
      message,
      severity,
      duration: duration || this.DEFAULT_DURATION,
      timestamp: Date.now()
    };

    this.queue.push(notification);
    console.log(`[NotifQueue] ✅ Enqueued: ${severity} | "${message.substring(0, 50)}"... (Queue size: ${this.queue.length})`);
    
    this.notifyListeners();
    this.processQueue();

    return id;
  }

  /**
   * Remove notification from queue
   */
  dequeue(id: string) {
    const index = this.queue.findIndex(n => n.id === id);
    if (index !== -1) {
      this.queue.splice(index, 1);
      console.log(`[NotifQueue] ❌ Dequeued: ${id} (Queue size: ${this.queue.length})`);
      
      if (this.currentNotificationId === id) {
        this.currentNotificationId = null;
      }
      
      this.notifyListeners();
      this.processQueue();
    }
  }

  /**
   * Process queue - show next notification when current one expires
   */
  private processQueue() {
    if (this.currentNotificationId && this.queue.some(n => n.id === this.currentNotificationId)) {
      return; // Already showing something
    }

    if (this.queue.length === 0) {
      this.currentNotificationId = null;
      console.log('[NotifQueue] ⏸️  Queue empty, waiting for new notifications');
      return;
    }

    const notification = this.queue[0];
    this.currentNotificationId = notification.id;
    
    console.log(`[NotifQueue] 📢 Showing: ${notification.severity} | "${notification.message.substring(0, 50)}"...`);

    // Auto-remove notification after duration
    if (notification.duration) {
      setTimeout(() => {
        this.dequeue(notification.id);
      }, notification.duration);
    }
  }

  /**
   * Get current queue state
   */
  getQueue(): QueuedNotification[] {
    return [...this.queue];
  }

  /**
   * Get current showing notification
   */
  getCurrentNotification(): QueuedNotification | null {
    if (this.currentNotificationId) {
      return this.queue.find(n => n.id === this.currentNotificationId) || null;
    }
    return null;
  }

  /**
   * Subscribe to queue changes
   */
  subscribe(listener: NotificationQueueListener): () => void {
    this.listeners.add(listener);
    // Send initial state
    listener(this.getQueue());
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Clear entire queue
   */
  clear() {
    const count = this.queue.length;
    this.queue = [];
    this.currentNotificationId = null;
    console.log(`[NotifQueue] 🗑️  Cleared ${count} notifications`);
    this.notifyListeners();
  }

  /**
   * Get queue statistics
   */
  getStats() {
    return {
      total: this.queue.length,
      pending: this.queue.length - (this.currentNotificationId ? 1 : 0),
      current: this.currentNotificationId,
      oldestAge: this.queue.length > 0 ? Date.now() - this.queue[0].timestamp : 0
    };
  }

  /**
   * Notify all listeners of queue changes
   */
  private notifyListeners() {
    const queueData = this.getQueue();
    this.listeners.forEach(listener => {
      try {
        listener(queueData);
      } catch (err) {
        console.error('[NotifQueue] Error in listener:', err);
      }
    });
  }

  /**
   * Generate unique ID for notification
   */
  private generateId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const notificationQueue = new NotificationQueueManager();

// For debugging in console
if (typeof window !== 'undefined') {
  (window as any).NotificationQueue = {
    enqueue: (msg: string, severity?: string) => notificationQueue.enqueue(msg, severity as any),
    dequeue: (id: string) => notificationQueue.dequeue(id),
    getQueue: () => notificationQueue.getQueue(),
    getCurrent: () => notificationQueue.getCurrentNotification(),
    getStats: () => notificationQueue.getStats(),
    clear: () => notificationQueue.clear(),
    help: () => {
      console.log('NotificationQueue API:');
      console.log('  enqueue(msg, severity?, duration?) - Add notification');
      console.log('  dequeue(id) - Remove notification');
      console.log('  getQueue() - Get all notifications');
      console.log('  getCurrent() - Get currently showing notification');
      console.log('  getStats() - Get queue statistics');
      console.log('  clear() - Clear all notifications');
    }
  };
}
