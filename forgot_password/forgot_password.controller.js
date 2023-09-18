const {
    generateOtps,validateOtps,updatePasswords
} = require('./forgot_password.service');

module.exports = 
{
    generateOtp:(req,res)=>
    {
        generateOtps(req.body,(err,data)=>
        {
            if(err)
            {
                return res.status(500).json({
                    failed:1,
                    error: err
                })
            }
            else
            {
                return res.status(200).json({
                    success:1,
                    message:'otp generated successfully',
                    data:data
                })
            }
        })
    },
    validateOtp:(req,res)=>
    {
        validateOtps(req.body,(err,data)=>
        {
            if(err)
            {
                return res.status(500).json({
                    failed:1,
                    error: err
                })
            }
            else
            {
                return res.status(200).json({
                    success:1,
                    message:'otp is valid',
                    data:data
                })
            }
        })
    },
    updatePassword:(req,res)=>
    {
        updatePasswords(req.body,req.authData,(err,data)=>
        {
            if(err)
            {
                return res.status(500).json({
                    failed:1,
                    error: err
                })
            }
            else
            {
                return res.status(200).json({
                    success:1,
                    message:'password updated successfully',
                    data:data
                })
            }
        })
    }
}