export interface Stall {
  id: number;
  ownerId: number;
  name: string;
  category: string | null;
  location: string | null;
  description: string | null;
  avgRating: number;
  reviewCount: number;
  isPopular?: boolean;
}

export interface StallQueryParams {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface CreateStallDto {
  name: string;
  category?: string;
  location?: string;
  description?: string;
}

export interface UpdateStallDto {
  name?: string;
  category?: string;
  location?: string;
  description?: string;
}

export interface MenuItem {
  id: number;
  stallId: number;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface CreateMenuItemDto {
  stallId: number;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface UpdateMenuItemDto {
  name?: string;
  price?: number;
  isAvailable?: boolean;
}
