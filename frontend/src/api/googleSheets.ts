const API_URL = "https://script.google.com/macros/s/AKfycbxjbjv8ewdZnTxT07uMhPi_ZM7lr60Wrl8T0ApCv-9zSFREjQdclx19w890MSGPSOEU/exec";

export const sheetsApi = {
  /**
   * Fetch all records from a specific sheet
   */
  async getSheetData(sheetName: string) {
    try {
      const response = await fetch(`${API_URL}?sheetName=${sheetName}`, {
        redirect: 'follow',
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data.data;
    } catch (error: any) {
      console.error(`Error fetching from ${sheetName}:`, error);
      throw new Error(`Failed to load data: ${error.message}`);
    }
  },

  /**
   * Append a new row to a specific sheet
   */
  async createRecord(sheetName: string, payload: any[]) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'CREATE',
          sheetName,
          payload
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data;
    } catch (error: any) {
      console.error(`Error creating record in ${sheetName}:`, error);
      throw new Error(`Save failed: ${error.message}`);
    }
  }
};
