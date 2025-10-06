const SHEET_NAME = 'Submissions';
const SECRET_KEY = 'baboo-contact-20241006-cp2v3l8s';

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('No data received.');
    }

    const data = JSON.parse(e.postData.contents);

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

    sheet.appendRow([
      new Date(),
      data.name || '',
      data.email || '',
      data.childrenAges || '',
      data.expectations || '',
      data.referralSource || '',
      data.userAgent || '',
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

function doOptions() {
  return buildResponse(200, {
    success: true,
    message: 'CORS preflight check passed.',
  });
}

function buildResponse(statusCode, payload) {
  const output = ContentService.createTextOutput(JSON.stringify(payload));
  output.setMimeType(ContentService.MimeType.JSON);
  output.setHeader('Access-Control-Allow-Origin', 'https://baboostories.com');
  output.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  output.setHeader('Access-Control-Max-Age', '3600');

  if (typeof output.setStatusCode === 'function') {
    output.setStatusCode(statusCode);
  }

  return output;
}
