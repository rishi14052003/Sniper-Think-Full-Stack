require('dotenv').config();
const { app, initializeServer } = require('./app');

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    // Initialize server components
    await initializeServer();
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`🌐 Server running on port ${PORT}`);
      console.log(`📖 API documentation: http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

      switch (error.code) {
        case 'EACCES':
          console.error(`❌ ${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`❌ ${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

    // Graceful shutdown handler
    const gracefulShutdown = (signal) => {
      console.log(`\n🔄 Received ${signal}, shutting down gracefully...`);
      
      server.close((err) => {
        if (err) {
          console.error('❌ Error during server shutdown:', err);
          process.exit(1);
        }
        
        console.log('✅ HTTP server closed');
        
        // Close other resources (handled in app.js)
        process.exit(0);
      });
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();
