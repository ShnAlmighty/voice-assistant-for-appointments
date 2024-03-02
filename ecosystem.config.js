module.exports = {
  apps : [
    {
      name: 'MedAssist',
      script: './app.js',
      instances: 2,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      time:true,
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      env_staging:{
        NODE_ENV: 'staging'
      }
    }
  ],
};