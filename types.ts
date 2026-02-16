
export interface StockItem {
  id: string;
  name: string;
  sku: string;
  system: string;
  category: string;
  stockLevel: number;
  minStock: number;
  warehouseLocation?: string;
  manufacturer?: string;
  isAkku?: boolean;
  capacityAh?: number;
  notes?: string;
  lastUpdated?: number;
  lieferscheinNr?: string;
  status?: string;
  packUnits?: number; // New field for packaging units
}

export interface ReceiptHeader {
  batchId: string;
  lieferscheinNr: string;
  bestellNr?: string; // Optional Order Number
  lieferdatum: string;
  lieferant: string;
  status: string;
  timestamp: number;
  itemCount: number;
  warehouseLocation?: string;
  createdByName?: string; // Tracks who entered the goods
}

export interface ReceiptItem {
  id: string; // Unique ID for this line item
  batchId: string; // FK to Header
  sku: string; // FK to Master Data
  name: string; // Snapshot of name
  quantity: number;
  targetLocation: string;
  isDamaged?: boolean;
  issueNotes?: string;
}

export interface ReceiptComment {
  id: string;
  batchId: string;
  userId: string;
  userName: string;
  timestamp: number;
  type: 'note' | 'email' | 'call';
  message: string;
}

export type ViewMode = 'grid' | 'list';
export type Theme = 'light' | 'dark' | 'soft';
export type ActiveModule = 'dashboard' | 'inventory' | 'create-order' | 'goods-receipt' | 'receipt-management' | 'order-management' | 'suppliers' | 'settings' | 'documentation' | 'stock-logs' | 'debug';

export const TRANSACTION_STATUS_OPTIONS = [
  'In Bearbeitung', 
  'Geprüft', 
  'Projekt',
  'Quarantäne', 
  'Beschädigt', 
  'Übermenge', 
  'Untermenge', 
  'Teillieferung', 
  'Reklamation', 
  'Abgelehnt', 
  'Rücklieferung', 
  'Falsch geliefert',
  'Gebucht',
  'Storniert'
];

// --- Purchase Order Types (Process-Driven Workflow) ---

export type PurchaseOrderStatus = 'Offen' | 'Teilweise geliefert' | 'Abgeschlossen' | 'Storniert' | 'Projekt' | 'Lager';

export interface PurchaseOrderItem {
  sku: string;
  name: string;
  quantityExpected: number;
  quantityReceived: number;
  isAddedLater?: boolean; // Item added after initial creation
  isDeleted?: boolean;    // Item removed ("Soft Delete") during edit
}

export interface PurchaseOrder {
  id: string;
  supplier: string;
  status: PurchaseOrderStatus;
  dateCreated: string;
  expectedDeliveryDate?: string;
  items: PurchaseOrderItem[];
  pdfUrl?: string; // URL to the generated or uploaded PDF
  orderConfirmationUrl?: string; // Link to Order Confirmation (Bestellbestätigung) e.g. SharePoint
  isArchived: boolean; // POs are never deleted, just archived
  linkedReceiptId?: string; // Reference to the Master Receipt
  isForceClosed?: boolean; // Flag to indicate if the order was short-closed (closed with missing items)
}

// --- New Procure-to-Pay Data Structures ---

export interface DeliveryLogItem {
  sku: string;
  receivedQty: number; // Total physical count (Accepted + Rejected)
  
  // Split-Math (New Logistics)
  quantityAccepted: number; // Good / Stock
  quantityRejected: number; // Bad / Returned / Quarantined
  
  // Return Logistics
  rejectionReason?: 'Damaged' | 'Wrong' | 'Overdelivery' | 'Other';
  returnCarrier?: string;
  returnTrackingId?: string;

  // Legacy / Flags (Kept for backward compatibility)
  damageFlag: boolean;
  manualAddFlag: boolean;
  
  // Snapshot Fields (History Correction)
  orderedQty?: number;
  previousReceived?: number;
  offen?: number;
  zuViel?: number;
}

export interface DeliveryLog {
  id: string;
  date: string;
  lieferscheinNr: string;
  items: DeliveryLogItem[];
  isStorniert?: boolean;
}

export type ReceiptMasterStatus = 'Offen' | 'Abgeschlossen' | 'In Prüfung' | 'Gebucht' | 'Teillieferung' | 'Schaden' | 'Abgelehnt' | 'Falsch geliefert' | 'Schaden + Falsch' | 'Übermenge' | 'Wartet auf Prüfung';

export interface ReceiptMaster {
  id: string;
  poId: string;
  status: ReceiptMasterStatus;
  deliveries: DeliveryLog[];
}

// --- Case Management / Ticketing Types (Phase 4) ---

export type TicketStatus = 'Open' | 'Closed';
export type TicketPriority = 'Normal' | 'High' | 'Urgent';
export type TicketMessageType = 'user' | 'system';

export interface TicketMessage {
  id: string;
  author: string; // Name of user or 'System'
  text: string;
  timestamp: number;
  type: TicketMessageType;
  label?: 'note' | 'email' | 'call'; // Message category label
}

export interface Ticket {
  id: string;
  receiptId: string; // FK to ReceiptHeader.batchId
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  messages: TicketMessage[];
}

// --- Stock Logging Types ---

export interface AuditEntry {
  id: string;
  event: string;
  user: string;
  timestamp: number;
  ip: string;
  details: Record<string, any>;
}

export interface StockLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  itemId: string;
  itemName: string;
  action: 'add' | 'remove';
  quantity: number;
  warehouse: string;
  source?: string;
  context?: 'normal' | 'project' | 'manual' | 'po-normal' | 'po-project';
  rejectionInfo?: string; // New: Reason/Context for rejection if applicable
}

// --- Data Import Types (Legacy System Support) ---

export interface RawGermanItem {
  "Artikel Bezeichnung": string;
  "Artikel Nummer": string;
  "Kapazität in Ah": number | null;
  "Anzahl": number;
  "Mindestbestand": number | null;
  "System": string | null;
  "Hersteller/Lieferant": string | null;
  "Geändert": string | null;
  "Geändert von": string | null;
  "Objekt": string | null; // Maps to Location
  "Bemerkungen": string | null;
  "Elementtyp": string;
  "Pfad": string;
}