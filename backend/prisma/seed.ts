/**
 * seed.ts
 * Populates the database with realistic demo data for evaluation.
 *
 * Run:  npx tsx prisma/seed.ts
 *
 * Creates:
 *   - 6 Warehouses  (Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Kolkata)
 *   - 13 Products   (electronics + apparel + accessories + ₹1 test item)
 *   - 63 Inventory entries across warehouses
 *   - 1 demo user   (demo@allo.dev / Demo@1234)
 *   - 1 new user    (priya@bharatbazaar.in / Test@1234) with 2 real orders
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── helpers ────────────────────────────────────────────────────────────────

/** Fake but plausible Razorpay IDs for seeded payments */
function fakeRpOrderId(n: number) {
  return `order_Seed${String(n).padStart(14, "0")}`;
}
function fakeRpPaymentId(n: number) {
  return `pay_Seed${String(n).padStart(15, "0")}`;
}
function fakeRpSignature(n: number) {
  return `a1b2c3d4e5f6${"0".repeat(44)}${String(n).padStart(4, "0")}`;
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting database seed...\n");

  // ── Clean slate ─────────────────────────────────────────────────────────────
  console.log("  Clearing existing seed data...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  console.log("  ✓ Cleared\n");

  // ── Warehouses ───────────────────────────────────────────────────────────────
  console.log("  Creating warehouses...");
  const [mumbai, delhi, bangalore, chennai, hyderabad, kolkata] =
    await Promise.all([
      prisma.warehouse.create({
        data: {
          name: "Mumbai Hub",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
          country: "India",
          image:
            "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800",
        },
      }),
      prisma.warehouse.create({
        data: {
          name: "Delhi Central",
          city: "New Delhi",
          state: "Delhi",
          pincode: "110001",
          country: "India",
          image:
            "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800",
        },
      }),
      prisma.warehouse.create({
        data: {
          name: "Bangalore Tech Park",
          city: "Bangalore",
          state: "Karnataka",
          pincode: "560001",
          country: "India",
          image:
            "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800",
        },
      }),
      prisma.warehouse.create({
        data: {
          name: "Chennai Express",
          city: "Chennai",
          state: "Tamil Nadu",
          pincode: "600001",
          country: "India",
          image:
            "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800",
        },
      }),
      prisma.warehouse.create({
        data: {
          name: "Hyderabad Hub",
          city: "Hyderabad",
          state: "Telangana",
          pincode: "500001",
          country: "India",
          image:
            "https://ik.imagekit.io/tvz1mupab/hydrabad.jpg",
        },
      }),
      prisma.warehouse.create({
        data: {
          name: "Kolkata Gateway",
          city: "Kolkata",
          state: "West Bengal",
          pincode: "700001",
          country: "India",
          image:
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
        },
      }),
    ]);
  console.log("  ✓ 6 warehouses created\n");

  // ── Products ─────────────────────────────────────────────────────────────────
  console.log("  Creating products...");
  const [
    airpods,
    macbook,
    iphone,
    tShirt,
    sneakers,
    headphones,
    galaxyS24,
    ipadAir,
    jblSpeaker,
    levisJeans,
    nikeAirMax,
    kindle,
    testRupee,
  ] = await Promise.all([
    prisma.product.create({
      data: {
        name: "AirPods Pro (2nd Gen)",
        description:
          "Active Noise Cancellation, Adaptive Audio, USB-C charging case.",
        image:
          "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=800",
        price: 24900,
      },
    }),
    prisma.product.create({
      data: {
        name: 'MacBook Air 13" M3',
        description:
          "Apple M3 chip, 8GB RAM, 256GB SSD, 18-hour battery life.",
        image:
          "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba13-midnight-config-202402?wid=800",
        price: 114900,
      },
    }),
    prisma.product.create({
      data: {
        name: "iPhone 16 Pro",
        description: "A18 Pro chip, 48MP camera system, titanium design.",
        image:
          "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-model-unselect-gallery-1-202409?wid=800",
        price: 119900,
      },
    }),
    prisma.product.create({
      data: {
        name: "Premium Cotton T-Shirt",
        description:
          "100% organic cotton, pre-shrunk, available in 6 colours.",
        image:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
        price: 1299,
      },
    }),
    prisma.product.create({
      data: {
        name: "Allbirds Tree Runners",
        description: "Lightweight eucalyptus tree fibre. Carbon-neutral.",
        image:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
        price: 12999,
      },
    }),
    prisma.product.create({
      data: {
        name: "Sony WH-1000XM5",
        description:
          "Industry-leading noise cancellation, 30-hour battery, multipoint connect.",
        image:
          "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
        price: 26990,
      },
    }),
    prisma.product.create({
      data: {
        name: "Samsung Galaxy S24 Ultra",
        description:
          "200MP camera, Snapdragon 8 Gen 3, built-in S Pen, 5000mAh battery.",
        image:
          "https://ik.imagekit.io/tvz1mupab/samsungs24.jpg",
        price: 129999,
      },
    }),
    prisma.product.create({
      data: {
        name: "iPad Air M2",
        description:
          "Apple M2 chip, 11-inch Liquid Retina display, Apple Pencil Pro support.",
        image:
          "https://ik.imagekit.io/tvz1mupab/ipad.png",
        price: 59900,
      },
    }),
    prisma.product.create({
      data: {
        name: "JBL Charge 5",
        description:
          "Portable waterproof Bluetooth speaker, 20 hours playtime, power bank built-in.",
        image:
          "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800",
        price: 14999,
      },
    }),
    prisma.product.create({
      data: {
        name: "Levi's 511 Slim Jeans",
        description:
          "Classic slim fit, stretch denim, available in indigo and black.",
        image:
          "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800",
        price: 3499,
      },
    }),
    prisma.product.create({
      data: {
        name: "Nike Air Max 270",
        description:
          "Max Air cushioning, breathable mesh upper, ideal for all-day wear.",
        image:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
        price: 11995,
      },
    }),
    prisma.product.create({
      data: {
        name: "Kindle Paperwhite (11th Gen)",
        description:
          "6.8-inch display, adjustable warm light, 10 weeks battery, waterproof.",
        image:
          "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=800",
        price: 13999,
      },
    }),
    prisma.product.create({
      data: {
        name: "₹1 Test Product",
        description:
          "Dummy product priced at ₹1 for payment-flow and checkout testing. Do not use in production.",
        image:
          "https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=800",
        price: 1,
      },
    }),
  ]);
  console.log("  ✓ 13 products created\n");

  // ── Inventory ─────────────────────────────────────────────────────────────────
  // Delhi stock for iPhone & Sony WH-1000XM5 is already reduced by
  // Priya's two confirmed orders (1 unit each consumed).
  console.log("  Creating inventory...");
  await prisma.inventory.createMany({
    data: [
      // AirPods Pro
      { productId: airpods.id, warehouseId: mumbai.id,     totalStock:  2,  reservedStock: 0 }, // LOW — race-condition demo
      { productId: airpods.id, warehouseId: delhi.id,      totalStock: 50,  reservedStock: 3 },
      { productId: airpods.id, warehouseId: bangalore.id,  totalStock: 30,  reservedStock: 0 },
      { productId: airpods.id, warehouseId: chennai.id,    totalStock: 20,  reservedStock: 0 },
      { productId: airpods.id, warehouseId: hyderabad.id,  totalStock: 15,  reservedStock: 0 },
      { productId: airpods.id, warehouseId: kolkata.id,    totalStock: 10,  reservedStock: 0 },

      // MacBook Air M3
      { productId: macbook.id, warehouseId: mumbai.id,     totalStock:  5,  reservedStock: 0 },
      { productId: macbook.id, warehouseId: delhi.id,      totalStock:  3,  reservedStock: 0 },
      { productId: macbook.id, warehouseId: bangalore.id,  totalStock:  8,  reservedStock: 1 },
      { productId: macbook.id, warehouseId: chennai.id,    totalStock:  6,  reservedStock: 0 },
      { productId: macbook.id, warehouseId: hyderabad.id,  totalStock:  4,  reservedStock: 0 },

      // iPhone 16 Pro — Delhi was 15, Priya's order consumed 1 → 14
      { productId: iphone.id,  warehouseId: mumbai.id,     totalStock: 20,  reservedStock: 2 },
      { productId: iphone.id,  warehouseId: delhi.id,      totalStock: 14,  reservedStock: 0 },
      { productId: iphone.id,  warehouseId: bangalore.id,  totalStock: 18,  reservedStock: 0 },
      { productId: iphone.id,  warehouseId: chennai.id,    totalStock: 12,  reservedStock: 0 },
      { productId: iphone.id,  warehouseId: hyderabad.id,  totalStock:  9,  reservedStock: 0 },

      // Premium Cotton T-Shirt
      { productId: tShirt.id,  warehouseId: mumbai.id,     totalStock: 200, reservedStock: 5 },
      { productId: tShirt.id,  warehouseId: delhi.id,      totalStock: 150, reservedStock: 0 },
      { productId: tShirt.id,  warehouseId: bangalore.id,  totalStock: 175, reservedStock: 10 },
      { productId: tShirt.id,  warehouseId: chennai.id,    totalStock: 300, reservedStock: 0 },
      { productId: tShirt.id,  warehouseId: hyderabad.id,  totalStock: 250, reservedStock: 0 },
      { productId: tShirt.id,  warehouseId: kolkata.id,    totalStock: 200, reservedStock: 0 },

      // Allbirds Tree Runners
      { productId: sneakers.id, warehouseId: mumbai.id,    totalStock: 40,  reservedStock: 0 },
      { productId: sneakers.id, warehouseId: bangalore.id, totalStock: 25,  reservedStock: 2 },
      { productId: sneakers.id, warehouseId: hyderabad.id, totalStock: 30,  reservedStock: 0 },
      { productId: sneakers.id, warehouseId: chennai.id,   totalStock: 20,  reservedStock: 0 },

      // Sony WH-1000XM5 — Delhi was 12, Priya's order consumed 1 → 11
      { productId: headphones.id, warehouseId: mumbai.id,    totalStock:  1, reservedStock: 0 }, // 409 demo!
      { productId: headphones.id, warehouseId: delhi.id,     totalStock: 11, reservedStock: 0 },
      { productId: headphones.id, warehouseId: bangalore.id, totalStock:  8, reservedStock: 0 },
      { productId: headphones.id, warehouseId: hyderabad.id, totalStock:  6, reservedStock: 0 },
      { productId: headphones.id, warehouseId: kolkata.id,   totalStock:  5, reservedStock: 0 },

      // Samsung Galaxy S24 Ultra
      { productId: galaxyS24.id, warehouseId: mumbai.id,    totalStock: 15, reservedStock: 0 },
      { productId: galaxyS24.id, warehouseId: delhi.id,     totalStock: 10, reservedStock: 2 },
      { productId: galaxyS24.id, warehouseId: bangalore.id, totalStock: 12, reservedStock: 0 },
      { productId: galaxyS24.id, warehouseId: chennai.id,   totalStock:  8, reservedStock: 0 },
      { productId: galaxyS24.id, warehouseId: hyderabad.id, totalStock:  5, reservedStock: 0 },

      // iPad Air M2
      { productId: ipadAir.id, warehouseId: mumbai.id,    totalStock: 10, reservedStock: 0 },
      { productId: ipadAir.id, warehouseId: delhi.id,     totalStock:  8, reservedStock: 1 },
      { productId: ipadAir.id, warehouseId: bangalore.id, totalStock:  6, reservedStock: 0 },
      { productId: ipadAir.id, warehouseId: chennai.id,   totalStock:  5, reservedStock: 0 },
      { productId: ipadAir.id, warehouseId: hyderabad.id, totalStock:  4, reservedStock: 0 },

      // JBL Charge 5
      { productId: jblSpeaker.id, warehouseId: mumbai.id,    totalStock: 30, reservedStock: 0 },
      { productId: jblSpeaker.id, warehouseId: delhi.id,     totalStock: 25, reservedStock: 0 },
      { productId: jblSpeaker.id, warehouseId: bangalore.id, totalStock: 20, reservedStock: 0 },
      { productId: jblSpeaker.id, warehouseId: chennai.id,   totalStock: 15, reservedStock: 0 },
      { productId: jblSpeaker.id, warehouseId: hyderabad.id, totalStock: 18, reservedStock: 0 },
      { productId: jblSpeaker.id, warehouseId: kolkata.id,   totalStock: 12, reservedStock: 0 },

      // Levi's 511 Slim Jeans
      { productId: levisJeans.id, warehouseId: mumbai.id,    totalStock: 100, reservedStock: 5 },
      { productId: levisJeans.id, warehouseId: delhi.id,     totalStock:  80, reservedStock: 0 },
      { productId: levisJeans.id, warehouseId: bangalore.id, totalStock:  90, reservedStock: 0 },
      { productId: levisJeans.id, warehouseId: chennai.id,   totalStock:  70, reservedStock: 0 },
      { productId: levisJeans.id, warehouseId: kolkata.id,   totalStock:  60, reservedStock: 0 },

      // Nike Air Max 270
      { productId: nikeAirMax.id, warehouseId: mumbai.id,    totalStock: 50, reservedStock: 0 },
      { productId: nikeAirMax.id, warehouseId: delhi.id,     totalStock: 45, reservedStock: 0 },
      { productId: nikeAirMax.id, warehouseId: bangalore.id, totalStock: 35, reservedStock: 0 },
      { productId: nikeAirMax.id, warehouseId: chennai.id,   totalStock: 30, reservedStock: 0 },
      { productId: nikeAirMax.id, warehouseId: hyderabad.id, totalStock: 25, reservedStock: 0 },

      // Kindle Paperwhite
      { productId: kindle.id, warehouseId: mumbai.id,    totalStock: 25, reservedStock: 0 },
      { productId: kindle.id, warehouseId: delhi.id,     totalStock: 20, reservedStock: 0 },
      { productId: kindle.id, warehouseId: bangalore.id, totalStock: 15, reservedStock: 0 },
      { productId: kindle.id, warehouseId: hyderabad.id, totalStock: 10, reservedStock: 0 },
      { productId: kindle.id, warehouseId: kolkata.id,   totalStock:  8, reservedStock: 0 },

      // ₹1 Test Product
      { productId: testRupee.id, warehouseId: mumbai.id,    totalStock: 999, reservedStock: 0 },
      { productId: testRupee.id, warehouseId: delhi.id,     totalStock: 999, reservedStock: 0 },
      { productId: testRupee.id, warehouseId: bangalore.id, totalStock: 999, reservedStock: 0 },
      { productId: testRupee.id, warehouseId: hyderabad.id, totalStock: 999, reservedStock: 0 },
      { productId: testRupee.id, warehouseId: kolkata.id,   totalStock: 999, reservedStock: 0 },
    ],
  });
  console.log("  ✓ 63 inventory records created\n");

  // ── Users ─────────────────────────────────────────────────────────────────────
  console.log("  Creating users...");
  const [demoHash, priyaHash] = await Promise.all([
    bcrypt.hash("Demo@1234", 12),
    bcrypt.hash("Test@1234", 12),
  ]);

  // Demo user (pre-existing)
  const demoUser = await prisma.user.create({
    data: {
      name: "Allo Demo User",
      email: "demo@allo.dev",
      password: demoHash,
      selectedWarehouseId: mumbai.id,
    },
  });
  await prisma.address.create({
    data: {
      userId: demoUser.id,
      fullName: "Allo Demo User",
      phone: "9876543210",
      street: "123 Demo Street, Andheri West",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400053",
      country: "India",
      isDefault: true,
    },
  });

  // Priya Sharma (new user with orders)
  const priya = await prisma.user.create({
    data: {
      name: "Priya Sharma",
      email: "priya@bharatbazaar.in",
      password: priyaHash,
      selectedWarehouseId: delhi.id,
    },
  });
  const priyaAddress = await prisma.address.create({
    data: {
      userId: priya.id,
      fullName: "Priya Sharma",
      phone: "9123456780",
      street: "47 Lodhi Colony, Lodhi Road",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110003",
      country: "India",
      isDefault: true,
    },
  });
  console.log("  ✓ 2 users created\n");

  // ── Orders for Priya ──────────────────────────────────────────────────────────
  console.log("  Creating orders for Priya Sharma...");

  // Order 1 — iPhone 16 Pro x1, placed 10 days ago, DELIVERED 4 days ago
  const o1PlacedAt    = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
  const o1DeliveredAt = new Date(Date.now() -  4 * 24 * 60 * 60 * 1000);
  const o1ExpiresAt   = new Date(o1PlacedAt.getTime() + 10 * 60 * 1000);

  const res1 = await prisma.reservation.create({
    data: {
      userId:           priya.id,
      productId:        iphone.id,
      warehouseId:      delhi.id,
      deliveryAddressId: priyaAddress.id,
      quantity:         1,
      status:           "CONFIRMED",
      paymentStatus:    "PAID",
      expiresAt:        o1ExpiresAt,
      createdAt:        o1PlacedAt,
      updatedAt:        o1PlacedAt,
    },
  });
  await prisma.payment.create({
    data: {
      reservationId:      res1.id,
      razorpayOrderId:    fakeRpOrderId(1),
      razorpayPaymentId:  fakeRpPaymentId(1),
      razorpaySignature:  fakeRpSignature(1),
      amount:             119900,
      status:             "PAID",
      createdAt:          o1PlacedAt,
      updatedAt:          o1PlacedAt,
    },
  });
  const order1 = await prisma.order.create({
    data: {
      userId:        priya.id,
      reservationId: res1.id,
      addressId:     priyaAddress.id,
      totalAmount:   119900,
      status:        "DELIVERED",
      createdAt:     o1PlacedAt,
      updatedAt:     o1DeliveredAt,
      items: {
        create: { productId: iphone.id, quantity: 1, price: 119900 },
      },
    },
  });

  // Order 2 — Sony WH-1000XM5 x1, placed 3 days ago, SHIPPED (in transit)
  const o2PlacedAt  = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const o2ExpiresAt = new Date(o2PlacedAt.getTime() + 10 * 60 * 1000);

  const res2 = await prisma.reservation.create({
    data: {
      userId:           priya.id,
      productId:        headphones.id,
      warehouseId:      delhi.id,
      deliveryAddressId: priyaAddress.id,
      quantity:         1,
      status:           "CONFIRMED",
      paymentStatus:    "PAID",
      expiresAt:        o2ExpiresAt,
      createdAt:        o2PlacedAt,
      updatedAt:        o2PlacedAt,
    },
  });
  await prisma.payment.create({
    data: {
      reservationId:      res2.id,
      razorpayOrderId:    fakeRpOrderId(2),
      razorpayPaymentId:  fakeRpPaymentId(2),
      razorpaySignature:  fakeRpSignature(2),
      amount:             26990,
      status:             "PAID",
      createdAt:          o2PlacedAt,
      updatedAt:          o2PlacedAt,
    },
  });
  const order2 = await prisma.order.create({
    data: {
      userId:        priya.id,
      reservationId: res2.id,
      addressId:     priyaAddress.id,
      totalAmount:   26990,
      status:        "SHIPPED",
      createdAt:     o2PlacedAt,
      updatedAt:     o2PlacedAt,
      items: {
        create: { productId: headphones.id, quantity: 1, price: 26990 },
      },
    },
  });
  console.log("  ✓ 2 orders created\n");

  // ── Summary ────────────────────────────────────────────────────────────────────
  console.log("✅ Seed complete!\n");
  console.log("═════════════════════════════════════════════════════════════════");
  console.log("  WAREHOUSES (6)");
  console.log(`    Mumbai Hub          id: ${mumbai.id}`);
  console.log(`    Delhi Central       id: ${delhi.id}`);
  console.log(`    Bangalore Tech Park id: ${bangalore.id}`);
  console.log(`    Chennai Express     id: ${chennai.id}`);
  console.log(`    Hyderabad Hub       id: ${hyderabad.id}`);
  console.log(`    Kolkata Gateway     id: ${kolkata.id}`);
  console.log("");
  console.log("  PRODUCTS (13)");
  console.log("    Electronics : AirPods Pro, MacBook Air M3, iPhone 16 Pro,");
  console.log("                  Samsung Galaxy S24 Ultra, iPad Air M2");
  console.log("    Audio       : Sony WH-1000XM5, JBL Charge 5");
  console.log("    Apparel     : Premium Cotton T-Shirt, Allbirds Tree Runners,");
  console.log("                  Levi's 511 Slim Jeans, Nike Air Max 270");
  console.log("    Gadget      : Kindle Paperwhite 11th Gen");
  console.log("    Test        : ₹1 Test Product  (checkout/payment testing)");
  console.log("");
  console.log("  USERS");
  console.log("    demo@allo.dev       / Demo@1234   (warehouse: Mumbai)");
  console.log("    priya@bharatbazaar.in   / Test@1234   (warehouse: Delhi)");
  console.log("");
  console.log("  PRIYA'S ORDERS");
  console.log(`    Order 1  id: ${order1.id}`);
  console.log(`             iPhone 16 Pro x1  →  Rs.1,19,900  [DELIVERED]`);
  console.log(`    Order 2  id: ${order2.id}`);
  console.log(`             Sony WH-1000XM5 x1  →  Rs.26,990  [SHIPPED]`);
  console.log("");
  console.log("  RACE-CONDITION DEMO");
  console.log("    Sony WH-1000XM5 @ Mumbai  →  only 1 unit left!");
  console.log("    AirPods Pro      @ Mumbai  →  only 2 units left!");
  console.log("═════════════════════════════════════════════════════════════════");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
