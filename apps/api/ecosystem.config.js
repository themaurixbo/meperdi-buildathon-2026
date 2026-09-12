module.exports = {
  apps: [
    {
      name: 'meperdi-backend',
      script: 'dist/main.js',
      cwd: '/home/meperdi/meperdi-backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: '/home/meperdi/meperdi-backend/logs/error.log',
      out_file: '/home/meperdi/meperdi-backend/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '500M',
      restart_delay: 3000,
      watch: false,
    },
  ],
};