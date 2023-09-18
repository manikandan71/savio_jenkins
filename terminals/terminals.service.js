const {pool} = require('../config/database');

module.exports ={
    addTerminals:(data,tok,callback)=>
    {
         eq =`select terminal_name
                from verifacto.terminals
               where team_id =$1 and terminal_name=$2`
            
          pool.query(eq,[data.team_id,data.terminal_name],
                     function(error,result)
                     {
                          if(error)
                          {
                            return callback(error)
                          }
                          if(result.rowCount != 0)
                          {
                            return callback('already terminal exist for the team')
                          }
                          else
                          {
                            iq = `INSERT INTO verifacto.terminals
                                 (team_id, terminal_name, created_at, updated_at, created_by, updated_by)
                                 VALUES($1, $2, now(), now(), $3, $4)`

                              pool.query(iq,[data.team_id,data.terminal_name,tok.id,tok.id],
                                            function(error,result)
                                            {
                                               if(error)
                                               {
                                                return callback(error)
                                               }
                                               else
                                               {
                                                return callback(null,'terminal created successfully')
                                               }
                                            }) 
                          }
                     })       
    },
    updateTerminals:async(data,tok,param,callback)=>
    {
        try
        {
          if(!param.id) 
           return callback('terminal id is missing')
          
           var check = await pool.query(`select * from verifacto.terminals where terminal_id=$1`,[param.id])

           if(!check.rowCount)
            return callback('terminal id is not exists')

            var columns = Object.keys(data);
            var values = Object.values(data);
            const setClause = columns.map((column, index) => `${column} = $${index + 1}`).join(', ');
            const query = {
                 text: `UPDATE verifacto.terminals SET ${setClause},updated_by= $${columns.length + 1} ,updated_at=now()  
                        WHERE terminal_id = $${columns.length + 2}`,
                 values: [...values,tok.id, param.id],
                  };
            const res = await pool.query(query)
            return callback(null, res);
        }
        catch(err)
        {
            return callback(err.detail)
        }
    },
    getTerminalAlls:async(data,callback)=>
    {
        try
        {
          const alls = await pool.query(`	SELECT tr.terminal_id 
                                                ,t.team_id 
                                                ,t.team_name 
                                                ,tr.terminal_name
                                                ,tr.status 
                                                ,u.user_id 
                                                ,concat(u.firstname,' ',u.lastname) name 
                                            FROM verifacto.terminals tr
                                            join verifacto.teams t  
                                              on tr.team_id  = t.team_id
                                       left join verifacto.users u 
                                              on u.user_id  = tr.user_id 
                                        order by tr.status ='y' desc`)
         return callback(null,alls.rows, alls.rowCount)
        }
        catch(err)
        {
            return callback(err.detail)
        }
    },
    getTerminalByIds:async(data,callback)=>
    {
        try
        {
          const alls = await pool.query(`SELECT tr.terminal_id, t.team_name, tr.terminal_name, 
                                        tr.created_at, tr.updated_at, tr.created_by, tr.updated_by
                                        FROM verifacto.terminals tr
                                        join verifacto.teams t  
                                        on tr.team_id  = t.team_id
                                        WHERE tr.terminal_id = $1`,
                                        [data.id])
         return callback(null,alls.rows)
        }
        catch(err)
        {
            return callback(err.detail)
        }
    },
    deleteTerminals:async(data,callback)=>
    {
      try
      {
         const del = await pool.query(`DELETE FROM verifacto.terminals
                                       WHERE terminal_id = $1`,
                                       [data.id])
         return callback(null, del);
      }
      catch(err)
      {
        return callback(err.detail)
      }
    },
    listAvailableTerminals:async(data,tok,callback)=>{
        try
        {
         const list = await pool.query(`SELECT user_team_id, user_id, team_id
                                        FROM verifacto.assign_teams
                                        WHERE user_id = $1`,
                                        [tok.id]) 
          
             console.log('check the list', list.rows, list.rowCount,tok.id)                           
                          
            if(list.rowCount != 0)
            {  
                if(list.rows[0].team_id === 3 ||  list.rows[0].team_id === 4)
                {
                    var ats =await pool.query(`select t.terminal_id
                                                     ,t.terminal_name 
                                                     ,t2.team_name
                                                     ,t.status
                                                 from verifacto.terminals t
                                                 join verifacto.teams t2
                                                   on t2.team_id = t.team_id
                                                where t2.team_id = $1
                                                  and t.status = 'n'
                                             order by t.terminal_name`,
                                                [data.entry_team])
                    console.log('chcek the team id eeddd')
                }
                else
                {
                  var ats =await pool.query(`	select t.terminal_id
                                                    ,t.terminal_name 
                                                    ,t2.team_name
                                                    ,t.status
                                                  from verifacto.terminals t
                                                  join verifacto.teams t2
                                                    on t2.team_id = t.team_id
                                                where t2.team_id = $1
                                                  and t.status = 'n'
                                             order by t.terminal_name`,
                                              [list.rows[0].team_id])
                }  
                if(ats.rowCount === 0)
                {
                  return callback(null,"All the terminals are occupied");
                } 
                else
                {
                  return callback(null,ats.rows, ats.rowCount);
                }             
            }
            else
            {
              return callback(null,"user don't have terminals ")
            }
           
        }
        catch(err)
        {
         return callback(err.detail)
        }
    },
    chooseTerminals:async(data,tok,callback)=>
    {
      console.log('check the tiken', tok,data)
      try
      {
        if(data.status === 'n')
        {
          var selectTer = await pool.query(`UPDATE verifacto.terminals
                                            SET   status=$1, user_id=null,updated_by=$2, updated_at=now()
                                            where terminal_id = $3`,
                                            [data.status,tok.id,data.terminal_id])

          return callback(null, 'terminal is deallocated successfully')                                  
        }
        else
        {
          var selectTer = await pool.query(`UPDATE verifacto.terminals
                                            SET   status=$1, user_id=$2,updated_by=$2, updated_at=now()
                                            where terminal_id = $3`,
                                            [data.status,tok.id,data.terminal_id])    

          return callback(null, 'terminal is allocated successfully')
        }
        
         
      }
      catch(err)
      {
        return callback(err.detail)
      }
    },
    listofActiveTerminals:async(data,callback)=>
    {
      try
      {
        var lis  = await pool.query(`select  t.terminal_id, concat(u.firstname ,' ',u.middlename, ' ', u.lastname  ) as name ,t.terminal_name, t2.team_name, t.status
                                      FROM verifacto.terminals t
                                      join verifacto.teams t2
                                      on t2.team_id = t.team_id
                                      join verifacto.users u
                                      on t.user_id = u.user_id
                                      group by t2.team_id, t.terminal_id, u.user_id
                                      ORDER BY terminal_id`);
          return callback(null,lis.rows, lis.rowCount);
      }
      catch(err)
      {
        return callback(err.detail)
      }
    }
}