/**
 * routes/index.ts
 * Central route registry — imported once in src/index.ts.
 * Adding a new feature = add one line here.
 */

import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import productRoutes from "./product.routes.js";
import warehouseRoutes from "./warehouse.routes.js";
import addressRoutes from "./address.routes.js";
import reservationRoutes from "./reservation.routes.js";
import paymentRoutes from "./payment.routes.js";
import orderRoutes from "./order.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/warehouses", warehouseRoutes);
router.use("/addresses", addressRoutes);
router.use("/reservations", reservationRoutes);
router.use("/payments", paymentRoutes);
router.use("/orders", orderRoutes);

export default router;
