const express = require("express")
const controller = require("../controller/controller")
const router = express.Router();



router.get("/", controller.homepage);

router.get("/checkout/:TOTALAMOUNT", controller.checkout);
router.post("/checkout/:TOTALAMOUNT", controller.checkoutPOST);
router.post("/payments", controller.payments)




module.exports = router;