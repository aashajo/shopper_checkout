var express = require("express");
const NodeCache = require("node-cache");
const myCache = new NodeCache();
const { v4: uuidv4 } = require("uuid");

const { Client, Config, CheckoutAPI } = require("@adyen/api-library");
const config = new Config();
// Set your X-API-KEY with the API key from the Customer Area.
config.apiKey =
  "AQEyhmfxKo3OYhREw0m/n3Q5qf3VaY9UCJ14XWZE03G/k2NFinYeKvc8Y5Y5aJ67S3DspvMQwV1bDb7kfNy1WIxIIkxgBw==-RDvDrhcrq3zVIqn3kKI9ERGObqBoDrBz95BTqMHK7cE=-t?a)FhS_?}$5D+3(";
config.merchantAccount = "AdyenRecruitmentCOM";
const client = new Client({ config });
client.setEnvironment("TEST");
const checkout = new CheckoutAPI(client);

module.exports.homepage = function (req, res) {
  res.render("index.ejs");
};

module.exports.checkout = function (req, res) {
  console.log("inside checkout func");
  var totalAmount = parseInt(req.params.TOTALAMOUNT);
  const paymentsResponse = checkout
    .paymentMethods({
      amount: {
        currency: "AUD",
        value: totalAmount,
      },
      countryCode: "AU",
      shopperLocale: "nl-NL",
      channel: "Web",
      merchantAccount: config.merchantAccount,
    })
    .then(function (paymentMethods) {
      console.log(paymentMethods);
      res.render("checkout.ejs", {
        paymentMethods: paymentMethods,
        totalAmount: totalAmount,
        paymentDetails: null
      });
    });
};

module.exports.checkoutPOST = function (req, res) {
  console.log(req.body);
  var body = req.body;
  console.log("inside checkout func POST");
  var totalAmount = parseInt(req.params.TOTALAMOUNT);
  const paymentsResponse = checkout
    .paymentMethods({
      amount: {
        currency: "AUD",
        value: totalAmount,
      },
      countryCode: "AU",
      shopperLocale: "nl-NL",
      channel: "Web",
      merchantAccount: config.merchantAccount,
    })
    .then(function (paymentMethods) {
      console.log(paymentMethods);
      if (req.query.reference) {
        checkout
          .paymentsDetails({
            details: req.body,
            paymentData: myCache.get(req.query.reference),
          })
          .then(function(paymentDetails){
              console.log(paymentDetails)
              return res.render("checkout.ejs", {
                paymentMethods: paymentMethods,
                totalAmount: totalAmount,
                paymentDetails: paymentDetails
              });
          });
      }
    });
};

module.exports.payments = function (req, res) {
  var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  var body = req.body;
  console.log(body.paymentMethod.data);
  var referenceCode = uuidv4();
  checkout
    .payments({
      amount: { currency: "AUD", value: body.totalAmount },
      paymentMethod: body.paymentMethod.data.paymentMethod, // Data object passed from onSubmit event of the front end
      browserInfo: body.paymentMethod.data.browserInfo,
      billingAddress: body.paymentMethod.data.billingAddress,
      channel: "web",
      reference: referenceCode,
      merchantAccount: config.merchantAccount,
      shopperIP: ip,
      origin: "http://localhost:5000/checkout/" + body.totalAmount,
      returnUrl:
        "http://localhost:5000/checkout/" +
        body.totalAmount +
        "?reference=" +
        referenceCode,
    })
    .then(function (result) {
      console.log(result);
      myCache.set(referenceCode, result.paymentData, 10000);
      return res.send(result);
    })
    .catch(function (err) {
      console.log(err);
    });
};
