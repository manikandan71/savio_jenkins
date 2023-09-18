const jwt = require('jsonwebtoken');

module.exports={
    tokenGenerator:(employee_id,id,role,role_name)=>{
        const token  = jwt.sign(
            {employee_id,id,role,role_name},
            process.env.JWT_KEY,
            {expiresIn:'10h'}
        )
        return token
    },
    otpTokenGenerator:(id)=>
    {
        const token = jwt.sign(
            {id},
            process.env.JWT_KEY,
            {expiresIn:'5m'}
        )
        return token
    },
    tokenValidation :(req, res, next) => {
        var token = req.headers["x-access-token"] || req.headers["authorization"];
        var newToken = '';
        if (token) {
            if (token.startsWith("Bearer ")) {
                token = token.split(' ');
                newToken = token[1];
            }
            jwt.verify(newToken, process.env.JWT_KEY, (err, authData) => {
                if (err) {
                    return res.status(500).json({
                        success: "fail",
                        status_code: 404,
                        message: 'invalid token',
                    })
                }
                else {
                    req.authData = authData;
                    next();
                }

            })
        } else {
            return res.status(500).json({
                success: "fail",
                status_code: 404,
                message: 'please pass the token!',
            })
        }
    },
}