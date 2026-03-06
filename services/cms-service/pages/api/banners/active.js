// API Route para Vercel - Banners activos
import { banners } from '../../src/api/banner/services/banner';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // En Vercel, esto sería una función serverless
    // que se conectaría a la base de datos
    const activeBanners = await banners.getActiveBanners();

    res.status(200).json({
      data: activeBanners,
      meta: {
        timestamp: new Date().toISOString(),
        source: 'vercel-serverless'
      }
    });
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
