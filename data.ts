
import { StockItem, ReceiptHeader, ReceiptItem, ReceiptComment, PurchaseOrder, Ticket, ReceiptMaster } from './types';

// Raw data structure interface matching the JSON provided
interface RawStockItem {
  "Artikel Bezeichnung": string;
  "Artikel Nummer": string;
  "Kapazität in Ah": number | null;
  "Anzahl": number;
  "Mindestbestand": number | null;
  "System": string | null;
  "Hersteller/Lieferant": string | null;
  "Geändert": string | null;
  "Geändert von": string | null;
  "Objekt": string | null;
  "Bemerkungen": string | null;
  "Elementtyp": string;
  "Pfad": string;
}

// ------------------------------------------------------------------
// DATA INTEGRATION
// ------------------------------------------------------------------

const FULL_INVENTORY: RawStockItem[] = [
    { 
        "Artikel Bezeichnung": "Polkappe für Bleiakku M5/M6 Rot", 
        "Artikel Nummer": "4000069", 
        "System": "Service", 
        "Hersteller/Lieferant": "Battery Kutter",
        "Kapazität in Ah": 0, "Anzahl": 100, "Mindestbestand": 10, "Geändert": null, "Geändert von": null, "Objekt": null, "Bemerkungen": null, "Elementtyp": "Item", "Pfad": ""
    },
    { 
        "Artikel Bezeichnung": "SB12-45V0", 
        "Artikel Nummer": "2030855", 
        "System": "Service", 
        "Hersteller/Lieferant": "SUN / Battery Kutter",
        "Kapazität in Ah": 45, "Anzahl": 20, "Mindestbestand": 5, "Geändert": null, "Geändert von": null, "Objekt": null, "Bemerkungen": null, "Elementtyp": "Item", "Pfad": ""
    },
    { 
        "Artikel Bezeichnung": "SB12-2.3V0", 
        "Artikel Nummer": "2037507", 
        "System": "Service", 
        "Hersteller/Lieferant": "SUN / Battery-Kutter",
        "Kapazität in Ah": 2.3, "Anzahl": 50, "Mindestbestand": 10, "Geändert": null, "Geändert von": null, "Objekt": null, "Bemerkungen": null, "Elementtyp": "Item", "Pfad": ""
    },
    { 
        "Artikel Bezeichnung": "Brandmeldeleitung JY-(st)Y ", 
        "Artikel Nummer": "UnBEKANNT", 
        "System": "Material", 
        "Hersteller/Lieferant": "Unbekannt",
        "Kapazität in Ah": 0, "Anzahl": 200, "Mindestbestand": 50, "Geändert": null, "Geändert von": null, "Objekt": null, "Bemerkungen": null, "Elementtyp": "Item", "Pfad": ""
    },
    { 
        "Artikel Bezeichnung": "Transport Box Batterien Rot", 
        "Artikel Nummer": "Unbekannt", 
        "System": "Material", 
        "Hersteller/Lieferant": "Würth",
        "Kapazität in Ah": 0, "Anzahl": 15, "Mindestbestand": 2, "Geändert": null, "Geändert von": null, "Objekt": null, "Bemerkungen": null, "Elementtyp": "Item", "Pfad": ""
    }
];

