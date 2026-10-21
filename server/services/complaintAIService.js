// Allowed priority values
const PRIORITY_ENUM = ['Urgent', 'High', 'Medium', 'Low'];

/**
 * Build the request payload for the external AI service based on a complaint document.
 * @param {Object} complaint Mongoose complaint document (populated fields optional).
 * @returns {Object} payload matching the contract described in the spec.
 */
function buildPayload(complaint) {
  return {
    complaintId: complaint._id.toString(),
    title: complaint.title,
    text: complaint.description,
    location: {
      building: complaint.location?.building || '',
      room: complaint.location?.room || '',
    },
    suggestedDepartment: complaint.department || null,
  };
}

/**
 * Validate the AI response against allowed fields and enums.
 * Returns the parsed data if valid, otherwise throws.
 * @param {Object} data JSON response from AI service.
 */
function validateResponse(data) {
  if (typeof data !== 'object' || data === null) {
    throw new Error('AI response is not an object');
  }
  // Optional fields may be undefined or null – we only validate enums when present
  if (data.priority && !PRIORITY_ENUM.includes(data.priority)) {
    throw new Error(`Invalid priority value from AI: ${data.priority}`);
  }
  // Additional optional validation can be added here (e.g., category strings)
  return data;
}

/**
 * Calls the external AI FastAPI service to analyze a complaint.
 * The function is tolerant of service unavailability – it never throws for callers;
 * instead it returns a structured result indicating success or failure.
 *
 * @param {Object} complaint Mongoose complaint document (must have required fields).
 * @returns {Promise<{success:boolean, data?:Object, error?:string}>}
 */
async function analyzeComplaint(complaint) {
  const baseUrl = process.env.AI_SERVICE_URL;
  if (!baseUrl) {
    // Service not configured – keep analysis pending without error.
    return { success: false, error: 'AI_SERVICE_URL not configured' };
  }

  const payload = buildPayload(complaint);
  const controller = new AbortController();
  const timeoutMs = 8000; // 8 seconds timeout as a reasonable default
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl.replace(/\/*$/, '')}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`AI service responded with status ${response.status}: ${text}`);
    }
    const data = await response.json();
    const validated = validateResponse(data);
    return { success: true, data: validated };
  } catch (err) {
    // Distinguish abort (timeout) from other network errors.
    const message = err.name === 'AbortError' ? 'AI request timed out' : err.message;
    return { success: false, error: message };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { analyzeComplaint };
