import axios, { AxiosInstance } from 'axios';
import { secrets } from './secrets';
import toast from 'react-hot-toast';

const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
const legacyBackendEndpoint = (import.meta.env.VITE_BACKEND_ENDPOINT || '').trim();

// Production deployments serve the React app and Laravel API from the same host.
// Only an explicit API base URL may override that behavior.
export const apiBaseUrl = (
  configuredApiBaseUrl ||
  (import.meta.env.DEV
    ? legacyBackendEndpoint || 'http://localhost:8000'
    : '')
).replace(/\/$/, '');

console.log('🌐 API Base URL:', apiBaseUrl);

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${apiBaseUrl}${path}`;

  const headers = new Headers(options.headers);

  headers.set('Accept', 'application/json');
  headers.set('ngrok-skip-browser-warning', 'true');

  const token = localStorage.getItem('token');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  console.log('➡️ API REQUEST:', {
    url,
    method: options.method || 'GET',
    body: options.body,
  });

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));

  console.log('⬅️ API RESPONSE:', {
    url,
    status: response.status,
    ok: response.ok,
    payload,
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  if (!response.ok) {
    throw new Error(
      payload.message ||
      payload.error ||
      `Request failed with status ${response.status}`
    );
  }

  return payload as T;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: secrets.backendEndpoint,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getSession() {
    try {
      const response = await this.client.get('/api/session');
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createSession(
    name: string,
    duration: number,
    username: string,
    password: string
  ) {
    try {
      if (!username || !password) {
        toast.error('Credentials are required');
        return;
      }

      const response = await this.client.post('/api/session', {
        name,
        duration,
        username,
        password,
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateSession(
    session_id: number,
    active: boolean,
    username: string,
    password: string
  ) {
    try {
      if (!username || !password) {
        toast.error('Credentials are required');
        return;
      }

      const response = await this.client.put('/api/session', {
        session_id,
        active,
        username,
        password,
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async submitAttendance(roll: number) {
    try {
      const response = await this.client.post('/api/attendance', {
        roll,
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async viewSessions(username: string, password: string) {
    try {
      if (!username || !password) {
        toast.error('Credentials are required');
        return;
      }

      const response = await this.client.post('/api/sessions', {
        username,
        password,
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  handleError(error: any) {
    if (error.response) {
      console.error(
        `API Error: ${error.response.status} - ${error.response.data.message}`
      );
    } else if (error.request) {
      console.error(
        'API Error: No response received',
        error.request
      );
    } else {
      console.error(
        'API Error:',
        error.message
      );
    }

    toast.error(
      error.message || 'Something went wrong'
    );
  }
}

export default ApiClient;
