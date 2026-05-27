
import { Request, Response } from "express";
import { paymentService } from "../services/payment.service.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const paymentController = {
  async createOrder(req: Request, res: Response): Promise<void> {
    const { reservationId } = req.body;

    const orderDetails = await paymentService.createRazorpayOrder(
      reservationId,
      req.user!.userId
    );

    sendSuccess(
      res,
      { payment: orderDetails },
      "Razorpay order created. Use the razorpayOrderId to open checkout.",
      201
    );
  },
};
