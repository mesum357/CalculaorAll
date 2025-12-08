const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Debug: Log API configuration on module load
if (typeof window !== 'undefined') {
  console.log('[API Config] API_BASE_URL:', API_BASE_URL);
  console.log('[API Config] NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  console.log('[API Config] NODE_ENV:', process.env.NODE_ENV);
}

export interface Calculator {
  id: number;
  name: string;
  slug: string;
  description?: string;
  subtitle?: string;
  category_id: number;
  subcategory_id: number;
  category_name: string;
  category_slug: string;
  subcategory_name: string;
  subcategory_slug: string;
  most_used: boolean;
  popular?: boolean;
  is_active: boolean;
  likes: number;
  inputs?: any[];
  results?: any[];
  tags?: string[];
}

export const api = {
  calculators: {
    getAll: async (params?: { category_id?: number; subcategory_id?: number; is_active?: boolean; most_used?: boolean; popular?: boolean }): Promise<Calculator[]> => {
      const queryParams = new URLSearchParams();
      if (params?.category_id) queryParams.append('category_id', params.category_id.toString());
      if (params?.subcategory_id) queryParams.append('subcategory_id', params.subcategory_id.toString());
      if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
      if (params?.most_used !== undefined) queryParams.append('most_used', params.most_used.toString());
      if (params?.popular !== undefined) queryParams.append('popular', params.popular.toString());
      
      const url = queryParams.toString() ? `${API_BASE_URL}/calculators?${queryParams.toString()}` : `${API_BASE_URL}/calculators`;
      
      console.log('[API] Fetching calculators:', {
        url,
        params,
        timestamp: new Date().toISOString()
      });
      
      try {
        const response = await fetch(url, { credentials: 'include' });
        
        console.log('[API] Calculators response:', {
          url,
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[API] Calculators error response:', {
            url,
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          throw new Error(`Failed to fetch calculators: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('[API] Calculators success:', {
          url,
          count: Array.isArray(data) ? data.length : 'not an array',
          data: Array.isArray(data) ? data.slice(0, 3).map(c => ({ id: c.id, name: c.name })) : data
        });
        
        return data;
      } catch (error) {
        console.error('[API] Calculators fetch error:', {
          url,
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
      }
    },
    getById: async (id: number): Promise<Calculator> => {
      const response = await fetch(`${API_BASE_URL}/calculators/${id}`);
      if (!response.ok) throw new Error('Failed to fetch calculator');
      return response.json();
    },
    getBySlug: async (slug: string, categoryId?: number, subcategoryId?: number): Promise<Calculator> => {
      const queryParams = new URLSearchParams();
      if (categoryId) queryParams.append('category_id', categoryId.toString());
      if (subcategoryId) queryParams.append('subcategory_id', subcategoryId.toString());
      
      const url = queryParams.toString() 
        ? `${API_BASE_URL}/calculators/slug/${slug}?${queryParams.toString()}`
        : `${API_BASE_URL}/calculators/slug/${slug}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch calculator');
      return response.json();
    },
  },
  categories: {
    getAll: async () => {
      const url = `${API_BASE_URL}/categories`;
      
      console.log('[API] Fetching categories:', JSON.stringify({
        url,
        timestamp: new Date().toISOString()
      }, null, 2));
      
      try {
        const response = await fetch(url, { credentials: 'include' });
        
        const responseHeaders = Object.fromEntries(response.headers.entries());
        console.log('[API] Categories response:', JSON.stringify({
          url,
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: responseHeaders
        }, null, 2));
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[API] Categories error response:', {
            url,
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const successData = {
          url,
          count: Array.isArray(data) ? data.length : 'not an array',
          sample: Array.isArray(data) && data.length > 0 ? data.slice(0, 3).map(c => ({ id: c.id, name: c.name, slug: c.slug })) : 'no data'
        };
        console.log('[API] Categories success:', JSON.stringify(successData, null, 2));
        
        return data;
      } catch (error) {
        console.error('[API] Categories fetch error:', {
          url,
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
          cause: error instanceof Error && 'cause' in error ? error.cause : undefined
        });
        throw error;
      }
    },
  },
  subcategories: {
    getAll: async (categoryId?: number) => {
      const url = categoryId ? `${API_BASE_URL}/subcategories?category_id=${categoryId}` : `${API_BASE_URL}/subcategories`;
      
      console.log('[API] Fetching subcategories:', {
        url,
        categoryId,
        timestamp: new Date().toISOString()
      });
      
      try {
        const response = await fetch(url, { credentials: 'include' });
        
        console.log('[API] Subcategories response:', {
          url,
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[API] Subcategories error response:', {
            url,
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          throw new Error(`Failed to fetch subcategories: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('[API] Subcategories success:', {
          url,
          count: Array.isArray(data) ? data.length : 'not an array',
          sample: Array.isArray(data) && data.length > 0 ? data.slice(0, 3).map(s => ({ id: s.id, name: s.name, category_id: s.category_id })) : 'no data'
        });
        
        return data;
      } catch (error) {
        console.error('[API] Subcategories fetch error:', {
          url,
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
      }
    },
  },
  calculatorInteractions: {
    // Likes
    getLikes: async (calculatorId: number) => {
      const response = await fetch(`${API_BASE_URL}/calculator-interactions/likes/${calculatorId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch likes');
      return response.json();
    },
    toggleLike: async (calculatorId: number) => {
      const response = await fetch(`${API_BASE_URL}/calculator-interactions/likes/${calculatorId}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to toggle like');
      return response.json();
    },
    // Ratings
    getRatings: async (calculatorId: number) => {
      const response = await fetch(`${API_BASE_URL}/calculator-interactions/ratings/${calculatorId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch ratings');
      return response.json();
    },
    submitRating: async (calculatorId: number, rating: number) => {
      const response = await fetch(`${API_BASE_URL}/calculator-interactions/ratings/${calculatorId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to submit rating');
      return response.json();
    },
    // Comments
    getComments: async (calculatorId: number, limit?: number, offset?: number) => {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());
      const url = params.toString() 
        ? `${API_BASE_URL}/calculator-interactions/comments/${calculatorId}?${params.toString()}`
        : `${API_BASE_URL}/calculator-interactions/comments/${calculatorId}`;
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch comments');
      return response.json();
    },
    submitComment: async (calculatorId: number, comment: string) => {
      const response = await fetch(`${API_BASE_URL}/calculator-interactions/comments/${calculatorId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to submit comment');
      return response.json();
    },
    // User favorites
    getUserFavorites: async (): Promise<Calculator[]> => {
      const response = await fetch(`${API_BASE_URL}/calculator-interactions/user/favorites`, {
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        throw new Error('Failed to fetch favorites');
      }
      return response.json();
    },
    // Calculator views
    trackView: async (calculatorId: number) => {
      const response = await fetch(`${API_BASE_URL}/calculator-interactions/views/${calculatorId}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          // Silently fail if not authenticated
          return;
        }
        throw new Error('Failed to track view');
      }
      return response.json();
    },
    getRecentlyViewed: async (): Promise<Calculator[]> => {
      const response = await fetch(`${API_BASE_URL}/calculator-interactions/user/recently-viewed`, {
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        throw new Error('Failed to fetch recently viewed');
      }
      return response.json();
    },
  },
  auth: {
    register: async (email: string, password: string, name: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to register');
      }
      return response.json();
    },
    login: async (email: string, password: string) => {
      const url = `${API_BASE_URL}/auth/login`;
      
      console.log('[API] Login request:', {
        url,
        email,
        hasPassword: !!password,
        timestamp: new Date().toISOString()
      });
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include',
        });
        
        console.log('[API] Login response:', {
          url,
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        if (!response.ok) {
          const error = await response.json();
          console.error('[API] Login error response:', {
            url,
            status: response.status,
            error: error.error,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw new Error(error.details || error.error || 'Failed to login');
        }
        
        const data = await response.json();
        console.log('[API] Login success:', {
          url,
          user: data.user,
          message: data.message
        });
        
        return data;
      } catch (error) {
        console.error('[API] Login fetch error:', {
          url,
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
      }
    },
    logout: async () => {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to logout');
      return response.json();
    },
    getSession: async () => {
      const url = `${API_BASE_URL}/auth/session`;
      
      console.log('[API] Get session request:', {
        url,
        timestamp: new Date().toISOString(),
        cookies: document.cookie
      });
      
      try {
        const response = await fetch(url, {
          credentials: 'include',
        });
        
        console.log('[API] Get session response:', {
          url,
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[API] Get session error:', {
            url,
            status: response.status,
            error: errorText
          });
          throw new Error(`Failed to get session: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('[API] Get session success:', {
          url,
          data
        });
        
        return data;
      } catch (error) {
        console.error('[API] Get session fetch error:', {
          url,
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
      }
    },
  },
  translation: {
    translate: async (text: string, targetLanguage: string): Promise<string> => {
      console.log('[API] Translating text:', { text: text.substring(0, 50), targetLanguage });
      const response = await fetch(`${API_BASE_URL}/translation/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLanguage }),
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[API] Translation failed:', { status: response.status, error: errorData });
        throw new Error(errorData.message || errorData.error || 'Failed to translate text');
      }
      const data = await response.json();
      console.log('[API] Translation success:', { original: text.substring(0, 50), translated: data.translation?.substring(0, 50) });
      return data.translation;
    },
    translateBatch: async (texts: string[], targetLanguage: string): Promise<string[]> => {
      console.log('[API] Translating batch:', { count: texts.length, targetLanguage, sample: texts.slice(0, 3) });
      const response = await fetch(`${API_BASE_URL}/translation/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: texts, targetLanguage }),
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[API] Batch translation failed:', { status: response.status, error: errorData });
        throw new Error(errorData.message || errorData.error || 'Failed to translate texts');
      }
      const data = await response.json();
      const result = Array.isArray(data.translation) ? data.translation : [data.translation];
      console.log('[API] Batch translation success:', { count: result.length, targetLanguage });
      return result;
    },
    getLanguages: async () => {
      const response = await fetch(`${API_BASE_URL}/translation/languages`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch languages');
      }
      return response.json();
    },
  },
};

