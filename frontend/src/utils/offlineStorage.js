// Offline storage for pending transactions using IndexedDB

const DB_NAME = 'FinancialHubDB';
const DB_VERSION = 1;
const TRANSACTION_STORE = 'offline_transactions';

class OfflineStorage {
    constructor() {
        this.db = null;
        this.initDB();
    }

    // Initialize IndexedDB
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                reject('IndexedDB initialization failed');
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                if (!db.objectStoreNames.contains(TRANSACTION_STORE)) {
                    const objectStore = db.createObjectStore(TRANSACTION_STORE, {
                        keyPath: 'id',
                        autoIncrement: true
                    });

                    objectStore.createIndex('timestamp', 'timestamp', { unique: false });
                    objectStore.createIndex('synced', 'synced', { unique: false });
                }
            };
        });
    }

    // Add transaction to offline queue
    async addOfflineTransaction(transaction) {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([TRANSACTION_STORE], 'readwrite');
            const store = tx.objectStore(TRANSACTION_STORE);

            const transactionWithMeta = {
                ...transaction,
                timestamp: new Date().toISOString(),
                synced: false
            };

            const request = store.add(transactionWithMeta);

            request.onsuccess = () => {
                console.log('Transaction saved offline:', transactionWithMeta);
                resolve(request.result);
            };

            request.onerror = () => {
                reject('Failed to save offline transaction');
            };
        });
    }

    // Get all unsynced transactions
    async getUnsyncedTransactions() {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([TRANSACTION_STORE], 'readonly');
            const store = tx.objectStore(TRANSACTION_STORE);
            const index = store.index('synced');
            
            const request = index.getAll(false);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject('Failed to get unsynced transactions');
            };
        });
    }

    // Mark transaction as synced
    async markAsSynced(id) {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([TRANSACTION_STORE], 'readwrite');
            const store = tx.objectStore(TRANSACTION_STORE);
            
            const request = store.get(id);

            request.onsuccess = () => {
                const transaction = request.result;
                if (transaction) {
                    transaction.synced = true;
                    const updateRequest = store.put(transaction);

                    updateRequest.onsuccess = () => {
                        resolve();
                    };

                    updateRequest.onerror = () => {
                        reject('Failed to update sync status');
                    };
                }
            };

            request.onerror = () => {
                reject('Failed to get transaction');
            };
        });
    }

    // Delete synced transaction
    async deleteSyncedTransaction(id) {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([TRANSACTION_STORE], 'readwrite');
            const store = tx.objectStore(TRANSACTION_STORE);
            
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject('Failed to delete transaction');
            };
        });
    }

    // Clear all synced transactions
    async clearSyncedTransactions() {
        if (!this.db) await this.initDB();

        const synced = await this.getSyncedTransactions();
        
        for (const transaction of synced) {
            await this.deleteSyncedTransaction(transaction.id);
        }
    }

    // Get synced transactions
    async getSyncedTransactions() {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([TRANSACTION_STORE], 'readonly');
            const store = tx.objectStore(TRANSACTION_STORE);
            const index = store.index('synced');
            
            const request = index.getAll(true);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject('Failed to get synced transactions');
            };
        });
    }
}

const offlineStorage = new OfflineStorage();
export default offlineStorage;
