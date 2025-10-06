const SHEET_NAME = 'Submissions';
const SECRET_KEY = 'baboo-contact-20241006-cp2v3l8s';
const ALLOWED_ORIGIN = 'https://baboostories.com';

function doGet() {
  return buildResponse(200, {
    success: true,
    message: 'Baboo Stories contact endpoint is running.',
  });
}

function doPost(e) {
  try {
    const data = parseRequestData(e);

    if (!data) {
      return buildResponse(400, {
        success: false,
        message: 'No data received.',
      });
    }

    if (data.secret !== SECRET_KEY) {
      return buildResponse(403, {
        success: false,
        message: 'Invalid secret provided.',
      });
    }

    const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error(`Worksheet "${SHEET_NAME}" not found.`);
    }

    const name = sanitizeValue(data.name);
    const email = sanitizeValue(data.email);

    if (!name || !email) {
      return buildResponse(400, {
        success: false,
        message: 'Name and email are required.',
      });
    }

    sheet.appendRow([
      new Date(),
      name,
      email,
      sanitizeValue(data.childrenAges),
      sanitizeValue(data.expectations),
      sanitizeValue(data.referralSource),
      sanitizeValue(data.userAgent),
      (e.context && e.context.clientIp) || '',
      data.secret || '',
    ]);

    return buildResponse(200, {
      success: true,
      message: 'Submission stored successfully.',
    });
  } catch (error) {
    return buildResponse(500, {
      success: false,
      message: error.message,
    });
  }
}

function buildResponse(statusCode, payload) {
  const output = ContentService.createTextOutput(JSON.stringify(payload));
  output.setMimeType(ContentService.MimeType.JSON);
  output.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  output.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  output.setHeader('Access-Control-Max-Age', '3600');
  output.setHeader('Vary', 'Origin');

  if (typeof output.setStatusCode === 'function') {
    output.setStatusCode(statusCode);
  }

  return output;
}

function parseRequestData(e) {
  if (!e) {
    return null;
  }

  const postData = e.postData;
  const hasParameters = e.parameter && Object.keys(e.parameter).length > 0;

  if (!postData || !postData.contents) {
    return hasParameters ? Object.assign({}, e.parameter) : null;
  }

  const rawBody = postData.contents;
  const contentType = (postData.type || '').toLowerCase();

  if (contentType.indexOf('application/json') === 0) {
    return JSON.parse(rawBody);
  }

  if (
    contentType.indexOf('application/x-www-form-urlencoded') === 0 &&
    typeof Utilities !== 'undefined'
  ) {
    return Utilities.parseQueryString(rawBody);
  }

  if (contentType.indexOf('multipart/form-data') === 0 && hasParameters) {
    return Object.assign({}, e.parameter);
  }

  try {
    return JSON.parse(rawBody);
  } catch (error) {
    return hasParameters ? Object.assign({}, e.parameter) : null;
  }
}

function sanitizeValue(value) {
  if (typeof value !== 'string') {
    return value || '';
  }

  return value.trim();
}
