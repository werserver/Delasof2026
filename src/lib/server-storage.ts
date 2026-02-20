/**
 * Simple server-side storage for global config and CSV files
 * All data is shared globally across all users/sessions
 */

// In development, the server might run on a different port (3001)
// In production, it usually runs on the same port as the frontend
const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" 
  ? (window.location.port === "3001" ? "/" : "http://localhost:3001/")
  : "/";

/**
 * Load global config from server
 */
export async function loadConfigFromServer() {
  try {
    const response = await fetch(`${API_BASE}config`);
    if (response.ok) {
      const result = await response.json();
      return result.data;
    }
  } catch (error) {
    console.error("Error loading config from server:", error);
  }
  return null;
}

/**
 * Save global config to server
 */
export async function saveConfigToServer(config: any): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    return response.ok;
  } catch (error) {
    console.error("Error saving config to server:", error);
    return false;
  }
}

/**
 * Load CSV for a category from server
 */
export async function loadCsvFromServer(category: string): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE}csv/${encodeURIComponent(category)}`);
    if (response.ok) {
      const result = await response.json();
      return result.data;
    }
  } catch (error) {
    console.error(`Error loading CSV for ${category}:`, error);
  }
  return null;
}

/**
 * Save/Upload CSV for a category to server
 */
export async function saveCsvToServer(category: string, csvContent: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}csv/${encodeURIComponent(category)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csvContent }),
    });
    return response.ok;
  } catch (error) {
    console.error(`Error saving CSV for ${category}:`, error);
    return false;
  }
}

/**
 * Delete CSV for a category from server
 */
export async function deleteCsvFromServer(category: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}csv/${encodeURIComponent(category)}`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error(`Error deleting CSV for ${category}:`, error);
    return false;
  }
}
