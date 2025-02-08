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
        url: '/',
        description: 'Current Environment'
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
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Admin', description: 'Admin management endpoints' },
      { name: 'Properties', description: 'Property management endpoints' },
      { name: 'Services', description: 'Service management endpoints' }
    ]
  },
  apis: [
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../controllers/*.ts'),
    path.join(__dirname, '../controllers/*.js')
  ]
};

export const specs = swaggerJsdoc(options);