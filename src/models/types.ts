// src/models/types.ts
import { User as PrismaUser, Product as PrismaProduct, State as PrismaState } from '@prisma/client';
export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  shortDesc: string;
  imgUrl: string;
  mfgName: string;
  longDesc: string;
}

export interface Address {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  billing: Address;
  shipping: Address;
}

export interface State {
  id: number;
  abbr: string;
  state: string;
}

export interface ShippingType {
  id: number;
  value: string;
  label: string;
  price: number;
}


// Response interfaces
export interface ProductsResponse {
  data: {
    products: Product[];
  };
}

export interface ProductResponse {
  data: {
    product: Product;
  };
}

export interface CategoriesResponse {
  data: {
    categories: string[];
  };
}

export interface HomeCategoriesResponse {
  data: {
    categories: {
      name: string;
      imgUrl: string;
      productCount: number;
    }[];
  };
}

export interface UserResponse {
  data: {
    user: User | {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export interface StatesResponse {
  data: {
    states: State[] | {
      abbr: string;
      state: string;
    }[];
  };
}

export interface AuthRequest {
  email: string;
  password: string;
}
