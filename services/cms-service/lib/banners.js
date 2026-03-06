// Servicio de banners simplificado para Vercel
export const banners = {
  async getActiveBanners() {
    try {
      // En producción, esto consultaría la base de datos
      // Por ahora, retornamos datos de ejemplo
      return [
        {
          id: 1,
          title: 'Oferta Especial',
          description: 'Descuentos del 20% en electrónicos',
          image: { url: '/uploads/banner1.jpg' },
          link: '/categoria/electronica',
          active: true,
          order: 1
        },
        {
          id: 2,
          title: 'Envío Gratis',
          description: 'En compras superiores a $50',
          image: { url: '/uploads/banner2.jpg' },
          link: '/carrito',
          active: true,
          order: 2
        }
      ];
    } catch (error) {
      console.error('Error getting banners:', error);
      throw error;
    }
  }
};
