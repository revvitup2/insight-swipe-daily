// Global server status manager
type ServerStatusListener = (isDown: boolean) => void;

class ServerStatusManager {
  private isServerDown: boolean = false;
  private listeners: Set<ServerStatusListener> = new Set();
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  constructor() {
    // Auto-check every 30 seconds if server is down
    this.startAutoCheck();
  }

  private startAutoCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      if (this.isServerDown) {
        this.checkServerHealth();
      }
    }, 30000); // Check every 30 seconds
  }

  private async checkServerHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.API_BASE_URL}/health`, {
        signal: controller.signal,
        method: 'GET',
      }).catch(() => null);

      clearTimeout(timeoutId);

      if (response && response.ok) {
        // Server is back up
        this.setServerStatus(false);
      }
    } catch (error) {
      // Still down, do nothing
      console.log('Server health check failed:', error);
    }
  }

  public setServerStatus(isDown: boolean) {
    if (this.isServerDown !== isDown) {
      this.isServerDown = isDown;
      this.notifyListeners();

      if (isDown) {
        console.warn('🔴 Server is down - Maintenance mode activated');
      } else {
        console.log('✅ Server is back online');
      }
    }
  }

  public getServerStatus(): boolean {
    return this.isServerDown;
  }

  public subscribe(listener: ServerStatusListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.isServerDown));
  }

  public async retryConnection() {
    await this.checkServerHealth();
  }

  public destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    this.listeners.clear();
  }
}

// Export singleton instance
export const serverStatusManager = new ServerStatusManager();

// Enhanced fetch wrapper that handles 502 errors
export const fetchWithErrorHandling = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  try {
    const response = await fetch(input, init);

    // Check for server error status codes
    if (response.status === 502 || response.status === 503 || response.status === 504) {
      serverStatusManager.setServerStatus(true);
      throw new Error(`Server error: ${response.status}`);
    }

    // Check for network errors or bad responses
    if (!response.ok && response.status >= 500) {
      serverStatusManager.setServerStatus(true);
      throw new Error(`Server error: ${response.status}`);
    }

    // If we got a successful response and server was marked as down, mark it as up
    if (response.ok && serverStatusManager.getServerStatus()) {
      serverStatusManager.setServerStatus(false);
    }

    return response;
  } catch (error: any) {
    // Handle network errors (server unreachable)
    if (error.message.includes('Failed to fetch') || 
        error.message.includes('NetworkError') ||
        error.message.includes('Network request failed')) {
      serverStatusManager.setServerStatus(true);
    }
    throw error;
  }
};

