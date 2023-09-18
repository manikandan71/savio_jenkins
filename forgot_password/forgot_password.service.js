const {pool} = require('../config/database');
const {otpTokenGenerator} = require('../middleware/token')
const {hashValidator,hashGenerate} = require('../middleware/hashing');
const {handleMail} = require('../middleware/sendMail')
 
module.exports ={
    generateOtps:async(data,callback)=>
    {
        try
        {
          var user_exist = await pool.query(`select  user_id from verifacto.users u  
                                             where email_id_1 = $1 `,[data.email_Id])
          var ids = user_exist.rows[0].user_id
            
           if(user_exist.rowCount != 0)
           {  
           
              var exist = await pool.query(`SELECT * FROM verifacto.forgot_password
                                            where user_id =$1`, [ids])
               
              var newotp = Math.floor(100000 + Math.random() * 900000)
              var datas = { 'subject':'please use this otp to change your password',
                              'email' : data.email_Id,
                              'otp'   : newotp
                          }
              await handleMail(datas) 
              if(exist.rowCount != 0)
              {  
                
                var update_password = await pool.query(`UPDATE verifacto.forgot_password
                                                        SET otp=$1 , updated_at=now(), created_by=$2, updated_by=$3
                                                        WHERE user_id=$4
                                                        RETURNING user_id`,
                                                        [newotp,1,1,ids])
                return callback(null, update_password.rows);
              }
              else
              {
                var new_password = await pool.query(`INSERT INTO verifacto.forgot_password
                                                     (user_id, otp, created_at, updated_at, created_by, updated_by)
                                                     VALUES($1, $2, now(), now(), $3, $4)
                                                     RETURNING user_id`,
                                                     [ids,newotp, 1,1])
                 return callback(null, new_password.rows);
              }
           }
           else
           {
            return callback('user not exists please check the email Id')
           }
        }
        catch(err)
        {
            return callback(err.detail)
        }
        
    },
    validateOtps:async(data,callback)=>
    {
        try
        {
         var res = await pool.query(`select * from verifacto.forgot_password
                                     where otp = $1`,[data.otp])          
          if(res.rowCount != 0 )
          {
            var current_Date = new Date();
            console.log('check the updates',res.rows[0].updated_at.getTime(), current_Date.getTime() )
            const diff = current_Date - res.rows[0].updated_at;
              
            console.log('sssss',diff)
            if(diff)
            {
              const otp_update = await pool.query(`UPDATE verifacto.forgot_password
                                                    SET otp=null, otp_token=$1
                                                    WHERE user_id = $2 
                                                    RETURNING otp_token`,[otpTokenGenerator(data.user_id),data.user_id])
              return callback(null, otp_update.rows)
            }
            else
            {
              await pool.query(`UPDATE verifacto.forgot_password
                                SET otp=null, otp_token=null
                                WHERE user_id = $1`,[data.user_id]);
               return callback('otp expired');
            }
          }
          else
          {
            return callback('invalid otp');
          }
        }
        catch(err)
        {
          return callback(err.detail)
        }
    },
    updatePasswords:async(data,token,callback)=>
    {
      try
      {
        var password_details = await pool.query(`select * from verifacto.forgot_password
                                                 where user_id = $1`, [token.id])                                    
        var user_details = await pool.query(`SELECT  "password" FROM verifacto.users
                                             WHERE user_id = $1`,[token.id])
         var count = password_details.rows[0].no_times_reset;
         const validate = await hashValidator(data.password, user_details.rows[0].password);
        
         if(validate)
         {
          return callback('new password matching with old password');
         }
         else
         { 
           var new_password = await hashGenerate(data.password);

              await pool.query(`UPDATE verifacto.users
                                        SET "password"= $1
                                        WHERE user_id= $2`,
                                        [new_password, token.id])
            await pool.query(`UPDATE verifacto.forgot_password
                              SET otp_token=null, no_times_reset=$1, updated_at=now(), updated_by=$2
                              WHERE user_id=$3`,[count+1,1,token.id])
            return callback(null);  
         }
      }
      catch(err)
      {
        return callback(err.detail)
      }
    }
}