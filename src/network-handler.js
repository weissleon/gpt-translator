const { default: fetch } = require("node-fetch");
const https = require("https");
const crypto = require("crypto");
const makeRequest = async (
  url,
  method = "GET",
  headers,
  params = {},
  body = {}
) => {
  {
    let finalUrl = url;

    if (Object.keys(params).length !== 0) {
      const paramString = Object.entries(params)
        .reduce((arr, [key, value]) => {
          arr.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
          return arr;
        }, [])
        .join("&");

      finalUrl += `?${paramString}`;
    }

    return await fetch(finalUrl, {
      method: method,
      headers: headers,
      agent: new https.Agent({
        secureOptions:
          crypto.constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION,
        rejectUnauthorized: false,
      }),
      body: Object.keys(body).length === 0 ? null : JSON.stringify(body),
    });
  }
};

const makeGetRequest = async (url, headers, params) => {
  return await makeRequest(url, "GET", headers, params);
};

const makePostRequest = async (url, headers, params, body) => {
  return await makeRequest(url, "POST", headers, params, body);
};

module.exports = {
  makeGetRequest,
  makePostRequest,
};
