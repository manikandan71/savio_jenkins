const {pool} = require('../config/database');

module.exports={
    adds:async(data,tok,callback)=>
    {
        try
        {   
          var alls = await pool.query(`select lower(l.leinholder_name)
                                         from verifacto.lienholders l`)
            
          var res = 0
          for (let i = 0; i < alls.rows.length; i++) 
          {
            if (alls.rows[i].lower === data.leinholder_name.toLowerCase()) 
            {
                res = 1;
                break; 
            }
          }   
    
         if(res === 0)
         {
           var res =  await pool.query(`INSERT INTO verifacto.lienholders
                                        (leinholder_name, created_at, updated_at, created_by, updated_by)
                                        VALUES($1, now(), now(), $2, $3)`,
                                        [data.leinholder_name,tok.id, tok.id])
            return callback(null, res);
         }
         else
         {
          return callback('leinholder already exists')
         }
           
        }
        catch(err)
        {
            return callback(err.detail)
        }
    },
    updates:async(data,tok,callback)=>
    {
        try
        { 
          if(!data.leinholder_id)
           return callback("leinholder id is missing")
            
           var check = await pool.query(`select * from verifacto.lienholders where leinholder_id= $1`,[data.leinholder_id])

           if(!check.rowCount)
            return callback("leinholder id is not exist in the table")

            var res =  await pool.query(`UPDATE verifacto.lienholders
                                        SET leinholder_name=$1,  updated_at=now(), updated_by=$2
                                        WHERE leinholder_id=$3`,
                                        [data.leinholder_name,tok.id,data.leinholder_id])
            return callback(null, res); 
        }
        catch(err)
        {
            return callback(err.detail)
        }
    },
    getAlls:async(data,callback)=>
    {
      try
      {
        const page  = parseInt(data.page);
        const limit = parseInt(data.limit);
        
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        
        if(data.page!= null && data.limit != null)
        {
          var getall = await pool.query(`SELECT l.leinholder_id,l.leinholder_name  
                                        ,u.email_id_1 as created_by,l.created_at 
                                        ,u2.email_id_1 as updated_by,l.updated_at 
                                        FROM verifacto.lienholders l 
                                        join verifacto.users u 
                                        on u.user_id = l.created_by 
                                        join verifacto.users u2 
                                        on u2.user_id = l.updated_by 
                                        where l.lienholders_status != 'n'
                                        group by  u.user_id ,u2.user_id, l.leinholder_id 
                                        order by leinholder_id desc
                                        LIMIT ${endIndex} OFFSET ${startIndex}
                                        `)                           
          return callback(null, getall.rows, getall.rowCount);
        }
        else
        {
          var getall = await pool.query(`SELECT l.leinholder_id,l.leinholder_name  
                                        ,u.email_id_1 as created_by,l.created_at 
                                        ,u2.email_id_1 as updated_by,l.updated_at 
                                        FROM verifacto.lienholders l 
                                        join verifacto.users u 
                                        on u.user_id = l.created_by 
                                        join verifacto.users u2 
                                        on u2.user_id = l.updated_by 
                                        where l.lienholders_status != 'n'
                                        group by  u.user_id ,u2.user_id, l.leinholder_id 
                                        order by leinholder_id desc
                                        `)                           
          return callback(null, getall.rows, getall.rowCount);
        }
      
      }
      catch(err)
      {
        return callback(err.detail)
      }
    },
    getSortedAscs:(data,callback)=>
    {
       q = `	SELECT l.leinholder_id
                    ,l.leinholder_name  
                FROM verifacto.lienholders l 
               where l.lienholders_status != 'n'
            order by l.leinholder_name asc `
        pool.query(q,
                  function(error,result)
                  {
                    if(error)
                    {
                      return callback(error)
                    }
                    return callback(null,result.rows)
                  })
    },
    deletes:async(data,callback)=>
    {
      try    
      {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?';
        let result = '';
        
        for (let i = 0; i < 12; i++) {
          const randomIndex = Math.floor(Math.random() * charset.length);
          result += charset[randomIndex];
        }

          var dels = await pool.query(`UPDATE verifacto.lienholders
                                          SET lienholders_status = 'n'
                                            , leinholder_name = $1
                                        WHERE leinholder_id=$2`,
                                       [result,data.id]
                                     )
          return callback(null, dels);
      }
      catch(err)
      {
        return callback(err.detail)
      }
    }
}