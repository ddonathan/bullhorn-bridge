/**
 * Bullhorn Bridge Client
 * Universal JavaScript client for Bullhorn ATS iframe integrations
 * Works with any JavaScript framework (React, Vue, Angular, Vanilla JS, etc.)
 */

export interface BullhornConfig {
  title?: string;
  color?: string;
  url?: string;
}

export interface BullhornCredentials {
  corporationId?: string;
  privateLabelId?: string;
  userId?: string;
  restUrl?: string;
  restToken?: string;
}

export interface HttpResponse<T = any> {
  data?: T;
  error?: string | null;
}

export interface BullhornBridgeConfig {
  debug?: boolean;
  onReady?: () => void;
  onError?: (error: Error) => void;
  allowedOrigins?: string[];
}

export interface OpenParams {
  entityType?: string;
  entityId?: number | string;
  view?: string;
  [key: string]: any;
}

export interface OpenListParams {
  entityType?: string;
  view?: string;
  query?: string;
  [key: string]: any;
}

export type EventType = 'ready' | 'error' | 'customEvent' | 'update';

export interface NoteData {
  personReference?: {
    id: number;
  };
  comments: string;
  action?: string;
  [key: string]: any;
}

export class BullhornBridge {
  private postRobot: typeof import('post-robot') | null = null;
  private isRegistered: boolean = false;
  private registrationPromise: Promise<void> | null = null;
  private registrationAttempts: number = 0;
  private maxRegistrationAttempts: number = 4;
  private waitTime: number = 500;
  private credentials: BullhornCredentials = {};
  private debug: boolean = false;
  private onReadyCallback?: () => void;
  private onErrorCallback?: (error: Error) => void;
  private eventListeners: Map<string, Function[]> = new Map();
  private allowedOrigins: string[] = [];
  private readonly MAX_PARAM_LENGTH = 500;
  private readonly MAX_URL_LENGTH = 2000;

  constructor(config?: BullhornBridgeConfig) {
    // Lazy load post-robot when needed
    this.initializePostRobot();
    
    this.debug = config?.debug || false;
    this.onReadyCallback = config?.onReady;
    this.onErrorCallback = config?.onError;
    this.allowedOrigins = config?.allowedOrigins || [
      'https://*.bullhornstaffing.com',
      'https://*.bullhorn.com'
    ];
    
    this.log('BullhornBridge initialized');
    
    // Auto-extract credentials from URL if in iframe
    if (this.isInIframe()) {
      this.extractCredentialsFromUrl();
    }
  }

  /**
   * Initialize post-robot library
   */
  private async initializePostRobot(): Promise<void> {
    if (this.postRobot || typeof window === 'undefined') return;
    
    try {
      const postRobotModule = await import('post-robot');
      this.postRobot = postRobotModule;
      if (this.postRobot) {
        this.postRobot.CONFIG.LOG_LEVEL = this.debug ? 'info' : 'error';
      }
    } catch (error) {
      this.log('Failed to load post-robot:', error);
      throw new Error('Failed to initialize communication library');
    }
  }

  /**
   * Check if running in an iframe
   */
  isInIframe(): boolean {
    try {
      return typeof window !== 'undefined' && window.parent !== window;
    } catch (e) {
      return false;
    }
  }

