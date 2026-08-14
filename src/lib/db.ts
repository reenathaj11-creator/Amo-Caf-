import Dexie, { type Table } from 'dexie';

export interface LocalOrder {
  id: string;
  company_id: string; // Para garantir que dados não vazem
  items: any[];
  subtotal: number;
  discount: number;
  total: number;
  payment_method: string;
  cash_received?: number;
  change?: number;
  status: 'PENDING_SYNC' | 'SYNCED';
  created_at: string;
}

export class POSDatabase extends Dexie {
  orders!: Table<LocalOrder>;

  constructor() {
    super('amocafe_pos_db');
    this.version(1).stores({
      orders: 'id, company_id, status, created_at' // Primary key and indexed props
    });
  }
}

export const db = new POSDatabase();
