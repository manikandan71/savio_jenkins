const {pool} = require('../config/database');
module.exports={
    addTeams:async(data,tok,callback)=>
    {  
        try
        {
          var res = await pool.query(`INSERT INTO verifacto.teams
                                    (team_name, created_at, updated_at, created_by, updated_by)
                                    VALUES($1, now(), now(), $2, $3)`, 
                                    [data.team_name,tok.id,tok.id])
             return callback(null, res)
        }
        catch(err)
        {
            return callback(err.detail)
        }
    },
    updateTeams:async(data,tok,callback)=>
    {
        try{
          var res = await pool.query(`UPDATE verifacto.teams
                                    SET team_name= $1, updated_at=now(), updated_by=$2
                                    WHERE team_id= $3`,
                                    [data.team_name,tok.id,data.team_id])  
             return callback(null, res);
        }
        catch(err)
        {
            return callback(err.detail)
        }
    },
    getAllTeams:(data,callback)=>
    {
        q = ` select team_id
                    ,team_name 
                from verifacto.teams 
                where team_status != 'n'`
        pool.query(q,
                    function(error,result)
                    {
                        if(error)
                        {
                            return callback(error)
                        }
                        return callback(null, result.rows, result.rowCount)
                    })
    },
    getTeamIds:async(data,callBack)=>
    {
        try{
            var res = await pool.query(`select team_id
                                              ,team_name  
                                          from verifacto.teams 
                                         where team_id =$1`,[data.id]);
            return callBack(null, res.rows);
         }
         catch(err)
         {
            return callBack(err.detail);
         }
        
    },
    deleteTeams:(data,callBack)=>
    {
      q = `update verifacto.teams 
              set team_status = 'n'
            where team_id = $1`

        pool.query(q,[data.id],
                    function(error,result)
                    {
                        if(error)
                        {
                            return callBack(error)
                        }
                        else
                        {
                            return callBack(null,'team deleted successfully')
                        }
                    })
    }
}