const Joi = require("joi");

exports.signupSchema = Joi.object({
  phone: Joi.string().min(7).max(32).required(),
  password: Joi.string().min(6).max(128).required(),
  name: Joi.string().max(120).allow("", null),
  brightday: Joi.string().isoDate().allow(null), // 'YYYY-MM-DD' ham bo'ladi
});

exports.loginSchema = Joi.object({
  phone: Joi.string().required(),
  password: Joi.string().required(),
});

exports.categorySchema = Joi.object({
  name: Joi.string().max(120).required(),
  icon: Joi.string().uri().allow(null, ""),
});

exports.productCreateSchema = Joi.object({
  category_id: Joi.number().integer().allow(null),
  name: Joi.string().max(200).required(),
  price: Joi.number().precision(2).min(0).required(),
  stock_qty: Joi.number().integer().min(0).required(),
  description: Joi.string().allow("", null),
  images: Joi.array().items(Joi.string().uri()).default([]),
});

exports.productUpdateSchema = Joi.object({
  category_id: Joi.number().integer().allow(null),
  name: Joi.string().max(200),
  price: Joi.number().precision(2).min(0),
  stock_qty: Joi.number().integer().min(0),
  description: Joi.string().allow("", null),
  images: Joi.array().items(Joi.string().uri()),
});

exports.checkoutSchema = Joi.object({
  user_id: Joi.number().integer().required(),
  address_id: Joi.number().integer().allow(null),
  idempotency_key: Joi.string().max(64).allow(null, ""),
  notes: Joi.string().max(500).allow(null, ""),
  items: Joi.array()
    .items(
      Joi.object({
        product_id: Joi.number().integer().required(),
        qty: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),
});

exports.paginationQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  q: Joi.string().allow("", null),
  category_id: Joi.number().integer().allow(null),
});
