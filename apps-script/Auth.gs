/**
 * VizEvent — Authentication Module
 * Handles login, session management, and password operations.
 */

/**
 * Hash a password using SHA-256
 */
function hashPassword(password) {
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
  return digest.map(function(byte) {
    var hex = (byte < 0 ? byte + 256 : byte).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Generate a unique session token
 */
function generateSessionToken() {
  return Utilities.getUuid();
}

/**
 * Authenticate user with email and password
 */
function authenticateUser(email, password) {
  var sheet = getMasterSheet(CONFIG.USERS_SHEET);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var emailCol = headers.indexOf('Email');
  var passCol = headers.indexOf('PasswordHash');
  var roleCol = headers.indexOf('Role');
  var nameCol = headers.indexOf('Name');
  var idCol = headers.indexOf('UserId');
  var assignedCol = headers.indexOf('AssignedEvents');
  var tokenCol = headers.indexOf('SessionToken');
  var expiryCol = headers.indexOf('TokenExpiry');

  var passwordHash = hashPassword(password);

  for (var i = 1; i < data.length; i++) {
    if (data[i][emailCol] === email && data[i][passCol] === passwordHash) {
      // Generate new session
      var sessionToken = generateSessionToken();
      var expiry = new Date();
      expiry.setHours(expiry.getHours() + CONFIG.SESSION_EXPIRY_HOURS);

      // Update session in user row
      sheet.getRange(i + 1, tokenCol + 1).setValue(sessionToken);
      sheet.getRange(i + 1, expiryCol + 1).setValue(expiry.toISOString());

      // Also add to sessions sheet
      var sessionsSheet = getMasterSheet(CONFIG.SESSIONS_SHEET);
      sessionsSheet.appendRow([sessionToken, data[i][idCol], new Date().toISOString(), expiry.toISOString()]);

      return {
        user: {
          id: data[i][idCol],
          name: data[i][nameCol],
          email: data[i][emailCol],
          role: data[i][roleCol],
          assignedEvents: data[i][assignedCol] ? data[i][assignedCol].split(',') : [],
        },
        sessionToken: sessionToken,
      };
    }
  }

  return null;
}

/**
 * Validate a session token
 */
function validateSession(sessionToken) {
  if (!sessionToken) return null;

  var sheet = getMasterSheet(CONFIG.USERS_SHEET);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var tokenCol = headers.indexOf('SessionToken');
  var expiryCol = headers.indexOf('TokenExpiry');
  var idCol = headers.indexOf('UserId');
  var nameCol = headers.indexOf('Name');
  var emailCol = headers.indexOf('Email');
  var roleCol = headers.indexOf('Role');
  var assignedCol = headers.indexOf('AssignedEvents');

  for (var i = 1; i < data.length; i++) {
    if (data[i][tokenCol] === sessionToken) {
      var expiry = new Date(data[i][expiryCol]);
      if (expiry > new Date()) {
        return {
          id: data[i][idCol],
          name: data[i][nameCol],
          email: data[i][emailCol],
          role: data[i][roleCol],
          assignedEvents: data[i][assignedCol] ? data[i][assignedCol].split(',') : [],
        };
      }
      // Session expired
      return null;
    }
  }
  return null;
}

/**
 * Validate API key
 */
function validateApiKey(apiKey) {
  return apiKey === CONFIG.API_KEY;
}

/**
 * Change user password
 */
function changeUserPassword(userId, oldPassword, newPassword) {
  var sheet = getMasterSheet(CONFIG.USERS_SHEET);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idCol = headers.indexOf('UserId');
  var passCol = headers.indexOf('PasswordHash');

  var oldHash = hashPassword(oldPassword);
  var newHash = hashPassword(newPassword);

  for (var i = 1; i < data.length; i++) {
    if (data[i][idCol] === userId && data[i][passCol] === oldHash) {
      sheet.getRange(i + 1, passCol + 1).setValue(newHash);
      return true;
    }
  }
  return false;
}
