// Middleware personalizado para logging de CMS
module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    const start = Date.now();

    // Log de la solicitud entrante
    strapi.log.info(`CMS Request: ${ctx.method} ${ctx.url}`);

    await next();

    const duration = Date.now() - start;
    strapi.log.info(`CMS Response: ${ctx.status} - ${duration}ms`);
  };
};
