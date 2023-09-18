const {pool} = require('../config/database');
const {tokenGenerator} = require('../middleware/token')
const {hashValidator} = require('../middleware/hashing');
const moment = require('moment-timezone'); 
const moments = require("moment");

module.exports ={
    logins:async(brk,data,callback)=>
    {
        try {
           const estTimestamp = moment.tz('America/New_York').format('YYYY-MM-DD HH:mm:ss.SSS');

           if(brk.status === 1)
            return callback(null,brk)

           var user_detail = await pool.query(`Select u.user_id
                                                      ,u.employee_id
                                                      ,concat(u.firstname,' ',u.lastname) as name 
                                                      ,password
                                                      ,ur.role_id
                                                      ,r.role_name
                                                      ,t.team_id 
                                                      ,t.team_name 
                                                  FROM verifacto.users u
                                            inner join verifacto.user_roles ur
                                                    on u.user_id = ur.user_id
                                            inner join verifacto.roles r 
                                                    on r.role_id = ur.role_id
                                            inner join verifacto.assign_teams at2 
                                                    on u.user_id = at2.user_id 
                                            inner join verifacto.teams t  
                                                    on t.team_id  = at2.team_id
                                                 WHERE u.employee_id = '${data.employee_id}'`);

           if(user_detail.rowCount !=0)
           {   
              const {user_id,employee_id,name,password,role_id,role_name,team_id,team_name}   = user_detail.rows[0] 

             const checkPassword = await hashValidator(data.password,password)
             let ret ='';
              if(checkPassword)
              {
                //  var start_time  = data.login_time
                tq = `UPDATE verifacto.terminals
                         SET user_id=null
                            ,status='n'
                            ,updated_at=now()
                            ,updated_by=${user_id}
                       WHERE user_id=${user_id}`

                        pool.query(tq,
                                  function(error,result)
                                  {
                                    if(error)
                                    {
                                      return callback(error)
                                    }
                                  })
                 lq = `INSERT INTO verifacto.user_logins
                                  (user_id, login_time, created_at, updated_at, created_by, updated_by)
                                  VALUES($1, $2, now(), now(), $3, $4)
                                  returning user_login_id`
                        pool.query(lq,[user_id,estTimestamp,user_id,user_id],
                                     async function(error,result)
                                        {
                                          if(error)
                                          {
                                            return(error)
                                          }
                                          const token = tokenGenerator(employee_id ,user_id ,role_id ,role_name);
                                            
                                           tq = `UPDATE verifacto.users
                                                    set tokens = '${token}'
                                                  WHERE user_id = ${user_id}`
                                              
                                            console.log(tq)
                                           await pool.query(tq)

                                          if(brk.status === 0)
                                            {
                                              ret = 
                                                 {
                                                  user_id: user_id,
                                                  name:    name,
                                                  role:    role_name,
                                                  team:    team_name,
                                                  token:   token,
                                                  message:'still your in break',
                                                  user_break_history_id: brk.user_break_history_id,
                                                  break_name: brk.break_name,
                                                  break_duration: brk.break_duration,
                                                  break_hours:brk.break_hours,
                                                  break_minutes:brk.break_minutes,
                                                  remaining_time:brk.remaining_time,
                                                  login_id: result.rows[0].user_login_id
                                                  }
                                            }
                                            else
                                            {
                                              ret = {
                                                user_id: user_id,
                                                name:    name,
                                                role:    role_name,
                                                team:    team_name,
                                                token:   token,
                                                login_id: result.rows[0].user_login_id,
                                                message: 'login successfully'
                                              }
                                            }
                                            
                                           return callback(null,ret)
                                        })
              } 
              else
              {
                return callback('password is wrong')
              }
           }
           else
           {
            return callback('employee id is wrong')
           }
        
        } 
        catch (err) {
            return callback(err.detail)
        }
    },
    logouts:(data,tok,callback)=>
    {
      var end_time  = moment.tz('America/New_York').format('YYYY-MM-DD HH:mm:ss.SSS');

       q = `select t.terminal_id 
              from verifacto.terminals t
             where t.user_id =${tok.id}`

        pool.query(q,
                   function(error,result){
                    if(error)
                    {
                      return callback
                    }
                    else
                    {
                      // console.log('check the rows',result.rows)
                        if(result.rows[0])
                        {
                          tq = `UPDATE verifacto.terminals
                                   SET user_id=null
                                      ,status='n'
                                      ,updated_at=now()
                                      ,updated_by=${tok.id}
                                 WHERE user_id=${tok.id}`

                                  pool.query(tq,
                                            function(error,result)
                                            {
                                              if(error)
                                              {
                                                return callback(error)
                                              }
                                            })
                        }
                        // console.log('check the login',result.rows)
                        lq = `UPDATE verifacto.user_logins
                                 SET logout_time=$1
                                    ,updated_at= $2
                                    ,updated_by= $3
                               WHERE user_login_id=$4`
                        pool.query(lq,[end_time,end_time,tok.id,data.id],
                                      function(error,result)
                                      {
                                        if(error)
                                        {
                                          return callback(error)
                                        }
                                        return callback(null, 'agent logged out successfully')
                                      })
                    }
                   }) 
    },
    loginReports:(data,callback)=>
    {
        const page  = parseInt(data.page);
        const limit = parseInt(data.limit);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
         
        var extCond = ``;

        data.today ? (extCond += `and DATE_TRUNC('day', login_time) = CURRENT_DATE `): '' 

        data.entry_team ? 
        data.entry_team === '2' ?
         (extCond += `and at2.team_id  != 1  `)
        :
         (extCond += `and at2.team_id  = ${data.entry_team}`)
        : ''

        if(data.startTime && data.endTime)
        {
          data.startDate && data.endDate
            ? (extCond += `and ul.login_time >= '${data.startDate +' '+data.startTime }' 
                           and ul.logout_time < '${data.endDate+' '+data.endTime}' `)
            :'' 
        }
        else
        {
          data.startDate && data.endDate
            ? (extCond += `and date(ul.login_time) between '${data.startDate}' and '${data.endDate}'`)
            :''
        }
        if(data.page && data.limit)
        {
          q =`select u.employee_id 
                    ,concat(u.firstname,' ',u.lastname) as name
                    ,TO_CHAR(min(ul.login_time), 'DD-MM-YYYY') as login_date
                    ,TO_CHAR(min(ul.login_time),'HH24:MI:SS')  as login_time 
                    ,TO_CHAR(max(ul.logout_time),'HH24:MI:SS') as logout_time 
                    ,TO_CHAR(max(ul.logout_time) - min(login_time),'HH24:MI:SS') login_hours
                from verifacto.user_logins ul 
           left join verifacto.users u 
                  on u.user_id = ul.user_id
          left join verifacto.assign_teams at2   
                 on at2.user_id = u.user_id   
              where ul.user_id = u.user_id
                and u.active_flag != 'n'
                ${extCond}   
              group by u.user_id 
              order by login_date
              LIMIT ${endIndex} OFFSET ${startIndex}`
        } 
        else
        {
          q =`select u.employee_id 
                    ,concat(u.firstname,' ',u.lastname) as name
                    ,TO_CHAR(min(ul.login_time), 'DD-MM-YYYY') as login_date
                    ,TO_CHAR(min(ul.login_time),'HH24:MI:SS')  as login_time 
                    ,TO_CHAR(max(ul.logout_time),'HH24:MI:SS') as logout_time 
                    ,TO_CHAR(max(ul.logout_time) - min(login_time),'HH24:MI:SS') login_hours
                from verifacto.user_logins ul 
           left join verifacto.users u 
                  on u.user_id = ul.user_id
          left join verifacto.assign_teams at2   
                  on at2.user_id = u.user_id  
              where ul.user_id = u.user_id
                and u.active_flag != 'n'
                ${extCond}   
              group by u.user_id 
              order by login_date`
        }
   
          pool.query(q, 
                  function(error,result){
                    if(error)
                    {
                      return callback(error)
                    }
                    return callback(null,result.rows)
                  })
    },
    loginReportCounts:(data,callback)=>
    {        
        let extCond = `where true `;
       
        data.today ? (extCond += `and DATE_TRUNC('day', login_time) = CURRENT_DATE `): '' 

        data.entry_team ? (extCond += `and at2.team_id = ${data.entry_team} `): ''

        if(data.startTime && data.endTime)
        {
          data.startDate && data.endDate
            ? (extCond += `and ul.login_time >= '${data.startDate +' '+data.startTime }' 
                          and ul.logout_time <= '${data.endDate+' '+data.endTime}' `)
            :'' 
        }
        else
        {
          data.startDate && data.endDate
            ? (extCond += `and ul.login_time >= '${data.startDate}' 
                          and ul.logout_time <= '${data.endDate}' `)
            :''
        }

            q =`select u.employee_id 
                      ,concat(u.firstname,' ',u.lastname) as name
                      ,TO_CHAR(min(ul.login_time), 'YYYY-MM-DD') as login_date
                      ,TO_CHAR(min(ul.login_time),'HH24:MI:SS')  as login_time 
                      ,TO_CHAR(max(ul.logout_time),'HH24:MI:SS') as logout_time 
                      ,TO_CHAR(max(ul.logout_time) - min(login_time),'HH24:MI:SS') login_hours
                  from verifacto.user_logins ul 
              left join verifacto.users u 
                    on u.user_id = ul.user_id 
                 where ul.user_id = u.user_id
                   and u.active_flag != 'n'
                   ${extCond}   
              group by u.user_id 
              order by login_date`
                  
        pool.query(q, 
                  function(error,result){
                    if(error)
                    {
                      return callback(error)
                    }
                    return callback(null,result.rowCount)
                  })
    },
    forceLogouts:(data,tok,callback)=>
    {
      const endtime = moment.tz('America/New_York').format('YYYY-MM-DD HH:mm:ss.SSS');

        q=`select t.user_id
                 ,u.tokens
             from verifacto.terminals t
        left join verifacto.users u
               on u.user_id  = t.user_id  
            where t.terminal_id = $1`

         pool.query(q,[data.id],
                    function(error,result)
                    {
                      if(error)
                      {
                        return callback(error)
                      }
                      else
                      {
                        
                        var user_ids  = result.rows[0].user_id
                        if(result.rowCount !=0)
                        {
                          uq = `UPDATE verifacto.terminals
                                   SET user_id=null
                                      ,status='n'
                                      ,updated_at=now()
                                 WHERE terminal_id=${data.id}`
                          pool.query(uq,
                                     function(error,result)
                                     {
                                      if(error)
                                      {
                                        return callback(error)
                                      }
                                      lq = ` update verifacto.user_logins
                                                set logout_time = $1
                                                   ,logout_by = 'admin'
                                                   ,updated_by = $2
                                              where user_id = $3
                                                and login_time :: date = current_date 
                                                and login_time is not null
                                                and logout_time is null`
                                                console.log('check the lq', lq)
                                      pool.query(lq,[endtime,tok.id,user_ids],
                                                 function()
                                                 {
                                                  if(error)
                                                  {
                                                    return callback(error)
                                                  }
                                                   return callback(null,'terminal will be available now')
                                                 })

                                     })
                        }
                      }
                    })
    },
    checkTerminalAccess:(tok,callback)=>
    {
      q = `select *
             from verifacto.terminals t 
            where user_id = ${tok.id}`

        pool.query(q,
                   function(error,result)
                   {
                    if(error)
                    {
                      return callback(error)
                    }
                    else
                    {
                      console.log('sss',result.rowCount,tok.id)
                      if (result.rowCount == 0)
                      {
                        return callback(null,"not choosed terminal")
                      }
                      else
                      {
                        return callback(null,"choosed terminal")  
                      }
                    }
                      
                   })
    }
}