import { db } from '@/lib/db';

class SyncService {
  private isSyncing = false;

  async syncPendingOrders() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const pendingOrders = await db.orders.where('status').equals('PENDING_SYNC').toArray();
      
      if (pendingOrders.length === 0) {
        this.isSyncing = false;
        return;
      }

      console.log(`[SyncService] Found ${pendingOrders.length} pending orders. Syncing...`);

      for (const order of pendingOrders) {
        // Here we simulate the actual sync to Supabase
        // In a real scenario, you'd insert the order and items into Supabase
        
        // Simulating network request to Supabase
        // const { error } = await supabase.from('orders').insert({ ... })
        await new Promise(resolve => setTimeout(resolve, 500)); 

        // Se sucesso:
        await db.orders.update(order.id, { status: 'SYNCED' });
        console.log(`[SyncService] Order ${order.id} synced successfully!`);
      }

    } catch (error) {
      console.error('[SyncService] Sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  startAutoSync(intervalMs: number = 10000) {
    setInterval(() => {
      if (navigator.onLine) {
        this.syncPendingOrders();
      }
    }, intervalMs);
  }
}

export const syncService = new SyncService();
