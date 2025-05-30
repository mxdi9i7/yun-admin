import { createClient } from '@supabase/supabase-js';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseClient = createClient<Database>(
  'https://scdqkzvraociuznmtplo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjZHFrenZyYW9jaXV6bm10cGxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NTUwMzcsImV4cCI6MjA2NDEzMTAzN30.KE-zLj7BebGsxEs6COnJJw9kJSfZAzGBv4HsXayyK4M'
);

export type Customer = Database['public']['Tables']['customers']['Row'];
export type CustomerInsert =
  Database['public']['Tables']['customers']['Insert'];
export type CustomerUpdate =
  Database['public']['Tables']['customers']['Update'];

interface GetCustomersParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  sortColumn?: keyof Customer;
  sortDirection?: 'asc' | 'desc';
}

// Authentication utilities
export const auth = {
  // Sign up with email and password
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabaseClient.auth.signOut();
    return { error };
  },

  // Get current user
  getCurrentUser: async () => {
    const {
      data: { user },
      error,
    } = await supabaseClient.auth.getUser();
    return { user, error };
  },

  // Get current session
  getCurrentSession: async () => {
    const {
      data: { session },
      error,
    } = await supabaseClient.auth.getSession();
    return { session, error };
  },

  // Listen to auth state changes
  onAuthStateChange: (
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ) => {
    return supabaseClient.auth.onAuthStateChange(callback);
  },
};

