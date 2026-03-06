// API Controller personalizado para integración con otros servicios
'use strict';

module.exports = {
  async find(ctx) {
    try {
      const { data, meta } = await super.find(ctx);

      // Agregar información adicional para integración
      const enhancedData = data.map(item => ({
        ...item,
        cms_source: 'strapi',
        last_updated: new Date().toISOString(),
      }));

      return { data: enhancedData, meta };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async findOne(ctx) {
    try {
      const { data, meta } = await super.findOne(ctx);

      if (data) {
        data.cms_source = 'strapi';
        data.last_updated = new Date().toISOString();
      }

      return { data, meta };
    } catch (error) {
      ctx.throw(500, error);
    }
  },
};
