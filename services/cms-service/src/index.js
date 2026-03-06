// Archivo principal de Strapi
'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    // Registrar middleware personalizado
    strapi.middleware('global::cms-logger', require('./middlewares/cms-logger'));
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    // Inicializar datos por defecto
    strapi.db.lifecycles.subscribe({
      models: ['api::banner.banner'],

      async afterCreate(event) {
        strapi.log.info(`Nuevo banner creado: ${event.result.title}`);
      },

      async afterUpdate(event) {
        strapi.log.info(`Banner actualizado: ${event.result.title}`);
      },
    });
  },
};
