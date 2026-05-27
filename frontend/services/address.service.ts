import { api } from "./api";
import type { Address, CreateAddressPayload } from "@/types";

export const addressService = {
  async getAll(): Promise<Address[]> {
    const { data } = await api.get<{ data: { addresses: Address[] } }>("/addresses");
    return data.data.addresses;
  },

  async create(payload: CreateAddressPayload): Promise<Address> {
    const { data } = await api.post<{ data: { address: Address } }>("/addresses", payload);
    return data.data.address;
  },

  async update(id: string, payload: Partial<CreateAddressPayload>): Promise<Address> {
    const { data } = await api.patch<{ data: { address: Address } }>(
      `/addresses/${id}`,
      payload
    );
    return data.data.address;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/addresses/${id}`);
  },
};
