import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flat Brokerage API Documentation',
      version: '1.0.0',
      description: 'API documentation for Flat Brokerage application',
      contact: {
        name: 'API Support',
        email: 'support@brokerin.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? process.env.API_URL || '' 
          : 'http://localhost:3030',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' },
            name: { type: 'string' },
            profilePicture: { type: 'string' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            code: { type: 'string' }
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }],
    tags: [
      { name: 'Authentication', description: 'Authentication endpoints' },
      { name: 'Admin', description: 'Admin management endpoints' },
      { name: 'Services', description: 'Service management endpoints' }
    ]
  },
  apis: process.env.NODE_ENV === 'production'
    ? [
        path.join(__dirname, '../routes/*.js'),    
        path.join(__dirname, '../controllers/*.js') 
      ]
    : [
        path.join(__dirname, '../routes/*.ts'),
        path.join(__dirname, '../controllers/*.ts')
      ]
};

// Log the paths being searched
console.log('Swagger searching in paths:', options.apis);

// Temporary debug logging
console.log('Current NODE_ENV:', process.env.NODE_ENV);
console.log('Resolved routes path:', path.resolve(__dirname, process.env.NODE_ENV === 'production' ? '../routes/*.js' : '../routes/*.ts'));
console.log('Resolved controllers path:', path.resolve(__dirname, process.env.NODE_ENV === 'production' ? '../controllers/*.js' : '../controllers/*.ts'));

export const specs = swaggerJsdoc(options);