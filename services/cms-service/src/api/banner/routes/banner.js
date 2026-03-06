// Route personalizado para sincronización
module.exports = {
  type: 'admin',
  routes: [
    {
      method: 'POST',
      path: '/sync/products',
      handler: 'banner.syncWithProducts',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'GET',
      path: '/banners/active',
      handler: 'banner.getActiveBanners',
      config: {
        policies: [],
      },
    },
  ],
};
