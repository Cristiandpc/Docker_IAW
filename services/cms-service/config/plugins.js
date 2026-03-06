module.exports = ({ env }) => ({
  // Configuración de email (para notificaciones)
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'smtp.gmail.com'),
        port: env.int('SMTP_PORT', 587),
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
      },
      settings: {
        defaultFrom: env('SMTP_FROM', 'noreply@tienda.com'),
        defaultReplyTo: env('SMTP_REPLY_TO', 'noreply@tienda.com'),
      },
    },
  },
  // Configuración de upload
  upload: {
    config: {
      provider: 'local',
      providerOptions: {
        sizeLimit: 10000000, // 10MB
      },
    },
  },
});
