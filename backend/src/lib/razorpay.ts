/**
 * razorpay.ts
 * Singleton Razorpay SDK instance (test-mode credentials from env).
 *
 * IMPORTANT: In test mode, use key_id starting with "rzp_test_".
 * Never commit live keys; always use environment variables.
 */

import Razorpay from "razorpay";
import { env } from "../config/env.js";

export const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});