// Storage utilities
export const storage = {
  // Upload file
  upload: async (bucket: string, path: string, file: File) => {
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .upload(path, file);
    return { data, error };
  },

  // Download file
  download: async (bucket: string, path: string) => {
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .download(path);
    return { data, error };
  },

  // Get public URL
  getPublicUrl: (bucket: string, path: string) => {
    const { data } = supabaseClient.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  // Delete file
  remove: async (bucket: string, paths: string[]) => {
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .remove(paths);
    return { data, error };
  },
};

// Customer utilities
export const customers = {
  async getCustomers({
    page = 1,
    pageSize = 10,
    searchTerm = '',
    sortColumn = 'name',
    sortDirection = 'asc',
  }: GetCustomersParams = {}) {
    try {
      let query = supabaseClient
        .from('customers')
        .select('*', { count: 'exact' });

      if (searchTerm) {
        query = query.or(
          `name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`
        );
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
      console.error('Error getting customers:', error);
      return {
        data: null,
        error,
        count: 0,
        totalPages: 0,
      };
    }
  },

  async getCustomerById(id: number) {
    try {
      const { data, error } = await supabaseClient
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  async createCustomer(customerData: {
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    notes: string | null;
  }) {
    const { data, error } = await supabaseClient
      .from('customers')
      .insert([customerData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCustomer(
    id: number,
    customerData: {
      name: string;
      phone: string | null;
      email: string | null;
      address: string | null;
      notes: string | null;
    }
  ) {
    try {
      const { data, error } = await supabaseClient
        .from('customers')
        .update(customerData)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  async deleteCustomer(id: number) {
    const { error } = await supabaseClient
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export type Product = Database['public']['Tables']['products']['Row'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];
export type Inventory = Database['public']['Tables']['inventory']['Row'];
export type InventoryInsert =
  Database['public']['Tables']['inventory']['Insert'];

interface GetProductsParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  type?: 'all' | 'keys' | 'tools' | 'parts';
  sortColumn?: keyof Product;
  sortDirection?: 'asc' | 'desc';
}

// Product utilities
export const products = {
  async getProducts({
    page = 1,
    pageSize = 10,
    searchTerm = '',
    type = 'all',
  }: {
    page?: number;
    pageSize?: number;
    searchTerm?: string;
    type?: 'all' | 'keys' | 'tools' | 'parts';
  }) {
    try {
      let query = supabaseClient
        .from('products')
        .select('*', { count: 'exact' });

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      if (type !== 'all') {
        query = query.eq('type', type);
      }

      const { data, error, count } = await query
        .range((page - 1) * pageSize, page * pageSize - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get stock for each product
      const productsWithStock = await Promise.all(
        (data || []).map(async (product) => {
          const { stock } = await this.getProductStock(product.id);
          return { ...product, stock };
        })
      );

      return {
        data: productsWithStock,
        error: null,
        count,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      return {
        data: null,
        error,
        count: null,
        totalPages: 0,
      };
    }
  },

  async getProductById(id: number) {
    try {
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Product not found');

      // Get stock for the product
      const { stock } = await this.getProductStock(data.id);
      return { data: { ...data, stock }, error: null };
    } catch (error) {
      console.error('Error fetching product:', error);
      return { data: null, error };
    }
  },

  async createProduct(product: ProductInsert) {
    try {
      const { data, error } = await supabaseClient
        .from('products')
        .insert([product])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating product:', error);
      return { data: null, error };
    }
  },

  async updateProduct(id: number, product: ProductInsert) {
    try {
      const { data, error } = await supabaseClient
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating product:', error);
      return { data: null, error };
    }
  },

  async deleteProduct(id: number) {
    try {
      const { error } = await supabaseClient
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { error };
    }
  },

  async updateInventory({
    productId,
    type,
    quantity,
    notes,
    price,
  }: {
    productId: number;
    type: 'add';
    quantity: number;
    notes?: string;
    price: number;
  }) {
    try {
      // Create inventory record
      const { data: inventoryData, error: inventoryError } =
        await supabaseClient
          .from('inventory')
          .insert([
            {
              product: productId,
              quantity,
              price,
              notes,
            },
          ])
          .select()
          .single();

      if (inventoryError) throw inventoryError;

      // Update product's updated_at timestamp
      const { error: updateError } = await supabaseClient
        .from('products')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', productId);

      if (updateError) throw updateError;

      return { data: inventoryData, error: null };
    } catch (error) {
      console.error('Error updating inventory:', error);
      return { data: null, error };
    }
  },

  async getProductStock(productId: number) {
    try {
      const { data, error } = await supabaseClient
        .from('inventory')
        .select('quantity')
        .eq('product', productId);

      if (error) throw error;

      // Calculate total stock from all inventory records
      const stock =
        data?.reduce((total, record) => total + record.quantity, 0) || 0;
      return { stock, error: null };
    } catch (error) {
      console.error('Error calculating product stock:', error);
      return { stock: 0, error };
    }
  },

  async getInventoryHistory(productId: number) {
    try {
      const { data, error } = await supabaseClient
        .from('inventory')
        .select('*')
        .eq('product', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching inventory history:', error);
      return { data: null, error };
    }
  },

  async getProductOrders(productId: number) {
    try {
      // For now, just return empty data since orders tables are not set up
      return {
        data: [],
        error: null,
      };

      /* Commented out until orders tables are set up
      type OrderRecord = {
        id: number;
        customer_id: number;
        customers: { name: string };
        created_at: string;
        order_items: Array<{ quantity: number; total: number }>;
      };

      const { data, error } = await supabaseClient
        .from('orders')
        .select(`
          id,
          customer_id,
          customers!inner (
            name
          ),
          created_at,
          order_items!inner (
            quantity,
            total
          )
        `)
        .eq('order_items.product_id', productId);

      if (error) throw error;

      // Transform the data to match the Order interface
      const transformedData = (data || []).map((order) => {
        const typedOrder = order as unknown as OrderRecord;
        return {
          id: typedOrder.id,
          customer_id: typedOrder.customer_id,
          customer_name: typedOrder.customers.name,
          created_at: typedOrder.created_at,
          quantity: typedOrder.order_items[0].quantity,
          total: typedOrder.order_items[0].total,
        };
      });

      return { data: transformedData, error: null };
      */
    } catch (error) {
      console.error('Error fetching product orders:', error);
      return { data: null, error };
    }
  },

  async getInventoryRecords({
    page = 1,
    pageSize = 10,
  }: {
    page?: number;
    pageSize?: number;
  }) {
    try {
      const { data, error, count } = await supabaseClient
        .from('inventory')
        .select('*', { count: 'exact' })
        .range((page - 1) * pageSize, page * pageSize - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        data,
        error: null,
        count,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    } catch (error) {
      console.error('Error fetching inventory records:', error);
      return {
        data: null,
        error,
        count: null,
        totalPages: 0,
      };
    }
  },
};

export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderInsert = Database['public']['Tables']['orders']['Insert'];
export type OrderUpdate = Database['public']['Tables']['orders']['Update'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type OrderItemInsert =
  Database['public']['Tables']['order_items']['Insert'];
export type OrderItemUpdate =
  Database['public']['Tables']['order_items']['Update'];

interface GetOrdersParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  status?: 'all' | 'pending' | 'fulfilled' | 'canceled';
  customerId?: number;
}

export const orders = {
  async getOrders({
    page = 1,
    pageSize = 10,
    searchTerm = '',
    status = 'all',
    customerId,
  }: GetOrdersParams = {}) {
    try {
      let query = supabaseClient.from('orders').select(
        `
          *,
          customer:customers!inner(id, name),
          order_items!inner(
            id,
            product,
            quantity,
            price_overwrite,
            products!inner(title)
          )
        `,
        { count: 'exact' }
      );

      if (searchTerm) {
        query = query.or(
          `customers.name.ilike.%${searchTerm}%,customers.phone.ilike.%${searchTerm}%`
        );
      }

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      if (customerId) {
        query = query.eq('customer', customerId);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) throw error;

      return {
        data,
        error: null,
        count,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    } catch (error) {
      console.error('Error getting orders:', error);
      return {
        data: null,
        error,
        count: 0,
        totalPages: 0,
      };
    }
  },

  async getOrderById(id: number) {
    try {
      const { data, error } = await supabaseClient
        .from('orders')
        .select(
          `
          *,
          customer:customers!inner(id, name),
          order_items!inner(
            id,
            product,
            quantity,
            price_overwrite,
            products!inner(title)
          )
        `
        )
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting order:', error);
      return { data: null, error };
    }
  },

  async createOrder({
    customerId,
    items,
    notes,
  }: {
    customerId: number;
    items: Array<{
      productId: number;
      quantity: number;
      price: number;
    }>;
    notes?: string;
  }) {
    try {
      // First create an inventory record for the order
      const { data: inventoryData, error: inventoryError } =
        await supabaseClient
          .from('inventory')
          .insert([
            {
              product: items[0].productId,
              quantity: -items[0].quantity,
              price: items[0].price,
              notes: 'Order outbound inventory',
            },
          ])
          .select()
          .single();

      if (inventoryError) throw inventoryError;

      // Create the order with the inventory reference
      const { data: order, error: orderError } = await supabaseClient
        .from('orders')
        .insert([
          {
            customer: customerId,
            status: 'pending',
            notes,
            inventory: inventoryData.id,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const orderItems = items.map((item) => ({
        order: order.id,
        product: item.productId,
        quantity: item.quantity,
        price_overwrite: item.price,
      }));

      const { error: itemsError } = await supabaseClient
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return { data: order, error: null };
    } catch (error) {
      console.error('Error creating order:', error);
      return { data: null, error };
    }
  },

  async updateOrder(
    id: number,
    {
      status,
      notes,
      items,
    }: {
      status?: 'pending' | 'fulfilled' | 'canceled';
      notes?: string;
      items?: Array<{
        id?: number;
        productId: number;
        quantity: number;
        price: number;
      }>;
    }
  ) {
    try {
      // Update order details
      if (status || notes) {
        const updates: OrderUpdate = {};
        if (status) updates.status = status;
        if (notes) updates.notes = notes;

        const { error: orderError } = await supabaseClient
          .from('orders')
          .update(updates)
          .eq('id', id);

        if (orderError) throw orderError;
      }

      // Update order items if provided
      if (items) {
        // Delete existing items
        const { error: deleteError } = await supabaseClient
          .from('order_items')
          .delete()
          .eq('order', id);

        if (deleteError) throw deleteError;

        // Insert new items
        const orderItems = items.map((item) => ({
          order: id,
          product: item.productId,
          quantity: item.quantity,
          price_overwrite: item.price,
        }));

        const { error: itemsError } = await supabaseClient
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;
      }

      return { error: null };
    } catch (error) {
      console.error('Error updating order:', error);
      return { error };
    }
  },

  async deleteOrder(id: number) {
    try {
      const { error } = await supabaseClient
        .from('orders')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting order:', error);
      return { error };
    }
  },
};

// Export the main supabase client for direct database operations
export { supabaseClient };
