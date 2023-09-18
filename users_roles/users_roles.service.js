const {pool} = require('../config/database');

module.exports={
    addUserRoles:async(data,tok,callback)=>{
        try
        { 
          var validate = await pool.query(`select * from verifacto.user_roles 
                                           where user_id = $1 AND role_id = $2`,
                                           [data.user_id, data.role_id]);
            if(validate.rowCount ===0)
            {
                var res = await pool.query(`INSERT INTO verifacto.user_roles
                                        (user_id, role_id, created_at, updated_at, created_by, updated_by)
                                        VALUES($1, $2, now(), now(), $3, $4)`,
                                        [data.user_id, data.role_id,tok.id,tok.id])
                return callback(null,res);
            }
            else
            {
                return callback('user already exists with same role')
            }
        }
        catch(err)
        {
            return callback(err.detail)
        }
      },
    updateUserRoles:async(data,tok,callback)=>
        {
            try
            {
             var validate = await pool.query(`select * from verifacto.user_roles 
                                                where user_id = $1 AND role_id = $2`,
                                                [data.user_id, data.role_id]);
            if(validate.rowCount ===0)
             {
             var res = await pool.query(`UPDATE verifacto.user_roles
                                        SET  role_id=$1, updated_at=now(), updated_by=$2
                                        WHERE user_role_id = $3
                                        `,[data.role_id,tok.id,data.user_role_id]);
             return callback(null, res); 
             }
             else
             {
                return callback(' user already exists with same role')
             }
            }
            catch(err)
            {
                return callback(err.detail)
            }
      },
    deleteUserRoles:async(data,callback)=>
    {
       try
        {
           var res = await pool.query(`DELETE FROM verifacto.user_roles
                                       WHERE user_role_id=$1`,
                                       [data.id]
                                    )
           return callback(null, res);
        }  
        catch(err)
        {
            return(err.detail)
        }
    },
    getUserRoles:async(data,callback)=>
    {
      try
      {
        var res = await pool.query(` SELECT usrr.user_role_id as id, usr.user_id,r.role_id 
                                    ,concat(usr.firstname,'', usr.middlename , '',usr.lastname) as name
                                    ,r.role_name 
                                    FROM verifacto.USERS usr
                                    join verifacto.USER_ROLES   usrr on usrr.USER_ID   = usr.USER_ID
                                    join verifacto.roles r 
                                    on r.role_id = usrr.role_id 
                                    group by usr.user_id,usrr.role_id,usrr.user_role_id,r.role_id 
                                    order by usr.user_id `)
       return callback(null,res.rows, res.rowCount);
      }
      catch(err)
      {
        return callback(err.detail)
      }
    }
}