// Helper to parse ASP.NET AJAX Date format "/Date(1732871995000)/"
const parseAspDate = (dateStr: string | null): number | undefined => {
  if (!dateStr) return undefined;
  const match = dateStr.match(/\/Date\((\d+)\)\//);
  return match ? parseInt(match[1]) : undefined;
};

export const MOCK_ITEMS: StockItem[] = FULL_INVENTORY.map((raw, index) => {
  return {
    id: raw["Artikel Nummer"] || `generated-id-${index}`,
    name: raw["Artikel Bezeichnung"],
    sku: raw["Artikel Nummer"],
    system: raw["System"] || "Sonstiges",
    category: "Material",
    stockLevel: raw["Anzahl"],
    minStock: raw["Mindestbestand"] || 0,
    warehouseLocation: raw["Objekt"] || undefined,
    manufacturer: raw["Hersteller/Lieferant"] || undefined,
    isAkku: raw["Kapazität in Ah"] !== null && raw["Kapazität in Ah"] !== undefined && raw["Kapazität in Ah"] > 0,
    capacityAh: raw["Kapazität in Ah"] || undefined,
    notes: raw["Bemerkungen"] || undefined,
    lastUpdated: parseAspDate(raw["Geändert"]),
    status: "Active"
  };
});

export const MOCK_RECEIPT_HEADERS: ReceiptHeader[] = [
    {
        batchId: 'b-101',
        lieferscheinNr: 'LS-2024-001',
        bestellNr: 'BEST-992',
        lieferdatum: '2024-05-15',
        lieferant: 'Battery Kutter',
        status: 'Gebucht',
        timestamp: Date.now() - 10000000,
        itemCount: 2,
        warehouseLocation: 'Akku Service',
        createdByName: 'Robert Dallmann'
    },
    {
        batchId: 'b-102',
        lieferscheinNr: '77766',
        bestellNr: 'PO-ABUS-22',
        lieferdatum: '2024-06-20',
        lieferant: 'ABUS',
        status: 'Reklamation',
        timestamp: Date.now() - 20000000,
        itemCount: 1,
        warehouseLocation: 'Sicherheitstechnik',
        createdByName: 'Robert Dallmann'
    }
];

export const MOCK_RECEIPT_ITEMS: ReceiptItem[] = [
    {
        id: 'ri-1',
        batchId: 'b-101',
        sku: '4000117',
        name: 'Polkappe für Bleiakku M6/M8 Schwarz',
        quantity: 10,
        targetLocation: 'Akku Service'
    },
    {
        id: 'ri-2',
        batchId: 'b-101',
        sku: '4000118',
        name: 'Polkappe für Bleiakku M6/M8 Rot',
        quantity: 10,
        targetLocation: 'Akku Service'
    }
];

export const MOCK_COMMENTS: ReceiptComment[] = [
    {
        id: 'c-1',
        batchId: 'b-101',
        userId: 'u1',
        userName: 'System',
        timestamp: Date.now() - 10000000,
        type: 'note',
        message: 'Initialer Import'
    }
];

// ------------------------------------------------------------------
// PROCESS-DRIVEN WORKFLOW MOCK DATA (PHASE 1)
// ------------------------------------------------------------------

export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
    {
        id: 'PO-2026-BK01',
        supplier: 'Battery Kutter',
        status: 'Offen',
        dateCreated: '2026-02-25',
        expectedDeliveryDate: '2026-03-05',
        isArchived: false,
        items: [
            {
                sku: '4000069',
                name: 'Polkappe für Bleiakku M5/M6 Rot',
                quantityExpected: 10,
                quantityReceived: 0
            },
            {
                sku: '2030855',
                name: 'SB12-45V0',
                quantityExpected: 4,
                quantityReceived: 0
            },
            {
                sku: '2037507',
                name: 'SB12-2.3V0',
                quantityExpected: 10,
                quantityReceived: 0
            }
        ]
    },
    {
        id: 'PO-2026-WU02',
        supplier: 'Würth',
        status: 'Offen',
        dateCreated: '2026-02-20',
        expectedDeliveryDate: '2026-03-01',
        isArchived: false,
        items: [
            {
                sku: 'UnBEKANNT', // Matches inventory case exactly
                name: 'Brandmeldeleitung JY-(st)Y ',
                quantityExpected: 50,
                quantityReceived: 0
            },
            {
                sku: 'Unbekannt', // Matches inventory case exactly
                name: 'Transport Box Batterien Rot',
                quantityExpected: 5,
                quantityReceived: 0
            }
        ]
    }
];

export const MOCK_RECEIPT_MASTERS: ReceiptMaster[] = [];

// ------------------------------------------------------------------
// CASE MANAGEMENT MOCK DATA (PHASE 4)
// ------------------------------------------------------------------

export const MOCK_TICKETS: Ticket[] = [
    {
        id: 't-1',
        receiptId: 'b-101', // Linked to LS-2024-001
        subject: 'Falsche Menge geliefert',
        status: 'Open',
        priority: 'Normal',
        messages: [
            {
                id: 'msg-1',
                author: 'System',
                text: 'Ticket erstellt am 30.01.2026.',
                timestamp: Date.now() - 10000000,
                type: 'system'
            },
            {
                id: 'msg-2',
                author: 'Admin User',
                text: 'Es fehlen 2 Akkus aus der Lieferung. Lieferschein sagt 10, Paket enthielt 8.',
                timestamp: Date.now() - 9000000,
                type: 'user'
            }
        ]
    },
    {
        id: 't-2',
        receiptId: 'b-102', // Linked to 77766 (ABUS)
        subject: 'Ware beschädigt',
        status: 'Closed',
        priority: 'High',
        messages: [
            {
                id: 'msg-3',
                author: 'Admin User',
                text: 'Karton war aufgerissen.',
                timestamp: Date.now() - 15000000,
                type: 'user'
            },
            {
                id: 'msg-4',
                author: 'Robert Dallmann',
                text: 'Geklärt mit Lieferant. Gutschrift erhalten.',
                timestamp: Date.now() - 1000000,
                type: 'user'
            }
        ]
    },
    // Requested Sample Ticket
    {
        id: 't-3',
        receiptId: 'b-101', 
        subject: 'Beschädigte Ware',
        status: 'Open',
        priority: 'High',
        messages: [
            {
                id: 'msg-new-1',
                author: 'System',
                text: 'Ticket automatisch erstellt bei Warenprüfung.',
                timestamp: Date.now(),
                type: 'system'
            }
        ]
    }
];
