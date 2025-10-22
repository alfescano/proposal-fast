module.exports = {
  apps: [
    {
      name: 'proposalfast-ai',
      script: './server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      ignore_watch: ['node_modules', 'dist', 'logs'],
      listen_timeout: 3000,
      kill_timeout: 5000
    }
  ],
  deploy: {
    production: {
      user: 'namecheap_user',
      host: 'your-domain.com',
      ref: 'origin/main',
      repo: 'your-git-repo-url',
      path: '/home/namecheap_user/proposalfast-ai',
      'post-deploy': 'npm ci && npm run build && pm2 startOrRestart ecosystem.config.js'
    }
  }
};
