const Order = require("../models/Order");
const Payment = require("../models/Payment");

module.exports = {
  // POST /api/v1/payments/create
  create: async (req, res) => {
    const { order_id, provider = "manual", amount } = req.body || {};
    if (!order_id || !amount) {
      return res
        .status(400)
        .json({ success: false, message: "order_id and amount required" });
    }

    const order = await Order.query().findById(order_id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    const pay = await Payment.query().insert({
      order_id,
      provider,
      amount,
      status: "pending",
      provider_ref: null,
      payload: null,
    });

    // Mock to‘lov URL (real integratsiyada provider URL qaytadi)
    res.status(201).json({
      success: true,
      data: {
        payment_id: pay.id,
        provider,
        pay_url: `/api/v1/payments/callback/${provider}?payment_id=${pay.id}&status=succeeded`,
      },
    });
  },

  // POST /api/v1/payments/callback/:provider
  callback: async (req, res) => {
    const { provider } = req.params;
    const { payment_id, status = "succeeded", provider_ref } = req.query;

    const pay = await Payment.query().findById(payment_id);
    if (!pay)
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });

    await Payment.query().patchAndFetchById(pay.id, {
      status,
      provider,
      provider_ref: provider_ref || `ref_${Date.now()}`,
      payload: JSON.stringify({ provider, status }),
    });

    if (status === "succeeded") {
      await Order.query().patchAndFetchById(pay.order_id, {
        payment_status: "paid",
        status: "shipping",
      });
    } else if (status === "failed") {
      await Order.query().patchAndFetchById(pay.order_id, {
        payment_status: "failed",
      });
    }

    res.json({ success: true, message: "Callback processed" });
  },
};
