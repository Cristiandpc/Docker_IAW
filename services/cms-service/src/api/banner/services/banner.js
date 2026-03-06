// Servicio personalizado para sincronización con otros microservicios
'use strict';

module.exports = ({ strapi }) => ({
  async syncWithProducts() {
    try {
      // Obtener productos del servicio de productos
      const axios = require('axios');
      const productsResponse = await axios.get('http://products-service:3001/products');

      // Sincronizar categorías
      const categories = [...new Set(productsResponse.data.map(p => p.category))];

      for (const categoryName of categories) {
        const existingCategory = await strapi.entityService.findMany('api::product-category.product-category', {
          filters: { name: categoryName },
        });

        if (existingCategory.length === 0) {
          await strapi.entityService.create('api::product-category.product-category', {
            data: {
              name: categoryName,
              slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
              publishedAt: new Date(),
            },
          });
        }
      }

      return { success: true, synced_categories: categories.length };
    } catch (error) {
      strapi.log.error('Error syncing with products service:', error);
      return { success: false, error: error.message };
    }
  },

  async getActiveBanners() {
    try {
      const banners = await strapi.entityService.findMany('api::banner.banner', {
        filters: { active: true },
        sort: { order: 'asc' },
        populate: ['image'],
      });

      return banners;
    } catch (error) {
      strapi.log.error('Error getting active banners:', error);
      throw error;
    }
  },
});
