const {pool} = require('../config/database');
// const moment = require('moment'); 
const moment = require('moment-timezone'); 


module.exports = 
{
    addBreaks:async(data,tok,callback)=>
    {
      try{
         if(!data.break_hours) 
         return callback('break hours is missing, please check it out')
       
        if(!data.break_minutes) 
         return callback('break minutes is missing')

        var break_duration = `${data.break_hours}:${data.break_minutes}`

        var ins = await pool.query(`INSERT INTO verifacto.breaks
                                    (break_name, break_duration,break_hours,break_minutes,time_bound
                                    ,created_at, updated_at, created_by, updated_by)
                                    VALUES($1, $2, $3, $4,$5, now(), now(), $6, $7)`,
                                    [data.break_name, break_duration, data.break_hours, data.break_minutes,data.time_bound
                                    ,tok.id, tok.id ]) 
            return callback(null, 'break type added successfully')
        }
        catch(err)
        {
            return callback(err.detail)
        }
    },
    updateBreaks:async(data,tok,callback)=>
    {
        try
        {
           if(!data.break_id) 
             return callback('break id is missing')
            
            if(!data.break_hours) 
             return callback('break hours is missing')
            
            if(!data.break_minutes) 
             return callback('break minutes is missing')

           var check = await pool.query(`select * from verifacto.breaks where break_id=$1`,[data.break_id])

           if(!check.rowCount)
            return callback('break id is not exists')
            var duration = `${data.break_hours}:${data.break_minutes}`

             q = `UPDATE verifacto.breaks
                     SET break_name=$1, break_duration=$2, break_hours=$3, break_minutes=$4
                        ,time_bound=$5,updated_at=now(), updated_by=$6
                   WHERE break_id=$7`

                pool.query(q,[data.break_name,duration,data.break_hours,data.break_minutes,data.time_bound,tok.id,data.break_id],
                            function(error,result){
                              if(error)
                              {
                                return callback(error)
                              }
                              return callback(null,'break updated successfully')
                            })
        }
        catch(err)
        {
            return callback(err.detail)
        }
    },
    getAllBreaks:async(data,callback)=>
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
            var alls  = await pool.query(`select  b2.break_id , b2.break_name , b2.break_hours , b2.break_minutes , b2.break_duration 
                                        ,b2.created_at , u3.email_id_1  as created_by  , b2.updated_at , u4.email_id_1 as updated_by
                                        ,b2.time_bound 
                                        from  verifacto.breaks b2 
                                        join  verifacto.users u3 
                                        on u3.user_id = b2.created_by 
                                        join  verifacto.users u4 
                                        on u4.user_id = b2.updated_by
                                        where b2.break_status != 'n' 
                                        group by b2.break_id , u3.user_id , u4.user_id 
                                        order by b2.break_id desc
                                        LIMIT ${endIndex} OFFSET ${startIndex}
                                        `)
           return callback(null,alls.rows, alls.rowCount);
         }
         else
         {
           var alls  = await pool.query(`select  b2.break_id , b2.break_name , b2.break_hours , b2.break_minutes , b2.break_duration 
                                        ,b2.created_at , u3.email_id_1  as created_by  , b2.updated_at , u4.email_id_1 as updated_by 
                                        ,b2.time_bound 
                                        from  verifacto.breaks b2 
                                        join  verifacto.users u3 
                                        on u3.user_id = b2.created_by 
                                        join  verifacto.users u4 
                                        on u4.user_id = b2.updated_by 
                                        where b2.break_status != 'n' 
                                        group by b2.break_id , u3.user_id , u4.user_id 
                                        order by b2.break_id desc`)

           return callback(null,alls.rows, alls.rowCount);
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
          const ids = await pool.query(`select  b2.break_id , b2.break_name , b2.break_hours , b2.break_minutes , b2.break_duration 
                                        ,b2.created_at , u3.email_id_1  as created_by  , b2.updated_at , u4.email_id_1 as updated_by
                                        ,b2.time_bound  
                                        from  verifacto.breaks b2 
                                        join  verifacto.users u3 
                                        on u3.user_id = b2.created_by 
                                        join  verifacto.users u4 
                                        on u4.user_id = b2.updated_by 
                                        where b2.break_id = $1
                                        group by b2.break_id , u3.user_id , u4.user_id 
                                        `,[data.id])
            return callback(null, ids.rows)
       }
       catch(err)
       {
        return callback(err.detail)
       }
    },
    deleteByIds:async(data,callback)=>
    {
        try
        { 
          const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?';
          let result = '';
        
            for (let i = 0; i < 12; i++) {
              const randomIndex = Math.floor(Math.random() * charset.length);
              result += charset[randomIndex];
            }

          var del = await pool.query(`UPDATE verifacto.breaks
                                         SET break_status='n'
                                            ,break_name= '${result}'
                                       WHERE break_id= $1`,
                                      [data.id])
            return callback(null,'break type deleted successfully')
        }
        catch(err)
        {
            return callback(err.detail)
        }
    },
    chooseBreaks:(data,tok,callback)=>
    {
      const currentDateAndTime = moment.tz('America/New_York').format('YYYY-MM-DD HH:mm:ss.SSS');

        q = `INSERT INTO verifacto.user_break_history (user_id, break_id, start_time,created_at, updated_at, created_by, updated_by)
             VALUES($1, $2, $3,now(), now(), $4, $5)
             RETURNING user_break_history_id`

        pool.query(q,[tok.id,data.break_id,currentDateAndTime,tok.id, tok.id],
                      function(error,result)
                      {
                        if(error)
                        {
                          console.log(error)
                          return callback(error);
                        }
                        console.log(result);
                        return callback(null,result.rows)
                      })                  
     
    },
    endBreaks:(data,tok,callback)=>
    {
       var end_time = moment.tz('America/New_York').format('YYYY-MM-DD HH:mm:ss.SSS');
      //   const queryss = {
      //         text: 'SELECT verifacto.has_break_exceeded($1)',
      //         values: [data.user_break_history_id],
      //       };

      //       console.log(queryss)

      // pool.query(queryss,
      //            function(error,result)
      //            {
      //               if(error)
      //               {
      //                console.log(error)
      //               }
      //               else
      //               {
      //                 console.log(result)
      //               }
      //            })

      q =  `select ubh.user_id
                  ,ubh.start_time
                  ,b.break_name 
                  ,b.break_duration
                  ,b.time_bound 
            from verifacto.user_break_history ubh 
            join verifacto.breaks b 
              on b.break_id  = ubh.break_id 
            where ubh.user_break_history_id = ${data.user_break_history_id}`


      pool.query(q,
                function(error,result)
                {
                  if(error)
                  {
                    return callback(error);
                  }
                  else
                  {
                    const {user_id,start_time,break_name,break_duration,time_bound} = result.rows[0];
                    // const formatedStartTime = moment.utc(start_time).local().format('YYYY-MM-DD HH:mm:ss.SSS');
                    
                    // console.log('ssss',formatedStartTime)

                    var break_start_time =  new Date(start_time).getTime() ;
                    var break_end_time  = end_time
                    var break_end_times  = new Date(end_time).getTime(); 

                    // console.log('check the break',start_time,break_start_time,break_end_time,break_end_times)
      
                    var break_time = break_duration
                    var taken_time = break_end_times - break_start_time;
                      // var taken_time =  50000
                    const [hours, minutes] = break_time.split(':');
                    const timeStringMilliseconds = (parseInt(hours) * 60 * 60 * 1000) + (parseInt(minutes) * 60 * 1000) ;
                    const exceed_limit = taken_time - timeStringMilliseconds;

                    // oq = `select TO_CHAR(sum(ubh.end_time-ubh.start_time),'HH24:MI:SS')  as total_breaktime
                    //         from verifacto.user_break_history ubh  
                    //        where user_id = ${tok.id}
                    //          and date(start_time) = current_date`

                     if(taken_time <= timeStringMilliseconds || exceed_limit <= 60000  || time_bound ==="no")
                     {
                      sq = `UPDATE verifacto.user_break_history
                               SET end_time=$1, updated_at=now(), updated_by=$2
                             WHERE user_break_history_id = $3`
                        
                             pool.query(sq,[break_end_time,tok.id,data.user_break_history_id],
                                           function(error,result){
                                            if(error)
                                            {
                                              return callback(error);
                                            }
                                            else
                                            {
                                              cs = `select  
                                                      case 
                                                        when '01:00:00'::TIME < COALESCE(sum(x.break_hours), '00:00:00'::interval) THEN 'exceed'
                                                        else 'not-exceed'
                                                      end as break_exceed_status
                                                      from ( select ubh.end_time - ubh.start_time as break_hours
                                                               from verifacto.user_break_history ubh 
                                                               join verifacto.breaks b 
                                                                 on b.break_id = ubh.break_id
                                                              where ubh.user_id = ${tok.id}
                                                                and ubh.start_time :: date = current_date
                                                                and b.time_bound != 'no' 
                                                        ) x`
                                               
                                              pool.query(cs,
                                                          function(error,result)
                                                          {
                                                          if(error)
                                                          {
                                                            return callback(error)
                                                          }
                                                            if(result.rows[0].break_exceed_status === 'not-exceed')
                                                            {
                                                              return callback(null,"back to work")
                                                            }
                                                            if(result.rows[0].break_exceed_status === 'exceed')
                                                            {
                                                              sq = `UPDATE verifacto.user_break_history
                                                                       SET end_time=$1 
                                                                          ,locked_time=$2
                                                                          ,updated_at=now() 
                                                                          ,break_status = 'exceed today break limit'
                                                                          ,updated_by=$3
                                                                      WHERE user_break_history_id = $4`

                                                                  pool.query(sq,[break_end_time,break_end_time,tok.id,data.user_break_history_id],
                                                                    function(error,result)
                                                                    {
                                                                      if(error)
                                                                      {
                                                                        return callback(error);
                                                                      }
                                                                      else
                                                                      {
                                                                      return callback(null,"exceed your today break time limit, please contact admin");
                                                                      }
                                                                    })
                                                            }
                                                          })      
                                            }
                                        })
                     }
                     else
                     {
                      sq = `UPDATE verifacto.user_break_history
                               SET end_time=$1 
                                  ,locked_time=$2
                                  ,break_status = 'exceed break duration'
                                  ,updated_at=now() 
                                  ,updated_by=$3
                             WHERE user_break_history_id = $4`
                        
                             pool.query(sq,[break_end_time,break_end_time,tok.id,data.user_break_history_id],
                                           function(error,result){
                                            if(error)
                                            {
                                              return callback(error);
                                            }
                                            else
                                            {
                                              lq = `UPDATE verifacto.users
                                                       SET active_flag='y'
                                                     WHERE user_id = ${user_id}`
                                              pool.query(lq,
                                                function(error,result)
                                                {
                                                  if(error)
                                                  {
                                                    return callback(error);
                                                  }
                                                  else
                                                  {
                                                   return callback(null,"exceed your break time limit, please contact admin");
                                                  }
                                                })
                                               }
                                           })
                     } 
                  }
                })  
    },
    // endBreakss:async(data,tok,callback)=>
    // {
    //     try
    //     {
    //         var findBreakById = await pool.query(`select vb.user_break_history_id  ,vb.break_id , vb.start_time 
    //                                               from verifacto.user_break_history vb  
    //                                                where vb.user_break_history_id = ${data.user_break_history_id}`); 

    //          if(!findBreakById.rowCount)
    //           return callback(null, 'break id not exists')


    //           var break_details = await pool.query(`select b.break_duration , b.break_name  from  verifacto.breaks b 
    //                                                 where b.break_id = ${findBreakById.rows[0].break_id}`)


    //           var break_start_time =  new Date(findBreakById.rows[0].start_time).getTime() ;
    //           var break_end_time  = new Date()
    //           var break_end_times  = new Date().getTime(); 

    //           var break_time = break_details.rows[0].break_duration
    //           var taken_time = break_end_times - break_start_time;
    //             // var taken_time =  50000
    //           const [hours, minutes] = break_time.split(':');
    //           const timeStringMilliseconds = (parseInt(hours) * 60 * 60 * 1000) + (parseInt(minutes) * 60 * 1000) ;
    

    //           if(taken_time <= timeStringMilliseconds || timeStringMilliseconds === 0)
    //           {
    //              await pool.query(`UPDATE verifacto.user_break_history
    //                                   SET end_time=$1, updated_at=now(), updated_by=$2
    //                                 WHERE user_break_history_id = $3`
    //                               ,[break_end_time,tok.id,data.user_break_history_id])
    //              return callback(null,"back to work")
    //           }
    //           else
    //           {
    //               await pool.query(`UPDATE verifacto.user_break_history
    //                                    SET end_time=$1, locked_time=$2, updated_at=now(), updated_by=$3
    //                                  WHERE user_break_history_id = $4`
    //                                 ,[break_end_time,break_end_time,tok.id,data.user_break_history_id])

    //              return callback(null, "exceed your break time limit, please contact admin")
    //           }
            
    //     }
    //     catch(err)
    //     {
    //         return callback(err.detail)
    //     }
    // },
    breakStatusLists:async(data,callback)=>
    {
      try
       {
         const page  = parseInt(data.page);
         const limit = parseInt(data.limit);
            
         const startIndex = (page - 1) * limit;
         const endIndex = page * limit;

         var curr_time = moment.tz('America/New_York').format('YYYY-MM-DD HH:mm:ss.SSS');

         if(data.page && data.limit)
         {
          var list =  await pool.query(`select ubh.user_break_history_id 
                                              ,TO_CHAR(ubh.start_time, 'DD-MM-YYYY')  break_date
                                              ,TO_CHAR((ubh.start_time),'HH24:MI:SS')  out_time
                                              ,TO_CHAR((ubh.end_time),'HH24:MI:SS')    in_time  
                                              ,TO_CHAR((ubh.end_time - ubh.start_time),'HH24:MI:SS')  as break_taken
                                              ,CASE
                                               WHEN ubh.break_status = 'exceed today break limit' THEN NULL
                                               ELSE TO_CHAR((('${curr_time}' - ubh.start_time)-b.break_duration) ,'HH24:MI:SS')
                                               END AS break_exceed
                                              ,b.break_name
                                              ,b.break_duration
                                              ,ubh.break_status
                                              ,concat(u.firstname,' ',u.lastname) as agent
                                          from verifacto.user_break_history    ubh 
                                              ,verifacto.breaks                b
                                              ,verifacto.users                 u
                                         where ubh.locked_time   is not null
                                           and ubh.unlocked_time is null 
                                           and b.break_id         = ubh.break_id
                                           and u.user_id          = ubh.user_id
                                         LIMIT ${endIndex} OFFSET ${startIndex}
                                        `);

         }
         else
         {
          var list =  await pool.query(`select ubh.user_break_history_id 
                                              ,TO_CHAR(ubh.start_time, 'DD-MM-YYYY')  break_date
                                              ,TO_CHAR((ubh.start_time),'HH24:MI:SS')  out_time
                                              ,TO_CHAR((ubh.end_time),'HH24:MI:SS')    in_time  
                                              ,TO_CHAR((ubh.end_time - ubh.start_time),'HH24:MI:SS')  as break_taken
                                              ,CASE
                                               WHEN ubh.break_status = 'exceed today break limit' THEN NULL
                                               ELSE TO_CHAR((('${curr_time}' - ubh.start_time)-b.break_duration) ,'HH24:MI:SS')
                                              END AS break_exceed
                                              ,b.break_name
                                              ,b.break_duration
                                              ,ubh.break_status
                                              ,concat(u.firstname,' ',u.lastname) as agent
                                          from verifacto.user_break_history    ubh 
                                              ,verifacto.breaks                b
                                              ,verifacto.users                 u
                                         where ubh.locked_time   is not null
                                           and ubh.unlocked_time is null 
                                           and b.break_id         = ubh.break_id
                                           and u.user_id          = ubh.user_id
                                           `);

         }
         return callback(null, list.rows);

       }
       catch(err)
       {
        return callback(err.detail)
       }
    },
    unlockBreaks:(data,tok,callback)=>
    {
      var end_time = moment.tz('America/New_York').format('YYYY-MM-DD HH:mm:ss.SSS');

        q = `UPDATE verifacto.user_break_history
                SET unlocked_time=$1
                   ,end_time =$2
                   ,reason=$3
                   ,unlocked_by=$4
              WHERE user_break_history_id = $5
          RETURNING user_id`

        pool.query(q,[end_time,end_time,data.reason, tok.id,data.user_break_history_id],
                      function(error,result)
                      {
                        if(error)
                        {
                          console.log(error)
                          return callback(error);
                        }
                          lq = `UPDATE verifacto.users
                                   SET active_flag='y'
                                 WHERE user_id = ${result.rows[0].user_id}`
                          
                          pool.query(lq,
                                    function(error,result)
                                    {
                                      if(error)
                                      {
                                        return callback(error)
                                      }
                                      else
                                      {
                                       return callback(null,"Unlocked Agent")
                                      }
                                    })
                      }) 
    },
    unlockedBreakLists:(data,tok,callback)=>
    {
      const page  = parseInt(data.page);
      const limit = parseInt(data.limit);
        
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      if(data.page && data.limit) 
      {
        q= `select ubh.user_break_history_id 
                  ,concat(u.firstname,' ',u.lastname) as name 
                  ,ubh.reason
                  ,TO_CHAR(ubh.start_time, 'DD-MM-YYYY')  break_date
                  ,TO_CHAR(ubh.start_time,'HH24:MI:SS')  out_time
                  ,TO_CHAR(ubh.end_time,'HH24:MI:SS')    in_time  
                  ,b.break_name
                  ,b.break_duration as acutal_break_limit
                  ,TO_CHAR(ubh.end_time - ubh.start_time,'HH24:MI:SS') as break_taken
                  ,TO_CHAR( GREATEST(ubh.end_time - ubh.start_time - date_trunc('minute', b.break_duration), INTERVAL '0 minute'),'HH24:MI:SS') AS exceed_break_limit
                  ,TO_CHAR(ubh.unlocked_time,'HH24:MI:SS')  unlocked_time
              from verifacto.user_break_history ubh
              join verifacto.users u 
                on u.user_id = ubh.user_id
              join verifacto.breaks b 
                on b.break_id = ubh.break_id 
            where ubh.unlocked_by = ${tok.id}
         order by ubh.unlocked_time desc
         LIMIT ${endIndex} OFFSET ${startIndex}`  
       }
      else
      {
        q= `select ubh.user_break_history_id 
                  ,concat(u.firstname,' ',u.lastname) as name 
                  ,ubh.reason
                  ,TO_CHAR(ubh.start_time, 'DD-MM-YYYY')  break_date
                  ,TO_CHAR(ubh.start_time,'HH24:MI:SS')  out_time
                  ,TO_CHAR(ubh.end_time,'HH24:MI:SS')    in_time  
                  ,b.break_name
                  ,b.break_duration as acutal_break_limit
                  ,TO_CHAR(ubh.end_time - ubh.start_time,'HH24:MI:SS') as break_taken
                  ,TO_CHAR( GREATEST(ubh.end_time - ubh.start_time - date_trunc('minute', b.break_duration), INTERVAL '0 minute'),'HH24:MI:SS') AS exceed_break_limit
                  ,TO_CHAR(ubh.unlocked_time,'HH24:MI:SS')  unlocked_time
              from verifacto.user_break_history ubh
              join verifacto.users u 
                on u.user_id = ubh.user_id
              join verifacto.breaks b 
                on b.break_id = ubh.break_id 
            where ubh.unlocked_by = ${tok.id}
         order by ubh.unlocked_time desc`
       }
       
       pool.query(q,
                  function(error,result)
                  {
                    if(error)
                    {
                      return callback(error);
                    }
                    return callback(null, result.rows)
                  })
    },   
    unlockedBreakCounts:(data,tok,callback)=>
    {

        q = `select count(ubh.user_break_history_id)
               from verifacto.user_break_history ubh
              where ubh.unlocked_by = ${tok.id}`
       
       pool.query(q,
                  function(error,result)
                  {
                    if(error)
                    {
                      return callback(error);
                    }
                    return callback(null, result.rows)
                  })
    },
    checkAgentBreakStatuss:(tok,callback)=>
    { 
      var end_time = moment.tz('America/New_York').format('YYYY-MM-DD HH:mm:ss.SSS');

      q =`SELECT ubh.user_id
                ,ubh.start_time
                ,b.break_name
                ,b.break_duration
                ,b.time_bound  
                ,ubh.user_break_history_id 
                ,to_char(to_timestamp('${end_time}', 'YYYY-MM-DD HH24:MI:SS.MS') - ubh.start_time,'HH24:MI:SS') limits
                ,case
                 when to_timestamp('${end_time}', 'YYYY-MM-DD HH24:MI:SS.MS') - ubh.start_time > b.break_duration
                  then 'exceed the break'
                  else to_char( (b.break_duration)-( to_timestamp('${end_time}', 'YYYY-MM-DD HH24:MI:SS.MS') - ubh.start_time),'HH24:MI:SS')
                 end as remaining_time
            from verifacto.user_break_history ubh
            join verifacto.breaks b
              on b.break_id = ubh.break_id
           where ubh.user_id = ${tok.id}
                 and (ubh.start_time is not null 
                 and ubh.end_time is null 
                 or ubh.locked_time is not null 
                 and ubh.unlocked_time is null)`

        pool.query(q,
              async function(error,result)
               {
                if(error)
                {
                  return callback(error)
                }
                else
                { 
                  if(result.rowCount === 0)
                   {
                    var data = {
                      'message' :"no break is choosed",
                      'status' : 2
                     }
                    return callback(null,data)
                   }

             else  if(result.rows[0].time_bound === "no")
                      {
                        sq = `UPDATE verifacto.user_break_history
                                 SET end_time=$1
                               WHERE user_break_history_id = $2`
                        pool.query(sq,[end_time,result.rows[0].user_break_history_id],
                                  function(error,result)
                                  {
                                    if(error)
                                    {
                                      return callback(error)
                                    }
                                    var data = {
                                      'message' :"no break is choosed",
                                      'status' : 2
                                     }
                                    return callback(null,data)
                                  })
                      }

             else if(result.rows[0].remaining_time === 'exceed the break')
                  {
                  sq = `UPDATE verifacto.user_break_history
                            SET end_time=$1
                              ,locked_time=$2
                          WHERE user_break_history_id = $3`

                    pool.query(sq,[end_time,end_time,result.rows[0].user_break_history_id],
                      function(error,result)
                      {
                          if(error)
                          {
                            return callback(error)
                          }
                          lq = `UPDATE verifacto.users
                                    SET active_flag='t'
                                  WHERE user_id = ${tok.id}`
                                
                                  pool.query(lq,function(error,result){
                                  if(error)
                                  {
                                    return callback(error)
                                  }
                                  var data = {
                                    'message' :"exceed your break time limit, please contact admin",
                                    'status' : 1
                                  }
                                  return callback(null,data)
                                  })
                          })
                    }
                    else
                    {
                      var data = result.rows[0];
                      data.message = 'still your in break';
                      data.status = 0;
                      return callback(null,data)
                    }
                }
               })
        
    },
    breakReportLists:(data,callback)=>
    {
      const page  = parseInt(data.page);
      const limit = parseInt(data.limit);
        
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      var extCond = ``;

      data.today ? (extCond += `and DATE_TRUNC('day', ubh.start_time) = CURRENT_DATE `): '' 

      data.entry_team ? 
      data.entry_team === '2' ?
       (extCond += `and at2.team_id  != 1  `)
      :
       (extCond += `and at2.team_id  = ${data.entry_team}`)
      : ''
      
     if(data.start_time && data.end_time)
      {
        data.startDate && data.endDate
         ? (extCond += `and ubh.start_time >= '${data.startDate+' '+data.start_time}' 
                        and ubh.end_time < '${data.endDate+' '+data.end_time}' `)
         :''
      } 
     else
      {
       data.startDate && data.endDate
        ? (extCond += ` and date(ubh.start_time) between '${data.startDate}' and '${data.endDate}' `)
        :''
      }

     if(data.page && data.limit)
     {
       q= `select yyy.name
                  ,yyy.user_id
                  ,TO_CHAR(min(yyy.out_time),'YYYY-MM-DD')      break_date
                  ,TO_CHAR(min(yyy.out_time),'HH24:MI:SS')      out_time
                  ,TO_CHAR(max(yyy.in_time),'HH24:MI:SS')       in_time
                  ,TO_CHAR(sum(yyy.break_taken),'HH24:MI:SS')   as break_taken
                  ,TO_CHAR(sum(yyy.time_exceeded),'HH24:MI:SS') as break_exceeded
            from( select ubh.user_id
                        ,(ubh.start_time) out_time
                        ,(ubh.end_time)   in_time
                        ,b.break_duration 
                        ,sum(ubh.end_time - ubh.start_time) as break_taken
                        ,(select concat(u.firstname,' ', u.lastname) as name
                            from verifacto.users u
                          where u.user_id = ubh.user_id
                            ) name
                        ,case 
                          when (sum(ubh.end_time - ubh.start_time) > date_trunc('minute', b.break_duration))
                              then (sum(ubh.end_time - ubh.start_time) - date_trunc('minute', b.break_duration))
                          else null
                        end  as time_exceeded
                   from verifacto.user_break_history ubh
                       ,verifacto.breaks b 
                       ,verifacto.assign_teams at2 
                where b.break_id  = ubh.break_id
                  and at2.user_id = ubh.user_id 
                      ${extCond} 
                group by ubh.start_time
                        ,ubh.end_time 
                        ,b.break_duration
                        ,ubh.user_id
              )yyy
            group by yyy.name
                    ,date_trunc('day',yyy.out_time)
                    ,yyy.user_id
            order by date_trunc('day',yyy.out_time) desc
            LIMIT ${endIndex} OFFSET ${startIndex}`
     }
     else
      {
        q= `select  yyy.name
                   ,yyy.user_id
                   ,TO_CHAR(min(yyy.out_time),'YYYY-MM-DD')      break_date
                   ,TO_CHAR(min(yyy.out_time),'HH24:MI:SS')      out_time
                   ,TO_CHAR(max(yyy.in_time),'HH24:MI:SS')       in_time
                   ,TO_CHAR(sum(yyy.break_taken),'HH24:MI:SS')   as break_taken
                   ,TO_CHAR(sum(yyy.time_exceeded),'HH24:MI:SS') as break_exceeded
                    from( select ubh.user_id
                                ,(ubh.start_time) out_time
                                ,(ubh.end_time)   in_time
                                ,b.break_duration 
                                ,sum(ubh.end_time - ubh.start_time) as break_taken
                                ,(select concat(u.firstname,' ', u.lastname) as name
                                    from verifacto.users u
                                  where u.user_id = ubh.user_id
                                    ) name
                                ,case 
                                  when (sum(ubh.end_time - ubh.start_time) > date_trunc('minute', b.break_duration))
                                      then (sum(ubh.end_time - ubh.start_time) - date_trunc('minute', b.break_duration))
                                  else null
                                end  as time_exceeded
                          from verifacto.user_break_history ubh
                              ,verifacto.breaks b 
                              ,verifacto.assign_teams at2 
                        where b.break_id  = ubh.break_id 
                          and at2.user_id = ubh.user_id
                              ${extCond} 
                        group by ubh.start_time
                                ,ubh.end_time 
                                ,b.break_duration
                                ,ubh.user_id
                      )yyy
                    group by yyy.name
                            ,date_trunc('day',yyy.out_time)
                            ,yyy.user_id
                    order by date_trunc('day',yyy.out_time) desc`
       }

      console.log(q)

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
    dateWiseReportLists:(data,callback)=>
    {
      var extCond = ``;
      
      data?.user_id && data?.date
        ? (extCond += `and ubh.user_id = ${data.user_id}
                       and DATE(start_time) ='${data.date}'`): ''       

      q  = `select y.name
                  ,y.user_id
                  ,TO_CHAR(y.out_time, 'DD-MM-YYYY')          break_date
                  ,TO_CHAR(y.out_time,'HH24:MI:SS')           out_time  
                  ,TO_CHAR(y.in_time,'HH24:MI:SS')            in_time 
                  ,y.break_duration
                  ,y.break_name
                  ,TO_CHAR(break_taken,'HH24:MI:SS') as break_taken
                  ,TO_CHAR(time_exceeded,'HH24:MI:SS') as time_exceeded
            from (select ubh.user_id
                    ,(ubh.start_time) out_time
                    ,(ubh.end_time)   in_time
                    ,b.break_duration 
                    ,b.break_name 
                    ,sum(ubh.end_time - ubh.start_time) as break_taken
                    ,(select concat(u.firstname,' ', u.lastname) as name
                        from verifacto.users u
                      where u.user_id = ubh.user_id
                        ) name
                    ,case 
                    when (sum(ubh.end_time - ubh.start_time) > date_trunc('minute', b.break_duration))
                        then (sum(ubh.end_time - ubh.start_time) - date_trunc('minute', b.break_duration))
                    else null
                  end  as time_exceeded
                from verifacto.user_break_history ubh
                    ,verifacto.breaks b 
              where b.break_id  = ubh.break_id 
                    ${extCond} 
              group by ubh.start_time
                      ,ubh.end_time 
                      ,b.break_duration
                      ,b.break_name 
                      ,ubh.user_id) as y`

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
    breakReportListcounts:(data,callback)=>
    {    
      var extCond = ``;

      data.today ? (extCond += `and DATE_TRUNC('day', ubh.start_time) = CURRENT_DATE `): '' 
      
      data.entry_team ? 
      data.entry_team === '2' ?
       (extCond += `and at2.team_id  != 1  `)
      :
       (extCond += `and at2.team_id  = ${data.entry_team}`)
      : ''

        if(data.start_time && data.end_time)
        {
          data.startDate && data.endDate
          ? (extCond += `and ubh.start_time >= '${data.startDate+' '+data.start_time}' 
                          and ubh.end_time < '${data.endDate+' '+data.start_time}' `)
          :''
        } 
      else
        {
        data.startDate && data.endDate
          ? (extCond += `and ubh.start_time >= '${data.startDate}' and ubh.end_time < '${data.endDate}' `)
          :''
        }

        q= `select  yyy.name
                   ,yyy.user_id
                   ,min(yyy.out_time) as out_time
                   ,max(yyy.in_time) as in_time
                   ,TO_CHAR(sum(yyy.break_taken),'HH24:MI:SS') as break_taken
                   ,TO_CHAR(sum(yyy.time_exceeded),'HH24:MI:SS') as break_exceeded
                    from( select ubh.user_id
                                ,(ubh.start_time) out_time
                                ,(ubh.end_time)   in_time
                                ,b.break_duration 
                                ,sum(ubh.end_time - ubh.start_time) as break_taken
                                ,(select concat(u.firstname,' ', u.middlename, ' ', u.lastname) as name
                                    from verifacto.users u
                                  where u.user_id = ubh.user_id
                                    ) name
                                ,case 
                                  when (sum(ubh.end_time - ubh.start_time) > date_trunc('minute', b.break_duration))
                                      then (sum(ubh.end_time - ubh.start_time) - date_trunc('minute', b.break_duration))
                                  else null
                                end  as time_exceeded
                          from verifacto.user_break_history ubh
                              ,verifacto.breaks b 
                              ,verifacto.assign_teams at2 
                        where b.break_id  = ubh.break_id
                          and at2.user_id = ubh.user_id 
                              ${extCond} 
                        group by ubh.start_time
                                ,ubh.end_time 
                                ,b.break_duration
                                ,ubh.user_id
                      )yyy
                    group by yyy.name
                            ,date_trunc('day',yyy.out_time)
                            ,yyy.user_id
                    order by date_trunc('day',yyy.out_time) desc`
         
        pool.query(q,
                   function(error,result)
                   {
                    if(error)
                    {
                      return callback(error)
                    }
                    return callback(null, result.rowCount)
                   })
    },
    todayRemainingBreakTimes:(tok,callback)=>
    {
      rm = `select
              case
                when COALESCE(sum(x.break_hours), '00:00:00'::interval) < '01:00:00'::TIME  
                then  TO_CHAR((COALESCE('01:00:00'::TIME - sum(x.break_hours), '01:00:00'::TIME)),'HH24:MI:SS') 
                else 'today exceed your break limit'
              end as remaining_break_hours
            from ( select ubh.end_time - ubh.start_time as break_hours
                     from verifacto.user_break_history ubh
                     join verifacto.breaks b 
                       on b.break_id = ubh.break_id 
                    where ubh.user_id = ${tok.id}
                      and ubh.start_time :: date = current_date 
                      and b.time_bound != 'no'
                ) x`

          pool.query(rm,
                     function(error,result)
                     {
                      if(error)
                      {
                        return callback(error)
                      }
                      return callback(null,result.rows)
                     })
    }
}