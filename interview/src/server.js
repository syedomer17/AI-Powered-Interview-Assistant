import { connectDB } from "./config/db.js";
import { createApp } from "./app.js";
import { env } from "./config/env.js";

import net from 'net';

function findAvailablePort(startPort) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(startPort, '0.0.0.0', () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    
    server.on('error', () => {
      // Port is in use, try next one
      resolve(findAvailablePort(startPort + 1));
    });
  });
}

async function start() {
  try {
    await connectDB();
    const app = createApp();
    
    // Find available port starting from env.PORT
    const availablePort = await findAvailablePort(parseInt(env.PORT));
    
    if (availablePort !== parseInt(env.PORT)) {
      console.log(`⚠️  Port ${env.PORT} is in use, using port ${availablePort} instead`);
    }
    
    const server = app.listen(availablePort, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://localhost:${availablePort}`);
      console.log(`🌐 Server accessible at http://0.0.0.0:${availablePort}`);
    });

    // Handle server listen errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${availablePort} is already in use`);
        console.log('💡 Try killing existing processes or use a different port');
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });

    // Graceful shutdown handlers
    const shutdown = (signal) => {
      console.log(`${signal} received, shutting down gracefully...`);
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start().catch((e) => {
  console.error("Startup error", e);
  process.exit(1);
});
