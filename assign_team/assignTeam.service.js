const {pool} = require('../config/database');


module.exports ={
     assignTeamforUsers:async(data,tok,callback)=>
     {
        try
        {
            const details = await pool.query(`SELECT * From verifacto.assign_teams 
                                              WHERE user_id = $1`,
                                              [data.user_id])
            if(details.rowCount != 0)
            {   
              
               for(let i=0;i<details.rowCount;i++)
                    {
                        if(details.rows[i].team_id === parseInt(data.team_id))
                        {
                         return callback(null, "already user belongs to this team");
                        }
                    }
              
                await pool.query(`INSERT INTO verifacto.assign_teams
                                (user_id, team_id, created_at, updated_at, created_by, updated_by)
                                VALUES($1, $2, now(), now(), $3, $4)`,
                                [data.user_id,data.team_id,tok.id,tok.id]
                                )
                return callback(null, "assigned team to user successfully");
               
            }
            else
            {
                await pool.query(`INSERT INTO verifacto.assign_teams
                                (user_id, team_id, created_at, updated_at, created_by, updated_by)
                                VALUES($1, $2, now(), now(), $3, $4)`,
                                [data.user_id,data.team_id,tok.id,tok.id]
                                )
                return callback(null, "assigned team to user successfully");
            }
       
        }
        catch(err)
        {
            return callback(err.detail)
        }
     },
     updateAssignTeamforUsers:async(data,tok,callback)=>
     {
        try
        {
          const detail = await pool.query(`SELECT * FROM verifacto.assign_teams 
                                            WHERE user_team_id = $1 AND user_id =$2`,
                                            [data.id,data.user_id])
          const update = await pool.query(`SELECT * FROM verifacto.assign_teams 
                                           WHERE user_id = $1`,
                                           [data.user_id])
            if(detail.rowCount !=0)
               {                              
                if(update.rowCount !=0)
                {
                    for(let i=0;i<update.rowCount;i++)
                    {
                        if(update.rows[i].team_id === parseInt(data.team_id))
                        {
                        return callback(null, "already user belongs to this team");
                        }
                    }

                      const res=  await pool.query(`UPDATE verifacto.assign_teams
                                        SET team_id=$1,  updated_at=now(), updated_by=$2
                                        WHERE user_team_id  =$3 `,
                                        [data.team_id,tok.id,data.id]
                                        )
                        return callback(null, "updated team for user successfully");  
                }
            }
            else
            {
                return callback(null,'team is not existing please check the id')
            }
        }
        catch(err)
        {
            return callback(err.detail)
        }
     },
     getAllAssignTeamUsers:async(data,callback)=>
     {
        try
        {
          var alls = await pool.query(`SELECT ast.user_team_id  as id, concat(u.firstname,' ',u.middlename,' ',u.lastname) as name,
                                        t.team_name  as team
                                       FROM verifacto.assign_teams ast
                                       JOIN verifacto.teams t 
                                       ON  ast.team_id = t.team_id 
                                       JOIN verifacto.users u 
                                       ON u.user_id = ast.user_id 
                                       GROUP BY u.user_id,ast.user_team_id,t.team_id
                                       order by concat(u.firstname,' ',u.middlename,' ',u.lastname)
                                       `);
             return callback(null, alls.rows, alls.rowCount);
        }
        catch(err)
        {
            return callback(err.detail)
        }
     },
     getAssignTeamUserByIds:async(data,callback)=>
    {
        try
        {
          var byId = await pool.query(`select  ast.user_team_id  as id, concat(u.firstname,' ',u.middlename,' ',u.lastname) as name,json_agg(t.team_name)  as team,
                                        concat(u2.firstname,' ',u2.middlename,' ',u2.lastname) as createdBy,
                                        concat(u2.firstname,' ',u2.middlename,' ',u2.lastname) as updatedBy
                                        from verifacto.assign_teams ast
                                        join verifacto.teams t 
                                        on ast.team_id = t.team_id 
                                        join verifacto.users u 
                                        on u.user_id = ast.user_id 
                                        join verifacto.users u2 
                                        on ast.created_by  = u2.user_id 
                                        join verifacto.users u3 
                                        on ast.created_by  = u3.user_id 
                                        WHERE ast.user_team_id = $1
                                        group by ast.user_id, u.user_id,ast.user_team_id, u2.user_id 
                                      `,[data.id])
          return callback(null, byId.rows)
        }
        catch(err)
        {
           return callback(err.detail)
        }
     },
     deleteAssignTeamUsers:async(data,callback)=>
     {
        try
        { 
            const detail = await pool.query(`SELECT * FROM verifacto.assign_teams 
                                             WHERE user_team_id = $1`,
                                             [data.id]);

              if(detail.rowCount !=0)
              {
                await pool.query(`DELETE FROM verifacto.assign_teams
                 WHERE user_team_id = $1 `,
                 [data.id])
                return callback(null, "user removed from team");
              }
              else
              {
                return callback(null,"user not exists in the team");
              }
             

        }
        catch(err)
        {
            return callback(err.detail)
        }
     }
}
