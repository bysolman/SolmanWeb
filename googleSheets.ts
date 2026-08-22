import { getAccessToken } from './googleAuth';

export interface SheetCustomerRow {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  timestamp: string;
  status: string;
}

export const googleSheetsService = {
  /**
   * Create a new Google Spreadsheet named "Customer CRM & Inquiry Database"
   */
  async createCustomerSpreadsheet(title: string = "Customer CRM & Inquiry Database"): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
    const token = await getAccessToken();
    if (!token) throw new Error("Google access token not available. Please sign in with Google.");

    const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          title: title
        },
        sheets: [
          {
            properties: {
              title: "Inquiries & Leads",
              gridProperties: {
                rowCount: 1000,
                columnCount: 7,
                frozenRowCount: 1
              }
            }
          }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Failed to create Google Spreadsheet');
    }

    const data = await response.json();
    const spreadsheetId = data.spreadsheetId;
    const spreadsheetUrl = data.spreadsheetUrl;

    // Initialize header row: [Customer Name, Email, Phone, Service, Message, Timestamp, Status]
    await this.appendRows(spreadsheetId, [
      ["Customer Name", "Email", "Phone", "Service", "Message", "Timestamp", "Status"]
    ], "Inquiries & Leads!A1");

    return { spreadsheetId, spreadsheetUrl };
  },

  /**
   * Append rows to a Google Spreadsheet
   */
  async appendRows(spreadsheetId: string, rows: string[][], range: string = "Inquiries & Leads!A1"): Promise<any> {
    const token = await getAccessToken();
    if (!token) throw new Error("Google access token not available. Please sign in with Google.");

    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: rows
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Failed to append rows to Google Sheet');
    }

    return await response.json();
  },

  /**
   * Read values from a Google Spreadsheet
   */
  async getSpreadsheetValues(spreadsheetId: string, range: string = "Inquiries & Leads!A1:G100"): Promise<string[][]> {
    const token = await getAccessToken();
    if (!token) throw new Error("Google access token not available. Please sign in with Google.");

    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Failed to read Google Spreadsheet');
    }

    const data = await response.json();
    return data.values || [];
  }
};
