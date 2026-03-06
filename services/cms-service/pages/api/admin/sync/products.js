// API Route para Vercel - Sincronización con productos
import { syncService } from '../../src/services/sync';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verificar autenticación (en producción usar JWT)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const result = await syncService.syncWithProducts();

    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error syncing products:', error);
    res.status(500).json({ message: 'Sync failed', error: error.message });
  }
}
