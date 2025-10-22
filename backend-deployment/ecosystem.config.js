module.exports = {
  apps: [
    {
      // =====================================================================
      // PROPOSALFAST BACKEND API SERVER
      // =====================================================================
      name: 'proposalfast-api',
      script: './api.js',
      
      // =====================================================================
      // CLUSTERING & PERFORMANCE
      // =====================================================================
      instances: 'max',              // Use all CPU cores
      exec_mode: 'cluster',          // Run in cluster mode
      max_memory_restart: '500M',    // Restart if > 500MB RAM
      
      // =====================================================================
      // ENVIRONMENT
      // =====================================================================
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOST: '0.0.0.0',
      },
      
      // =====================================================================
      // LOGGING
      // =====================================================================
      output: './logs/out.log',
      error: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // =====================================================================
      // AUTO-RESTART CONFIGURATION
      // =====================================================================
      autorestart: true,
      watch: false,
      ignore_watch: [
        'node_modules',
        'logs',
        '.git',
        '.env',
        'dist',
      ],
      
      // =====================================================================
      // PROCESS MANAGEMENT
      // =====================================================================
      min_uptime: '10s',            // Min uptime before restart
      max_restarts: 10,             // Max restart attempts
      restart_delay: 4000,          // Delay between restarts (ms)
      listen_timeout: 3000,         // Graceful shutdown timeout
      kill_timeout: 5000,           // Force kill timeout
      
      // =====================================================================
      // HEALTH & MONITORING
      // =====================================================================
      // Health check endpoint: GET /health
      // Response: { status: "ok", hasApiKey: true, mode: "OpenAI" }
      
      // =====================================================================
      // GRACEFUL SHUTDOWN
      // =====================================================================
      // Listens for SIGTERM and SIGINT
      // Has 5 seconds to gracefully close connections
      wait_ready: true,
      kill_timeout: 5000,
    },
  ],
  
  // =========================================================================
  // DEPLOYMENT CONFIGURATION (Optional - for automated deployments)
  // =========================================================================
  deploy: {
    production: {
      user: 'propvrtv',
      host: '199.188.200.91',
      port: 21098,
      ref: 'origin/main',
      repo: 'git@github.com:your-username/proposalfast.git',
      path: '/home/propvrtv/app.proposalfast.ai',
      'post-deploy': 'npm ci && npm run build && pm2 startOrRestart ecosystem.config.js',
      'pre-deploy-local': 'echo "Deploying to production..."',
    },
  },
};
