const {pool} = require('../config/database');

module.exports = 
{
    adddocumentTypes:async(data,tok,callback)=>
    {
        try
        {
           var ins = await pool.query(`INSERT INTO verifacto.document_types
                                       (document_name, document_entry_type, created_at, updated_at, created_by, updated_by)
                                       VALUES($1, $2, now(), now(), $3, $4)`,
                                       [data.document_name,data.document_entry_type,tok.id,tok.id])

            return callback(null,'document type is added successfully')
        }
        catch(err)
        {
            return callback(err.detail)
        }
    },
    updateDocumentTypes:async(data,tok,callback)=>
    {
        try
        {   
           if(!data.document_id)
            return callback('document id is missing')
           
           var check = await pool.query(`select * from verifacto.document_types where document_id=$1 `,[data.document_id])

           if(!check.rowCount)
            return callback('document id is not exist')

            var updates = await pool.query(`UPDATE verifacto.document_types
                                           SET document_name=$1, document_entry_type=$2, updated_at=now(), updated_by=$3
                                           WHERE document_id=$4`,
                                           [data.document_name,data.document_entry_type,tok.id,data.document_id])
            return callback(null, 'document type is updated successfully');
        }
        catch(err)
        {
            return callback(err.detail)
        }
    },
    getAllDocumentTypes:async(data,callback)=>
    {
        try
        {  
          var alls = await pool.query(``)
          const page  = parseInt(data.page);
          const limit = parseInt(data.limit);
            
          const startIndex = (page - 1) * limit;
          const endIndex = page * limit;
          
          if(data.page!= null && data.limit != null)
          {
            var alls = await pool.query(`select dt.document_id , dt.document_name ,dt.document_entry_type 
                                        ,u.email_id_1 as created_by , dt.created_at 
                                        ,u2.email_id_1 as updated_by,dt.updated_at 
                                        from verifacto.document_types dt 
                                        join verifacto.users u 
                                        on u.user_id = dt.created_by
                                        join verifacto.users u2 
                                        on u2.user_id = dt.updated_by 
                                        group by u.user_id , dt.document_id, u2.user_id 
                                        LIMIT ${endIndex} OFFSET ${startIndex}
                                        order by dt.document_id desc`)
            return callback(null,alls.rows,alls.rowCount)
          }
          else
          {
            var alls = await pool.query(`select dt.document_id , dt.document_name ,dt.document_entry_type 
                                        ,u.email_id_1 as created_by , dt.created_at 
                                        ,u2.email_id_1 as updated_by,dt.updated_at 
                                        from verifacto.document_types dt 
                                        join verifacto.users u 
                                        on u.user_id = dt.created_by
                                        join verifacto.users u2 
                                        on u2.user_id = dt.updated_by 
                                        group by u.user_id , dt.document_id, u2.user_id 
                                        order by dt.document_id desc`)
               return callback(null,alls.rows,alls.rowCount)
          }
           
        }
        catch(err)
        {
            return callback(err.detail)
        }
    },
    getByIds:async(data,callback)=>
    {
        try  
        {          
           const ids =  await pool.query(`select dt.document_id , dt.document_name ,dt.document_entry_type 
                                        ,u.email_id_1 as created_by , dt.created_at 
                                        ,u2.email_id_1 as updated_by,dt.updated_at 
                                        from verifacto.document_types dt 
                                        join verifacto.users u 
                                        on u.user_id = dt.created_by
                                        join verifacto.users u2 
                                        on u2.user_id = dt.updated_by
                                        where dt.document_id = $1
                                        group by u.user_id , dt.document_id, u2.user_id`,
                                        [data.id])
              return callback(null, ids.rows)
        }
        catch(err)
        {
            return callback(err.detail)
        }
    },
    deleteByIdDocumentTypes:async(data,callback)=>
    {
        try
        {
            var del = await pool.query(`DELETE FROM verifacto.document_types
                                        WHERE document_id=$1`,
                                        [data.id])
            return callback(null,'document type is deleted successfully')
        }
        catch(err)
        {
            return callback(err.detail)
        }
    }
}