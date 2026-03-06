#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class CMSInitializer {
  constructor() {
    this.baseUrl = process.env.STRAPI_URL || 'http://localhost:1337';
    this.adminEmail = process.env.ADMIN_EMAIL || 'admin@tienda.com';
    this.adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
  }

  async waitForStrapi() {
    console.log('Waiting for Strapi to be ready...');
    const maxRetries = 30;
    const retryDelay = 2000;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await axios.get(`${this.baseUrl}/_health`);
        if (response.status === 200) {
          console.log('Strapi is ready!');
          return true;
        }
      } catch (error) {
        console.log(`Attempt ${i + 1}/${maxRetries} - Strapi not ready yet...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    throw new Error('Strapi failed to start within the expected time');
  }

  async createAdminUser() {
    try {
      console.log('Creating admin user...');

      const adminData = {
        email: this.adminEmail,
        password: this.adminPassword,
        firstname: 'Admin',
        lastname: 'Tienda',
        isActive: true
      };

      const response = await axios.post(`${this.baseUrl}/admin/register-admin`, adminData);
      console.log('Admin user created successfully');
      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('Admin user already exists');
        return null;
      }
      throw error;
    }
  }

  async loginAdmin() {
    try {
      console.log('Logging in admin user...');

      const loginData = {
        email: this.adminEmail,
        password: this.adminPassword
      };

      const response = await axios.post(`${this.baseUrl}/admin/login`, loginData);
      console.log('Admin login successful');
      return response.data.data.token;
    } catch (error) {
      console.error('Admin login failed:', error.message);
      throw error;
    }
  }

  async createContentTypes(token) {
    console.log('Creating content types...');

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Content types definitions
    const contentTypes = [
      {
        name: 'banner',
        displayName: 'Banner',
        description: 'Banners promocionales',
        attributes: {
          title: { type: 'string', required: true },
          description: { type: 'text' },
          image: { type: 'media', multiple: false, required: false },
          link: { type: 'string' },
          linkText: { type: 'string' },
          active: { type: 'boolean', default: true },
          order: { type: 'integer', default: 0 }
        }
      },
      {
        name: 'product-category',
        displayName: 'Product Category',
        description: 'Categorías de productos',
        attributes: {
          name: { type: 'string', required: true },
          slug: { type: 'uid', targetField: 'name', required: true },
          description: { type: 'text' },
          image: { type: 'media', multiple: false, required: false },
          active: { type: 'boolean', default: true }
        }
      },
      {
        name: 'page',
        displayName: 'Page',
        description: 'Páginas estáticas',
        attributes: {
          title: { type: 'string', required: true },
          slug: { type: 'uid', targetField: 'title', required: true },
          content: { type: 'richtext', required: true },
          image: { type: 'media', multiple: false, required: false },
          metaTitle: { type: 'string' },
          metaDescription: { type: 'text' },
          published: { type: 'boolean', default: true }
        }
      }
    ];

    for (const contentType of contentTypes) {
      try {
        const response = await axios.post(
          `${this.baseUrl}/content-type-builder/content-types`,
          { contentType },
          { headers }
        );
        console.log(`Content type '${contentType.name}' created successfully`);
      } catch (error) {
        if (error.response?.status === 400) {
          console.log(`Content type '${contentType.name}' already exists`);
        } else {
          console.error(`Error creating content type '${contentType.name}':`, error.message);
        }
      }
    }
  }

  async createRoles(token) {
    console.log('Ensuring user roles exist...');

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const roles = [
      { name: 'public', description: 'Default public role' },
      { name: 'authenticated', description: 'Registered users' },
      { name: 'editor', description: 'Content editors' },
      { name: 'admin', description: 'Administrators with full access' }
    ];

    for (const role of roles) {
      try {
        await axios.post(`${this.baseUrl}/users-permissions/roles`, { role }, { headers });
        console.log(`Role '${role.name}' created`);
      } catch (error) {
        if (error.response && error.response.status === 400) {
          console.log(`Role '${role.name}' already exists`);
        } else {
          console.error(`Error creating role '${role.name}':`, error.message);
        }
      }
    }
  }

  async createSampleData(token) {
    console.log('Creating sample data...');

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Sample categories
    const categories = [
      { name: 'Electrónica', description: 'Productos electrónicos y gadgets' },
      { name: 'Ropa', description: 'Ropa y accesorios' },
      { name: 'Hogar', description: 'Artículos para el hogar' }
    ];

    for (const category of categories) {
      try {
        await axios.post(`${this.baseUrl}/api/product-categories`, { data: category }, { headers });
        console.log(`Category '${category.name}' created`);
      } catch (error) {
        console.log(`Category '${category.name}' may already exist`);
      }
    }

    // Sample banner
    const banner = {
      title: '¡Oferta Especial!',
      description: 'Descuentos de hasta 50% en productos seleccionados',
      link: '/products',
      linkText: 'Ver Ofertas',
      active: true,
      order: 1
    };

    try {
      await axios.post(`${this.baseUrl}/api/banners`, { data: banner }, { headers });
      console.log('Sample banner created');
    } catch (error) {
      console.log('Sample banner may already exist');
    }

    // Sample page
    const page = {
      title: 'Sobre Nosotros',
      content: '<h2>Nuestra Tienda</h2><p>Somos una tienda en línea dedicada a ofrecer los mejores productos con calidad y servicio excepcional.</p><h3>Nuestra Misión</h3><p>Brindar a nuestros clientes una experiencia de compra única con productos de alta calidad y atención personalizada.</p>',
      published: true
    };

    try {
      await axios.post(`${this.baseUrl}/api/pages`, { data: page }, { headers });
      console.log('Sample page created');
    } catch (error) {
      console.log('Sample page may already exist');
    }
  }

  async initialize() {
    try {
      console.log('Starting CMS initialization...');

      await this.waitForStrapi();
      await this.createAdminUser();
      const token = await this.loginAdmin();

      // create additional roles and sample user accounts
      await this.createRoles(token);
      await this.createSampleData(token);

      console.log('CMS initialization completed successfully!');
    } catch (error) {
      console.error('CMS initialization failed:', error.message);
      process.exit(1);
    }
  }
}

// Run initialization if called directly
if (require.main === module) {
  const initializer = new CMSInitializer();
  initializer.initialize();
}

module.exports = CMSInitializer;