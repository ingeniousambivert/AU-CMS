const PAYTM_STAG_URL = "https://pguat.paytm.com";
const PAYTM_PROD_URL = "https://secure.paytm.in";
const MID = "QSZiyg75012167042667"; // Change this
const PAYTM_ENVIORMENT = "TEST"; // PROD FOR PRODUCTION
const PAYTM_MERCHANT_KEY = "NblxXyT@s&yZKp36"; // Change this
const WEBSITE = "WEBSTAGING";
const CHANNEL_ID = "WEB";
const INDUSTRY_TYPE_ID = "Retail";
const PAYTM_FINAL_URL = "";

if (PAYTM_ENVIORMENT == "TEST") {
  PAYTM_FINAL_URL = "https://securegw-stage.paytm.in/theia/processTransaction";
} else {
  PAYTM_FINAL_URL = "https://securegw.paytm.in/theia/processTransaction";
}

module.exports = {
  MID: MID,
  PAYTM_MERCHANT_KEY: PAYTM_MERCHANT_KEY,
  PAYTM_FINAL_URL: PAYTM_FINAL_URL,
  WEBSITE: WEBSITE,
  CHANNEL_ID: CHANNEL_ID,
  INDUSTRY_TYPE_ID: INDUSTRY_TYPE_ID
};
