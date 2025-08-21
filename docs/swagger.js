const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-commerce API",
      version: "1.0.0",
      description: "REST API for products, categories, orders, payments",
    },
    servers: [{ url: "/api/v1", description: "Base path" }],
    components: {
      securitySchemes: {
        BearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
      schemas: {
        SignupInput: {
          type: "object",
          required: ["phone", "password"],
          properties: {
            phone: { type: "string" },
            password: { type: "string" },
            name: { type: "string" },
            brightday: { type: "string", format: "date" },
          },
        },
        LoginInput: {
          type: "object",
          required: ["phone", "password"],
          properties: {
            phone: { type: "string" },
            password: { type: "string" },
          },
        },
        CategoryInput: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string" },
            icon: { type: "string" },
          },
        },
        ProductCreate: {
          type: "object",
          required: ["name", "price", "stock_qty"],
          properties: {
            category_id: { type: "integer", nullable: true },
            name: { type: "string" },
            price: { type: "number", format: "float" },
            stock_qty: { type: "integer" },
            description: { type: "string" },
            images: { type: "array", items: { type: "string", format: "uri" } },
          },
        },
        AddressInput: {
          type: "object",
          properties: {
            label: { type: "string" },
            region: { type: "string" },
            city: { type: "string" },
            street: { type: "string" },
            zip_code: { type: "string" },
            is_default: { type: "boolean" },
          },
        },
        OrderStatusUpdate: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: [
                "created",
                "cancelled",
                "shipping",
                "delivered",
                "completed",
              ],
            },
          },
        },
        ProductUpdate: {
          type: "object",
          properties: {
            category_id: { type: "integer", nullable: true },
            name: { type: "string" },
            price: { type: "number", format: "float" },
            stock_qty: { type: "integer" },
            description: { type: "string" },
            images: { type: "array", items: { type: "string", format: "uri" } },
          },
        },
        CheckoutInput: {
          type: "object",
          required: ["user_id", "items"],
          properties: {
            user_id: { type: "integer" },
            address_id: { type: "integer", nullable: true },
            idempotency_key: { type: "string" },
            notes: { type: "string" },
            items: {
              type: "array",
              items: {
                type: "object",
                required: ["product_id", "qty"],
                properties: {
                  product_id: { type: "integer" },
                  qty: { type: "integer", minimum: 1 },
                },
              },
              minItems: 1,
            },
          },
        },
      },
    },
  },
  apis: ["./routes/*.routes.js"],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
