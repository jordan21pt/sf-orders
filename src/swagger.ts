import swaggerJsdoc from 'swagger-jsdoc'

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SF Orders API',
      version: '1.0.0',
      description: 'API for managing orders in the SF system',
    },
    components: {
      schemas: {
        ListOfOrdersSimplified: {
          type: 'object',
          properties: {
            order_id: { type: 'integer' },
            customer_id: { type: 'integer' },
            status_id: { type: 'integer' },
            shipment_id: { type: 'integer' },
            payment_info_id: { type: 'integer' },
            order_total: { type: 'number' },
            brand_id: { type: 'integer' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
          required: [
            'order_id',
            'customer_id',
            'status_id',
            'shipment_id',
            'payment_info_id',
            'order_total',
            'brand_id',
            'created_at',
            'updated_at',
          ],
        },
        ListOfOrdersCompleted: {
          type: 'object',
          properties: {
            order_id: { type: 'integer' },
            customer_id: { type: 'integer' },
            status_id: { type: 'integer' },
            shipment_id: { type: 'integer' },
            payment_info_id: { type: 'integer' },
            order_total: { type: 'number' },
            brand_id: { type: 'integer' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  item_id: { type: 'integer' },
                  order_id: { type: 'integer' },
                  product_id: { type: 'integer' },
                  quantity: { type: 'integer' },
                  unit_price: { type: 'number' },
                  total_price: { type: 'number' },
                },
                required: [
                  'item_id',
                  'order_id',
                  'product_id',
                  'quantity',
                  'unit_price',
                  'total_price',
                ],
              },
            },
          },
          required: [
            'order_id',
            'customer_id',
            'status_id',
            'shipment_id',
            'payment_info_id',
            'order_total',
            'brand_id',
            'created_at',
            'updated_at',
            'items',
          ],
        },
      },
    },
  },

  apis: ['./src/routes/*.ts', './src/controllers/*.ts', './dist/**/*.js'],
}

export const swaggerSpec = swaggerJsdoc(swaggerOptions)
