// Servicio de páginas simplificado para Vercel
export const pages = {
  async find() {
    // Datos de ejemplo para páginas estáticas
    return [
      {
        id: 1,
        title: 'Acerca de Nosotros',
        slug: 'acerca-de',
        content: 'Somos una tienda en línea dedicada a...',
        metaTitle: 'Acerca de Tienda Online',
        metaDescription: 'Conoce más sobre nuestra tienda',
        publishedAt: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Política de Privacidad',
        slug: 'privacidad',
        content: 'Nuestra política de privacidad...',
        metaTitle: 'Política de Privacidad',
        metaDescription: 'Cómo manejamos tus datos personales',
        publishedAt: new Date().toISOString()
      }
    ];
  },

  async findOne({ slug }) {
    const allPages = await this.find();
    return allPages.find(page => page.slug === slug);
  }
};
