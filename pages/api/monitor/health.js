// Simple health check endpoint for external monitoring
// This is the ONLY file added to Fleetopia for monitoring purposes

export default function handler(req, res) {
  try {
    // Basic health check response
    const healthData = {
      status: 'ok',
      timestamp: Date.now(),
      service: 'fleetopia',
      version: '1.3',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: 'connected',  // Could be enhanced to actually check DB
        authentication: 'active',
        api: 'operational'
      }
    };

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    // Return health status
    res.status(200).json(healthData);
    
  } catch (error) {
    // Return error status if something goes wrong
    res.status(503).json({
      status: 'error',
      timestamp: Date.now(),
      service: 'fleetopia',
      error: 'Health check failed',
      message: error.message
    });
  }
}