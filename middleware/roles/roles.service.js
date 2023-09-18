const {pool} = require('../../config/database')

module.exports={
    addRoles:async(data,tok, callBack)=>{
         
        //  await pool.query(
        //   `CALL verifacto.roles_insert($1,$2,$3,$4)`,
        //   [data.role_name, data.role_id, tok.id, tok.id]
        //  ) 
       try{
          var result =   await pool.query(
            `INSERT INTO verifacto.roles
             (role_name,created_at, updated_at, created_by, updated_by)
             VALUES($1,now(), now(), $2, $3)`,
             [data.role_name,tok.id, tok.id],
              (error, result)=>
                {
                  if(error)
                  {
                      return callBack(error)
                  }
                  else
                  {
                      return callBack(null, result);
                  }
                } 
             ) 
        }
        catch(err)
        {
            return callBack(err.detail);
        }
    },
    updateRoles:async(data,tok,callBack)=>
    {
        try
        {  
          if(!data.role_id)
           return callBack('role_id is missing')

           var check = await pool.query(`select * from verifacto.roles where role_id=$1`,[data.role_id])

           if(!check.rowCount)
             return callBack('role id is not exists in the table');  
           
            var result = await pool.query(`UPDATE verifacto.roles
                                          SET role_name=$1, updated_at=now(), updated_by=$2
                                          WHERE role_id=$3`,
                                          [data.role_name, tok.id, data.role_id]
                                        )
            return callBack(null, result);
          
        }
        catch(err)
        {
            return callBack(err.detail)
        }
    },
    getAllRoles:async(data,callBack)=>
    {
     try{
      const page  = parseInt(data.page);
      const limit = parseInt(data.limit);
      
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      if(data.page!= null && data.limit != null)
      {
          var result =await pool.query(`SELECT r.role_id 
                                              ,r.role_name 
                                              ,u.email_id_1 as created_by,r.created_at 
                                              ,u2.email_id_1 as updated_by,r.updated_at 
                                          FROM verifacto.roles r
                                     left join verifacto.users u 
                                            on u.user_id = r.created_by 
                                     left join verifacto.users u2 
                                            on u2.user_id = r.updated_by 
                                         where r.status != 0 
                                           and r.status != 2
                                      group by u.user_id ,u2.user_id, r.role_id
                                      order by role_id desc
                                    LIMIT ${endIndex} OFFSET ${startIndex}
                                       `)
        return callBack (null, result.rows,result.rowCount);
      }
      else
      {
          var result =await pool.query(`SELECT r.role_id 
                                              ,r.role_name 
                                              ,u.email_id_1 as created_by,r.created_at 
                                              ,u2.email_id_1 as updated_by,r.updated_at 
                                          FROM verifacto.roles r
                                    left join verifacto.users u 
                                            on u.user_id = r.created_by 
                                    left join verifacto.users u2 
                                            on u2.user_id = r.updated_by 
                                        where r.status != 0 
                                          and r.status != 2
                                      group by u.user_id ,u2.user_id, r.role_id
                                      order by role_id desc`)
        return callBack (null, result.rows,result.rowCount);
      }
     }
     catch(err)
     {
       return callBack(err.detail)
     }
    },
    getRoleByIds:async(data,callBack)=>
    {
     try{
        var result = await pool.query(`SELECT r.role_id, r.role_name
                                      ,u.email_id_1 as created_by,r.created_at 
                                      ,u2.email_id_1 as updated_by,r.updated_at 
                                      FROM verifacto.roles r
                                 left join verifacto.users u 
                                        on u.user_id = r.created_by 
                                 left join verifacto.users u2 
                                        on u2.user_id = r.updated_by 
                                      where role_id=$1
                                      group by  u.user_id ,u2.user_id, r.role_id`, 
                                      [data.id])
        return callBack (null, result.rows);
     }
     catch(err)
     {
       return callBack(err.detail)
     }
    },
    deleteRoles:async(data,callBack)=>
    {
      try
      {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?';
        let result = '';
        
        for (let i = 0; i < 12; i++) {
          const randomIndex = Math.floor(Math.random() * charset.length);
          result += charset[randomIndex];
        }


         var res = await pool.query(`update verifacto.roles 
                                        set status = 0
                                           ,role_name =$1
                                      where role_id =$2`,[result,data.id])
           return callBack(null, res);
      }
      catch(err)
      {
        return callBack(err.detail)
      }
    },
}