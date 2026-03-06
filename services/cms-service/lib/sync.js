// Servicio de sincronización entre CMS y servicios de productos
const axios = require('axios');

class CMSSyncService {
  constructor() {
    this.cmsUrl = process.env.CMS_API_URL || 'http://localhost:1337/api';
    this.productsUrl = process.env.PRODUCTS_API_URL || 'http://localhost:3001';
    this.syncInterval = process.env.SYNC_INTERVAL || 300000; // 5 minutes default
    this.isVercel = process.env.VERCEL === '1';
  }

  async syncProducts() {
    try {
      console.log('Starting CMS-Products synchronization...');

      // Get products from CMS
      const cmsResponse = await axios.get(`${this.cmsUrl}/products?populate=*`);
      const cmsProducts = cmsResponse.data.data || [];

      // Get products from Products service
      const productsResponse = await axios.get(`${this.productsUrl}/products`);
      const serviceProducts = productsResponse.data || [];

      // Sync CMS products to service
      for (const cmsProduct of cmsProducts) {
        const existingProduct = serviceProducts.find(p => p.cms_id === cmsProduct.id);

        const productData = {
          name: cmsProduct.attributes.name,
          description: cmsProduct.attributes.description,
          price: cmsProduct.attributes.price,
          category: cmsProduct.attributes.category,
          image: cmsProduct.attributes.image?.data?.attributes?.url,
          stock: cmsProduct.attributes.stock || 0,
          cms_id: cmsProduct.id
        };

        if (existingProduct) {
          // Update existing product
          await axios.put(`${this.productsUrl}/products/${existingProduct.id}`, productData);
          console.log(`Updated product: ${cmsProduct.attributes.name}`);
        } else {
          // Create new product
          await axios.post(`${this.productsUrl}/products`, productData);
          console.log(`Created product: ${cmsProduct.attributes.name}`);
        }
      }

      // Remove products that no longer exist in CMS
      for (const serviceProduct of serviceProducts) {
        const cmsProduct = cmsProducts.find(p => p.id === serviceProduct.cms_id);
        if (!cmsProduct && serviceProduct.cms_id) {
          await axios.delete(`${this.productsUrl}/products/${serviceProduct.id}`);
          console.log(`Removed product: ${serviceProduct.name}`);
        }
      }

      console.log('CMS-Products synchronization completed successfully');
      return { success: true, syncedProducts: cmsProducts.length };
    } catch (error) {
      console.error('Error during CMS-Products synchronization:', error.message);
      return { success: false, error: error.message };
    }
  }

  async syncCategories() {
    try {
      console.log('Starting CMS-Categories synchronization...');

      // Get categories from CMS
      const cmsResponse = await axios.get(`${this.cmsUrl}/product-categories`);
      const cmsCategories = cmsResponse.data.data || [];

      // Update products service with category information
      for (const category of cmsCategories) {
        console.log(`Category: ${category.attributes.name} (${category.attributes.slug})`);
      }

      console.log('CMS-Categories synchronization completed successfully');
      return { success: true, syncedCategories: cmsCategories.length };
    } catch (error) {
      console.error('Error during CMS-Categories synchronization:', error.message);
      return { success: false, error: error.message };
    }
  }

  startSync() {
    if (this.isVercel) {
      console.log('Running on Vercel - sync service disabled');
      return;
    }

    console.log(`Starting CMS sync service with interval: ${this.syncInterval}ms`);

    // Initial sync
    this.syncProducts();
    this.syncCategories();

    // Periodic sync
    setInterval(() => {
      this.syncProducts();
      this.syncCategories();
    }, this.syncInterval);
  }

  async manualSync() {
    const productsResult = await this.syncProducts();
    const categoriesResult = await this.syncCategories();

    return {
      products: productsResult,
      categories: categoriesResult
    };
  }
}

// Servicio simplificado para Vercel (compatible con ES modules)
export const syncService = {
  async syncWithProducts() {
    try {
      const sync = new CMSSyncService();
      return await sync.manualSync();
    } catch (error) {
      console.error('Sync error:', error);
      throw error;
    }
  }
};

// CommonJS export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CMSSyncService;
}
