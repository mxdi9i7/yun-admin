import { Database } from '@/types/supabase';
import { supabase } from '@/lib/supabaseClient';

export type Product = Database['public']['Tables']['products']['Row'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];

interface GetProductsParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  type?: 'all' | 'keys' | 'tools' | 'parts';
  sortColumn?: keyof Product;
  sortDirection?: 'asc' | 'desc';
}

export const products = {
  async getProducts({
    page = 1,
    pageSize = 10,
    searchTerm = '',
    type = 'all',
    sortColumn = 'title',
    sortDirection = 'asc',
  }: GetProductsParams = {}) {
    try {
      let query = supabase.from('products').select('*', { count: 'exact' });

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      if (type !== 'all') {
        query = query.eq('type', type);
      }

      const startIndex = (page - 1) * pageSize;
      const { data, error, count } = await query
        .order(sortColumn, { ascending: sortDirection === 'asc' })
        .range(startIndex, startIndex + pageSize - 1);

      if (error) throw error;

      return {
        data,
        error: null,
        count,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    } catch (error) {
      console.error('Error getting products:', error);
      return {
        data: null,
        error,
        count: 0,
        totalPages: 0,
      };
    }
  },

  async createProduct(product: ProductInsert) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProduct(id: number, updates: ProductUpdate) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteProduct(id: number) {
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) throw error;
  },
};
