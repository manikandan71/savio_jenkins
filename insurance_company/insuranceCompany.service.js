const {pool} = require('../config/database');

module.exports={
    adds:async(data,tok,callback)=>
    {
        try
        { 
          var alls = await pool.query(`select lower(insurance_company_name)
                                              from verifacto.insurance_companies `)

            var res = 0
              for (let i = 0; i < alls.rows.length; i++) 
              {
                if (alls.rows[i].lower === data.insurance_company_name.toLowerCase()) 
                {
                  res = 1;
                  break; 
                }
              }  
              
              if(res === 0)
              {
                var res =  await pool.query(`INSERT INTO verifacto.insurance_companies
                                            (insurance_company_name, created_at, updated_at, created_by, updated_by)
                                            VALUES($1, now(), now(), $2, $3)`,
                                            [data.insurance_company_name,tok.id, tok.id])
                              return callback(null, res);
              }
              else
              {
                return callback('insurance compaines already exists');
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
          if(!data.insurance_id)
            return callback('insurance id is missing');

          var check = await pool.query(`select * from verifacto.insurance_companies where insurance_id=$1`,[data.insurance_id])
          
           if(!check.rowCount)
            return callback('insurance id is not exists');


          var res =  await pool.query(`UPDATE verifacto.insurance_companies
            SET insurance_company_name=$1,  updated_at=now(), updated_by=$2
            WHERE insurance_id=$3`,
            [data.insurance_company_name,tok.id,data.insurance_id]);
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
          var getall = await pool.query(`SELECT ic.insurance_id, ic.insurance_company_name 
                                        ,u.email_id_1 as created_by,ic.created_at 
                                        ,u2.email_id_1 as updated_by,ic.updated_at 
                                        FROM verifacto.insurance_companies ic
                                        join verifacto.users u 
                                        on u.user_id = ic.created_by 
                                        join verifacto.users u2 
                                        on u2.user_id = ic.updated_by 
                                        where insurance_status != 'n'
                                        group by  u.user_id ,u2.user_id, ic.insurance_id 
                                        order by insurance_id desc
                                        LIMIT ${endIndex} OFFSET ${startIndex}
                                         `)                     
          return callback(null, getall.rows, getall.rowCount);
        }
        else
        {
          var getall = await pool.query(`SELECT ic.insurance_id, ic.insurance_company_name 
                                        ,u.email_id_1 as created_by,ic.created_at 
                                        ,u2.email_id_1 as updated_by,ic.updated_at 
                                        FROM verifacto.insurance_companies ic
                                        join verifacto.users u 
                                        on u.user_id = ic.created_by 
                                        join verifacto.users u2 
                                        on u2.user_id = ic.updated_by 
                                        where insurance_status != 'n'
                                        group by  u.user_id ,u2.user_id, ic.insurance_id 
                                        order by insurance_id desc`)                           
          return callback(null, getall.rows, getall.rowCount);
        }
      }
      catch(err)
      {
        return callback(err.detail)
      }
    },
    listSortedAscs:(data,callback)=>
    {
      q = `select ic.insurance_id 
                 ,ic.insurance_company_name 
             from verifacto.insurance_companies ic
            where insurance_status != 'n'
         order by insurance_company_name`

        pool.query(q,
                   function(error,result)
                   {
                    if(error)
                    {
                      return callback(error)
                    }
                    return callback(null, result.rows)
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

          var dels = await pool.query(`UPDATE verifacto.insurance_companies
                                          SET insurance_status = 'n'
                                             ,insurance_company_name =$1
                                        WHERE insurance_id=$2`,
                                       [result,data.id]
                                     )
          return callback(null, dels);
      }
      catch(err)
      {
        return callback(err.detail)
      }
    },
   
}