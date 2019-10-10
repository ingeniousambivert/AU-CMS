const crypt = require("./crypt");
const util = require("util");
const crypto = require("crypto");

//mandatory flag: when it set, only mandatory parameters are added to checksum

function paramsToString(params, mandatoryflag) {
  const data = "";
  const tempKeys = Object.keys(params);
  tempKeys.sort();
  tempKeys.forEach(function(key) {
    const n = params[key].includes("REFUND");
    const m = params[key].includes("|");
    if (n == true) {
      params[key] = "";
    }
    if (m == true) {
      params[key] = "";
    }
    if (key !== "CHECKSUMHASH") {
      if (params[key] === "null") params[key] = "";
      if (!mandatoryflag || mandatoryParams.indexOf(key) !== -1) {
        data += params[key] + "|";
      }
    }
  });
  return data;
}

function genchecksum(params, key, cb) {
  const data = paramsToString(params);
  crypt.gen_salt(4, function(err, salt) {
    const sha256 = crypto
      .createHash("sha256")
      .update(data + salt)
      .digest("hex");
    const check_sum = sha256 + salt;
    const encrypted = crypt.encrypt(check_sum, key);
    params.CHECKSUMHASH = encrypted;
    cb(undefined, params);
  });
}
function genchecksumbystring(params, key, cb) {
  crypt.gen_salt(4, function(err, salt) {
    const sha256 = crypto
      .createHash("sha256")
      .update(params + "|" + salt)
      .digest("hex");
    const check_sum = sha256 + salt;
    const encrypted = crypt.encrypt(check_sum, key);

    const CHECKSUMHASH = encodeURIComponent(encrypted);
    CHECKSUMHASH = encrypted;
    cb(undefined, CHECKSUMHASH);
  });
}

function verifychecksum(params, key) {
  const data = paramsToString(params, false);
  //TODO: after PG fix on thier side remove below two lines
  if (params.CHECKSUMHASH) {
    params.CHECKSUMHASH = params.CHECKSUMHASH.replace("\n", "");
    params.CHECKSUMHASH = params.CHECKSUMHASH.replace("\r", "");

    const temp = decodeURIComponent(params.CHECKSUMHASH);
    const checksum = crypt.decrypt(temp, key);
    const salt = checksum.substr(checksum.length - 4);
    const sha256 = checksum.substr(0, checksum.length - 4);
    const hash = crypto
      .createHash("sha256")
      .update(data + salt)
      .digest("hex");
    if (hash === sha256) {
      return true;
    } else {
      util.log("checksum is wrong");
      return false;
    }
  } else {
    util.log("checksum not found");
    return false;
  }
}

function verifychecksumbystring(params, key, checksumhash) {
  const checksum = crypt.decrypt(checksumhash, key);
  const salt = checksum.substr(checksum.length - 4);
  const sha256 = checksum.substr(0, checksum.length - 4);
  const hash = crypto
    .createHash("sha256")
    .update(params + "|" + salt)
    .digest("hex");
  if (hash === sha256) {
    return true;
  } else {
    util.log("checksum is wrong");
    return false;
  }
}

function genchecksumforrefund(params, key, cb) {
  const data = paramsToStringrefund(params);
  crypt.gen_salt(4, function(err, salt) {
    const sha256 = crypto
      .createHash("sha256")
      .update(data + salt)
      .digest("hex");
    const check_sum = sha256 + salt;
    const encrypted = crypt.encrypt(check_sum, key);
    params.CHECKSUM = encodeURIComponent(encrypted);
    cb(undefined, params);
  });
}

function paramsToStringrefund(params, mandatoryflag) {
  const data = "";
  const tempKeys = Object.keys(params);
  tempKeys.sort();
  tempKeys.forEach(function(key) {
    const m = params[key].includes("|");
    if (m == true) {
      params[key] = "";
    }
    if (key !== "CHECKSUMHASH") {
      if (params[key] === "null") params[key] = "";
      if (!mandatoryflag || mandatoryParams.indexOf(key) !== -1) {
        data += params[key] + "|";
      }
    }
  });
  return data;
}

module.exports.genchecksum = genchecksum;
module.exports.verifychecksum = verifychecksum;
module.exports.verifychecksumbystring = verifychecksumbystring;
module.exports.genchecksumbystring = genchecksumbystring;
module.exports.genchecksumforrefund = genchecksumforrefund;
