const router = require('express').Router();
const {tokenValidation} = require('../middleware/token');
const  { generateOtp,validateOtp,updatePassword
    } = require('./forgot_password.controller');

router.post('/generate-otp',generateOtp);
router.post('/validate-otp',validateOtp);
router.post('/update-password',tokenValidation,updatePassword)

module.exports = router;
