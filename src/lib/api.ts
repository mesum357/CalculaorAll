const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Calculator {
  id: number;
  name: string;
  slug: string;
  description?: string;
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
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch calculators');
      return response.json();
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
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  },
  subcategories: {
    getAll: async (categoryId?: number) => {
      const url = categoryId ? `${API_BASE_URL}/subcategories?category_id=${categoryId}` : `${API_BASE_URL}/subcategories`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch subcategories');
      return response.json();
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
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to login');
      }
      return response.json();
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
      const response = await fetch(`${API_BASE_URL}/auth/session`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to get session');
      return response.json();
    },
  },
};

