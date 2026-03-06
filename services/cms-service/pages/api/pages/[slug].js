// API Route para Vercel - Páginas estáticas
import { pages } from '../../src/api/page/services/page';

export default async function handler(req, res) {
  const { slug } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    let result;

    if (slug) {
      // Obtener página específica por slug
      result = await pages.findOne({ slug });
    } else {
      // Obtener todas las páginas
      result = await pages.find();
    }

    res.status(200).json({
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
        source: 'vercel-serverless'
      }
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
