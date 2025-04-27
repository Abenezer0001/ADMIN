export interface Table {
  id: string;
  name: string;
  numberOfGuests?: number;
  tableType: {
    id: string;
    name: string;
    description?: string;
  };
  restaurant: string;
  zone: string;
}

export interface TableFormData {
  name: string;
  numberOfGuests?: number;
  tableTypeId: string;
  restaurant: string;
  zone: string;
}

export interface TableListResponse {
  tables: Table[];
  total: number;
}

export interface TableType {
  _id: string;
  id?: string; // For compatibility
  name: string;
  description?: string;
  restaurantId: string;
}
