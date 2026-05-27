

export type ReservationStatus = "PENDING" | "CONFIRMED" | "RELEASED" | "EXPIRED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type OrderStatus = "PLACED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface User {
  id: string;
  name: string;
  email: string;
  selectedWarehouseId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressPayload {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault?: boolean;
}

export interface Warehouse {
  id: string;
  name: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseWithInventory extends Warehouse {
  inventories: InventoryWithProduct[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  price: string; 
  createdAt: string;
  updatedAt: string;
}

export interface ProductWithInventory extends Product {
  inventories: InventoryWithWarehouse[];
}

export interface Inventory {
  id: string;
  productId: string;
  warehouseId: string;
  totalStock: number;
  reservedStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryWithProduct extends Inventory {
  product: Product;
}

export interface InventoryWithWarehouse extends Inventory {
  warehouse: Warehouse;
}

export const availableStock = (inv: Inventory): number =>
  Math.max(0, inv.totalStock - inv.reservedStock);

export interface Reservation {
  id: string;
  userId: string;
  productId: string;
  warehouseId: string;
  deliveryAddressId: string;
  quantity: number;
  status: ReservationStatus;
  paymentStatus: PaymentStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationWithDetails extends Reservation {
  product: Product;
  warehouse: Warehouse;
  deliveryAddress: Address;
  payment?: Payment | null;
}

export interface ReservationListItem extends Reservation {
  product: Product;
  warehouse: Warehouse;
  payment: Payment | null;
}

export interface CreateReservationPayload {
  productId: string;
  quantity: number;
  deliveryAddressId: string;
}

export interface ConfirmReservationPayload {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface Payment {
  id: string;
  reservationId: string;
  razorpayOrderId: string;
  amount: string; 
  status: PaymentStatus;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

export interface CreatePaymentOrderPayload {
  reservationId: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface Order {
  id: string;
  userId: string;
  reservationId: string | null;
  deliveryAddressId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  totalAmount: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  product: Product;
}

export interface OrderWithDetails extends Order {
  items: OrderItem[];
  deliveryAddress: Address;
  reservation: Reservation | null;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  statusCode: number;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface SelectOption {
  value: string;
  label: string;
}

export type SortOrder = "asc" | "desc";

export interface ProductFilters {
  search: string;
  sortBy: "name" | "price" | "stock";
  sortOrder: SortOrder;
  warehouseId?: string;
}