  /**
   * Validate and sanitize a parameter value
   */
  private validateParam(value: string | null, maxLength: number = this.MAX_PARAM_LENGTH): string | undefined {
    if (!value) return undefined;
    
    // Limit length
    if (value.length > maxLength) {
      this.log('Parameter exceeds maximum length');
      return undefined;
    }
    
    // Basic XSS prevention - remove dangerous characters
    return value.replace(/[<>"'&]/g, '');
  }

  /**
   * Validate URL parameter
   */
  private validateUrl(url: string | null): string | undefined {
    if (!url) return undefined;
    
    try {
      const parsedUrl = new URL(url);
      // Only allow HTTPS URLs
      if (parsedUrl.protocol !== 'https:') {
        this.log('Only HTTPS URLs are allowed');
        return undefined;
      }
      return url;
    } catch {
      this.log('Invalid URL format');
      return undefined;
    }
  }

  /**
   * Validate token format
   */
  private validateToken(token: string | null): string | undefined {
    if (!token) return undefined;
    
    // Basic token format validation - alphanumeric with some special chars
    if (!/^[A-Za-z0-9\-_.~]+$/.test(token) || token.length > this.MAX_PARAM_LENGTH) {
      this.log('Invalid token format');
      return undefined;
    }
    
    return token;
  }

  /**
   * Extract Bullhorn credentials from URL parameters
   */
  private extractCredentialsFromUrl(): void {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    
    this.credentials = {
      corporationId: this.validateParam(urlParams.get('corporationId') || urlParams.get('corp')),
      privateLabelId: this.validateParam(urlParams.get('privateLabelId') || urlParams.get('plid')),
      userId: this.validateParam(urlParams.get('userId') || urlParams.get('uid')),
      restUrl: this.validateUrl(urlParams.get('restUrl')),
      restToken: this.validateToken(urlParams.get('BhRestToken') || urlParams.get('restToken'))
    };
    
    // Try to extract from hash parameters as well
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    Object.keys(this.credentials).forEach(key => {
      if (!this.credentials[key as keyof BullhornCredentials]) {
        const value = hashParams.get(key) || hashParams.get(key.toLowerCase());
        if (key === 'restUrl') {
          this.credentials[key] = this.validateUrl(value);
        } else if (key === 'restToken') {
          this.credentials[key] = this.validateToken(value);
        } else {
          this.credentials[key as keyof BullhornCredentials] = this.validateParam(value);
        }
      }
    });
    
    this.log('Credentials extracted successfully');
  }

  /**
   * Get extracted credentials
   */
  getCredentials(): BullhornCredentials {
    return { ...this.credentials };
  }

  /**
   * Register with Bullhorn parent frame
   */
  async register(config?: BullhornConfig): Promise<boolean> {
    if (!this.isInIframe()) {
      this.log('Not in iframe, skipping registration');
      return false;
    }

    if (this.isRegistered) {
      this.log('Already registered');
      return true;
    }

    if (this.registrationPromise) {
      await this.registrationPromise;
      return this.isRegistered;
    }

    this.registrationPromise = this.performRegistration(config);
    await this.registrationPromise;
    return this.isRegistered;
  }

  private async performRegistration(config?: BullhornConfig): Promise<void> {
    // Ensure post-robot is loaded
    if (!this.postRobot) {
      await this.initializePostRobot();
    }
    
    if (!this.postRobot) {
      throw new Error('Failed to initialize communication library');
    }

    const registrationConfig = {
      title: config?.title || 'Custom Integration',
      url: config?.url || (typeof window !== 'undefined' ? window.location.href : ''),
      color: config?.color || '#0070c0',
    };

    this.log('Attempting registration with config:', registrationConfig);

    try {
      const response = await this.postRobot.sendToParent('register', registrationConfig, {
        timeout: 5000
      });
      
      this.log('Registration successful', response);
      this.isRegistered = true;
      
      this.setupEventListeners();
      
      if (this.onReadyCallback) {
        this.onReadyCallback();
      }
      
      this.emit('ready');
      
    } catch (error) {
      this.log('Registration failed', error);
      
      if (this.registrationAttempts < this.maxRegistrationAttempts) {
        this.registrationAttempts++;
        this.log(`Retrying registration (attempt ${this.registrationAttempts}/${this.maxRegistrationAttempts})`);
        
        await new Promise(resolve => setTimeout(resolve, this.waitTime));
        await this.performRegistration(config);
      } else {
        const err = new Error('Failed to register with Bullhorn after maximum attempts');
        if (this.onErrorCallback) {
          this.onErrorCallback(err);
        }
        this.emit('error', err);
        throw err;
      }
    }
  }

  /**
   * Validate message origin
   */
  private isAllowedOrigin(origin: string): boolean {
    return this.allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = allowed.replace(/\*/g, '.*');
        return new RegExp(`^${pattern}$`).test(origin);
      }
      return origin === allowed;
    });
  }

  /**
   * Sanitize event data
   */
  private sanitizeEventData(data: any): any {
    if (typeof data === 'string') {
      // Remove potential XSS vectors
      return data.replace(/[<>"']/g, '');
    }
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          sanitized[key] = this.sanitizeEventData(data[key]);
        }
      }
      return sanitized;
    }
    return data;
  }

  /**
   * Setup event listeners for Bullhorn events
   */
  private setupEventListeners(): void {
    if (!this.postRobot) return;

    // Listen for custom events from Bullhorn with origin validation
    this.postRobot.on('customEvent', { 
      window: window.parent,
      domain: this.allowedOrigins 
    }, (event: any) => {
      // Additional origin validation
      if (!this.isAllowedOrigin(event.origin)) {
        this.log('Rejected message from unauthorized origin');
        return Promise.reject(new Error('Unauthorized origin'));
      }
      
      this.log('Received custom event');
      const sanitizedData = this.sanitizeEventData(event.data);
      this.emit('customEvent', sanitizedData);
      return Promise.resolve({ received: true });
    });

    // Listen for update events with origin validation
    this.postRobot.on('update', { 
      window: window.parent,
      domain: this.allowedOrigins 
    }, (event: any) => {
      // Additional origin validation
      if (!this.isAllowedOrigin(event.origin)) {
        this.log('Rejected message from unauthorized origin');
        return Promise.reject(new Error('Unauthorized origin'));
      }
      
      this.log('Received update');
      const sanitizedData = this.sanitizeEventData(event.data);
      this.emit('update', sanitizedData);
      return Promise.resolve({ received: true });
    });

    this.log('Event listeners setup complete');
  }

  /**
   * Add event listener
   */
  on(event: EventType, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * Remove event listener
   */
  off(event: EventType, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event
   */
  private emit(event: EventType, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  /**
   * Validate relative URL for API calls
   */
  private validateRelativeUrl(url: string): boolean {
    // Prevent path traversal
    if (url.includes('..') || url.includes('//')) {
      return false;
    }
    
    // Ensure it starts with /
    if (!url.startsWith('/')) {
      return false;
    }
    
    // Check URL length
    if (url.length > this.MAX_URL_LENGTH) {
      return false;
    }
    
    // Whitelist allowed API endpoints
    const allowedPrefixes = [
      '/entity/',
      '/query/',
      '/search/',
      '/meta/',
      '/services/',
      '/find/'
    ];
    
    return allowedPrefixes.some(prefix => url.startsWith(prefix));
  }

  /**
   * Make a GET request through Bullhorn's parent frame
   */
  async httpGET<T = any>(relativeURL: string): Promise<HttpResponse<T>> {
    await this.ensureRegistered();
    
    if (!this.validateRelativeUrl(relativeURL)) {
      throw new Error('Invalid or unauthorized URL');
    }
    
    this.log(`httpGET ${relativeURL}`);
    
    if (!this.postRobot) {
      throw new Error('Communication library not initialized');
    }
    
    try {
      const response = await this.postRobot.sendToParent('httpGET', {
        relativeURL
      }, {
        timeout: 10000,
        domain: this.allowedOrigins
      });
      
      this.log('httpGET response received');
      return response.data as HttpResponse<T>;
    } catch (error) {
      this.log('httpGET failed');
      throw new Error('Failed to complete GET request');
    }
  }

  /**
   * Make a POST request through Bullhorn's parent frame
   */
  async httpPOST<T = any>(relativeURL: string, data: any): Promise<HttpResponse<T>> {
    await this.ensureRegistered();
    
    if (!this.validateRelativeUrl(relativeURL)) {
      throw new Error('Invalid or unauthorized URL');
    }
    
    // Limit payload size (e.g., 1MB)
    const dataStr = JSON.stringify(data);
    if (dataStr.length > 1024 * 1024) {
      throw new Error('Payload too large');
    }
    
    this.log(`httpPOST ${relativeURL}`);
    
    if (!this.postRobot) {
      throw new Error('Communication library not initialized');
    }
    
    try {
      const response = await this.postRobot.sendToParent('httpPOST', {
        relativeURL,
        data
      }, {
        timeout: 10000,
        domain: this.allowedOrigins
      });
      
      this.log('httpPOST response received');
      return response.data as HttpResponse<T>;
    } catch (error) {
      this.log('httpPOST failed');
      throw new Error('Failed to complete POST request');
    }
  }

  /**
   * Make a PUT request through Bullhorn's parent frame
   */
  async httpPUT<T = any>(relativeURL: string, data: any): Promise<HttpResponse<T>> {
    await this.ensureRegistered();
    
    if (!this.validateRelativeUrl(relativeURL)) {
      throw new Error('Invalid or unauthorized URL');
    }
    
    // Limit payload size (e.g., 1MB)
    const dataStr = JSON.stringify(data);
    if (dataStr.length > 1024 * 1024) {
      throw new Error('Payload too large');
    }
    
    this.log(`httpPUT ${relativeURL}`);
    
    if (!this.postRobot) {
      throw new Error('Communication library not initialized');
    }
    
    try {
      const response = await this.postRobot.sendToParent('httpPUT', {
        relativeURL,
        data
      }, {
        timeout: 10000,
        domain: this.allowedOrigins
      });
      
      this.log('httpPUT response received');
      return response.data as HttpResponse<T>;
    } catch (error) {
      this.log('httpPUT failed');
      throw new Error('Failed to complete PUT request');
    }
  }

  /**
   * Make a DELETE request through Bullhorn's parent frame
   */
  async httpDELETE<T = any>(relativeURL: string): Promise<HttpResponse<T>> {
    await this.ensureRegistered();
    
    if (!this.validateRelativeUrl(relativeURL)) {
      throw new Error('Invalid or unauthorized URL');
    }
    
    this.log(`httpDELETE ${relativeURL}`);
    
    if (!this.postRobot) {
      throw new Error('Communication library not initialized');
    }
    
    try {
      const response = await this.postRobot.sendToParent('httpDELETE', {
        relativeURL
      }, {
        timeout: 10000,
        domain: this.allowedOrigins
      });
      
      this.log('httpDELETE response received');
      return response.data as HttpResponse<T>;
    } catch (error) {
      this.log('httpDELETE failed');
      throw new Error('Failed to complete DELETE request');
    }
  }

  /**
   * Open a Bullhorn window/modal
   */
  async open(params: OpenParams): Promise<any> {
    await this.ensureRegistered();
    
    this.log('open', params);
    
    if (!this.postRobot) {
      throw new Error('Communication library not initialized');
    }
    
    try {
      const response = await this.postRobot.sendToParent('open', params, {
        timeout: 10000
      });
      
      this.log('open response', response);
      return response.data;
    } catch (error) {
      this.log('open failed', error);
      throw error;
    }
  }

  /**
   * Open a Bullhorn list view
   */
  async openList(params: OpenListParams): Promise<any> {
    await this.ensureRegistered();
    
    this.log('openList', params);
    
    if (!this.postRobot) {
      throw new Error('Communication library not initialized');
    }
    
    try {
      const response = await this.postRobot.sendToParent('openList', params, {
        timeout: 10000
      });
      
      this.log('openList response', response);
      return response.data;
    } catch (error) {
      this.log('openList failed', error);
      throw error;
    }
  }

  /**
   * Refresh the parent Bullhorn view
   */
  async refresh(): Promise<any> {
    await this.ensureRegistered();
    
    this.log('refresh');
    
    if (!this.postRobot) {
      throw new Error('Communication library not initialized');
    }
    
    try {
      const response = await this.postRobot.sendToParent('refresh', {}, {
        timeout: 5000
      });
      
      this.log('refresh response', response);
      return response.data;
    } catch (error) {
      this.log('refresh failed', error);
      throw error;
    }
  }

  /**
   * Check if bridge is ready
   */
  isReady(): boolean {
    return this.isRegistered;
  }

  /**
   * Ensure we're registered before making API calls
   */
  private async ensureRegistered(): Promise<void> {
    if (!this.isInIframe()) {
      throw new Error('Not running in an iframe');
    }
    
    if (!this.isRegistered) {
      await this.register();
    }
    
    if (!this.isRegistered) {
      throw new Error('Failed to register with Bullhorn');
    }
  }

  /**
   * Helper method to get a candidate by ID
   */
  async getCandidate(id: number, fields: string[] = ['id', 'firstName', 'lastName', 'email']): Promise<any> {
    const fieldsParam = fields.join(',');
    const response = await this.httpGET(`/entity/Candidate/${id}?fields=${fieldsParam}`);
    return response.data;
  }

  /**
   * Helper method to search candidates
   */
  async searchCandidates(query: string, fields: string[] = ['id', 'firstName', 'lastName']): Promise<any> {
    const fieldsParam = fields.join(',');
    const response = await this.httpGET(`/search/Candidate?query=${encodeURIComponent(query)}&fields=${fieldsParam}`);
    return response.data;
  }

  /**
   * Helper method to get job orders
   */
  async getJobOrders(fields: string[] = ['id', 'title', 'status']): Promise<any> {
    const fieldsParam = fields.join(',');
    const response = await this.httpGET(`/query/JobOrder?fields=${fieldsParam}`);
    return response.data;
  }

  /**
   * Helper method to update a candidate
   */
  async updateCandidate(id: number, data: any): Promise<any> {
    const response = await this.httpPOST(`/entity/Candidate/${id}`, data);
    return response.data;
  }

  /**
   * Helper method to create a note
   */
  async createNote(entityType: string, entityId: number, comments: string, action?: string): Promise<any> {
    const response = await this.httpPUT('/entity/Note', {
      personReference: {
        id: entityId
      },
      comments,
      action: action || 'General'
    });
    return response.data;
  }

  /**
   * Private logging method
   */
  private log(...args: any[]): void {
    if (this.debug) {
      console.log('[BullhornBridge]', ...args);
    }
  }
}

// Export a default instance for convenience
let defaultInstance: BullhornBridge | null = null;

export function getBullhornBridge(config?: BullhornBridgeConfig): BullhornBridge {
  if (!defaultInstance) {
    defaultInstance = new BullhornBridge(config);
  }
  return defaultInstance;
}

// Export everything for maximum flexibility
export default BullhornBridge;