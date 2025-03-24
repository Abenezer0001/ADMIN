export interface Table {
  id: string;
  name: string;
  numberOfGuests?: number;
  tableType: string;
  restaurant: string;
  zone: string;
}

export interface TableFormData {
  name: string;
  numberOfGuests?: number;
  tableType: string;
  restaurant: string;
  zone: string;
}

export interface TableListResponse {
  tables: Table[];
  total: number;
}
