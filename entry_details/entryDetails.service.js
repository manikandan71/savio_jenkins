const {pool} = require('../config/database');
const moment = require('moment-timezone'); 

module.exports={
    addEntrys:async(data,tok,callback)=>
    {
      try
      {

        //  var alls = JSON.parse(data.array); 
         var alls = data.array;
         console.log('alls data', alls)

        const current_time = moment.tz('America/New_York').format('YYYY-MM-DD HH:mm:ss.SSS');
        const currentTimeMoment = moment.tz(current_time, 'America/New_York');

        const duration = data.duration
        const durationParts = duration.split(':').map(part => parseInt(part, 10));

        const durationMoment = moment.duration({
          hours:   durationParts[0],
          minutes: durationParts[1],
          seconds: durationParts[2]
        });

        const startTimeMoment = currentTimeMoment.subtract(durationMoment);

        // Convert duration parts to seconds
        const durationInSeconds = durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2];

        // Calculate average
        const averageInSeconds = durationInSeconds / alls.length;

        // Convert average back to hours, minutes, and seconds
        const averageHours = Math.floor(averageInSeconds / 3600);
        const averageMinutes = Math.floor((averageInSeconds % 3600) / 60);
        const averageSeconds = averageInSeconds % 60;

        const average = `${averageHours.toString().padStart(2, '0')}:${averageMinutes.toString().padStart(2, '0')}:${averageSeconds.toString().padStart(2, '0')}`;


        data.start_time = startTimeMoment.format('YYYY-MM-DD HH:mm:ss.SSS');
        data.end_time = current_time;
      
        
        var terminal_history  = await pool.query(`select t.terminal_id ,t.terminal_name ,t.status 
                                                  from verifacto.terminals t  
                                                  where t.user_id = ${tok.id}
                                                    and t.status = 'y'`)
     
         if(!terminal_history.rowCount)
          return callback("please choose terminal before start entries") 

          var ter_name  = terminal_history.rows[0].terminal_name
          // var ter_name = 'terminal-1'
         
        
        if(alls.length === 1)
        {
          var entryId = await pool.query(`INSERT INTO verifacto.entry_details
                                         ( user_id 
                                          ,document_id 
                                          ,vin_number 
                                          ,customer_first_name 
                                          ,customer_last_name 
                                          ,insurance_id 
                                          ,leinholder_id 
                                          ,description 
                                          ,start_time 
                                          ,end_time 
                                          ,created_at 
                                          ,updated_at 
                                          ,created_by 
                                          ,updated_by
                                          ,terminal_name
                                          ,entry_team
                                          ,average_time_taken
                                          ) 
                                          VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now(),now(),$11,$12,$13,$14,$15) 
                                          RETURNING entry_id`,
                                        [
                                          tok.id
                                         ,data.document_id
                                         ,alls[0].vin_number
                                         ,alls[0].customer_first_name
                                         ,alls[0].customer_last_name
                                         ,alls[0].insurance_id
                                         ,alls[0].leinholder_id
                                         ,alls[0].description
                                         ,data.start_time
                                         ,data.end_time
                                         ,tok.id
                                         ,tok.id
                                         ,ter_name
                                         ,data.entry_team
                                         ,average
                                        ])                          
          return callback(null, 'entry added successfully');
        }

        else
      {
        var entryId = await pool.query(`INSERT INTO verifacto.entry_details
                                              (  user_id 
                                                ,document_id 
                                                ,vin_number 
                                                ,customer_first_name 
                                                ,customer_last_name 
                                                ,insurance_id 
                                                ,leinholder_id 
                                                ,description 
                                                ,start_time 
                                                ,end_time 
                                                ,created_at 
                                                ,updated_at 
                                                ,created_by 
                                                ,updated_by
                                                ,terminal_name
                                                ,entry_team
                                                ,average_time_taken
                                                ) 
                                                VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now(),now(),$11,$12,$13,$14,$15)  
                                                RETURNING entry_id`,
                                                [
                                                  tok.id
                                                 ,data.document_id
                                                 ,alls[0].vin_number
                                                 ,alls[0].customer_first_name
                                                 ,alls[0].customer_last_name
                                                 ,alls[0].insurance_id
                                                 ,alls[0].leinholder_id
                                                 ,alls[0].description
                                                 ,data.start_time
                                                 ,data.end_time
                                                 ,tok.id
                                                 ,tok.id
                                                 ,ter_name
                                                 ,data.entry_team
                                                 ,average
                                                ])

            if(entryId.rows[0].entry_id)
            {
              for(let i=1; i< alls.length; i++)
              {
        
                  await pool.query(`INSERT INTO verifacto.entry_details
                                    ( entry_id
                                     ,user_id 
                                     ,document_id 
                                     ,vin_number 
                                     ,customer_first_name 
                                     ,customer_last_name
                                     ,insurance_id 
                                     ,leinholder_id 
                                     ,description 
                                     ,start_time 
                                     ,end_time
                                     ,created_at 
                                     ,updated_at 
                                     ,created_by 
                                     ,updated_by 
                                     ,terminal_name
                                     ,entry_team
                                     ,average_time_taken
                                     )
                                     VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,now(),now(),$12,$13,$14,$15,$16)`,
                                    [ entryId.rows[0].entry_id
                                     ,tok.id,data.document_id
                                     ,alls[i].vin_number
                                     ,alls[i].customer_first_name
                                     ,alls[i].customer_last_name
                                     ,alls[i].insurance_id
                                     ,alls[i].leinholder_id
                                     ,alls[i].description
                                     ,data.start_time
                                     ,data.end_time
                                     ,tok.id
                                     ,tok.id
                                     ,ter_name
                                     ,data.entry_team
                                     ,average
                                    ]
                                  )
              }
            return callback(null, 'entry added successfully');
            }                            
        }

      }
      catch(err)
      {
        return callback(err.detail)
      }
    },
    updateEntrys:async(data,tok,callback)=>
    {
      try
      {
        // var columns = Object.keys(data);
        // var values = Object.values(data);
        // const setClause = columns.map((column, index) => `${column} = $${index + 1}`).join(', ');
        // const query = {
        //      text: `UPDATE verifacto.entry_details SET ${setClause},updated_by= $${columns.length + 1} ,updated_at=now()  WHERE id = $${columns.length + 2}`,
        //      values: [...values,tok.id, param.id],
        //       };
        const res = await pool.query(`UPDATE verifacto.entry_details
                                         SET vin_number=$1 
                                            ,customer_first_name=$2 
                                            ,customer_last_name=$3
                                            ,insurance_id=$4 
                                            ,leinholder_id=$5 
                                            ,description=$6  
                                            ,updated_at=now()  
                                            ,updated_by=$7
                                            ,edit_report = 1 
                                       WHERE id=$8`,
                                      [data.vin_number,data.customer_first_name,data.customer_last_name, data.insurance_id,
                                        data.leinholder_id,data.description,tok.id,data.id]
                                    )
        return callback(null, res);
      }
      catch(err)
      {
        return callback(err.detail)
      }
    },
    getAllEntrys:async(data,callback)=>
    {
      try
      {
       const alls = await pool.query(`SELECT *
                                      FROM verifacto.entry_details
                                     `);
        return callback(null,alls.rows, alls.rowCount)
      }
      catch(err)
      {
        return callback(err.detail)
      }
    },
    getEntryByIds:async(data,callback)=>
    {
      try
      {
        const byId = await pool.query(`SELECT entry_id, user_id, vin_number, customer_first_name, 
                                      customer_last_name, insurance_id, leinholder_id, description, 
                                      start_time, end_time, created_at, updated_at, created_by, updated_by
                                      FROM verifacto.entry_details
                                      WHERE entry_id=$1
                                      `,[data.id])
        return callback(null, byId.rows);
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
        const del = await pool.query(`DELETE FROM verifacto.entry_details
                                      WHERE id=$1`
                                      ,[data.id]
                                    )
          return callback(null, del);
      }
      catch(err)
      {
        return callback(err.detail)
      }
    },
    todayEntryDatas:async(data,tok,callback)=>
    {
      try
      {
        const page  = parseInt(data.page);
        const limit = parseInt(data.limit);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
         
        let extCond = ``;

        data.entry_team ?
          (extCond += `and ed.entry_team  = ${data.entry_team}`)
          :''
     
        if(data.page!= null && data.limit != null)
        {
           const todayEntry  = await pool.query(`select ed.id 
                                                        ,ed.entry_id 
                                                        ,ed.terminal_name 
                                                        ,ed.document_id 
                                                        ,dt.document_name 
                                                        ,ed.vin_number
                                                        ,ed.customer_first_name 
                                                        ,ed.customer_last_name
                                                        ,ic.insurance_company_name as insurance_name 
                                                        ,l.leinholder_name,ed.description 
                                                        ,l.leinholder_id 
                                                        ,ic.insurance_id 
                                                        ,TO_CHAR(ed.average_time_taken,'HH24:MI:SS')  as average_time_taken
                                                        ,ed.edit_report 
                                                    from verifacto.entry_details ed
                                                      join verifacto.lienholders l
                                                      on ed.leinholder_id = l.leinholder_id
                                                    join verifacto.insurance_companies ic
                                                      on ed.insurance_id = ic.insurance_id
                                                    join verifacto.document_types dt 
                                                      on dt.document_id  = ed.document_id
                                                  where ed.start_time::date = CURRENT_DATE 
                                                    and ed.user_id = $1
                                                    ${extCond}
                                                  group by ed.id  
                                                          ,ic.insurance_id 
                                                          ,l.leinholder_id 
                                                          ,dt.document_id
                                                  order by ed.id desc
                                              LIMIT ${endIndex} OFFSET ${startIndex}`
                                            ,[tok.id])
            return callback(null, todayEntry.rows, todayEntry.rowCount) 
        }
        else
        {
          const todayEntry  = await pool.query(`select ed.id 
                                                      ,ed.entry_id 
                                                      ,ed.terminal_name 
                                                      ,ed.document_id 
                                                      ,dt.document_name 
                                                      ,ed.vin_number
                                                      ,ed.customer_first_name 
                                                      ,ed.customer_last_name
                                                      ,ic.insurance_company_name as insurance_name 
                                                      ,l.leinholder_name,ed.description 
                                                      ,l.leinholder_id 
                                                      ,ic.insurance_id 
                                                      ,TO_CHAR(ed.average_time_taken,'HH24:MI:SS')  as average_time_taken
                                                      ,ed.edit_report 
                                                  from verifacto.entry_details ed
                                                    join verifacto.lienholders l
                                                    on ed.leinholder_id = l.leinholder_id
                                                  join verifacto.insurance_companies ic
                                                    on ed.insurance_id = ic.insurance_id
                                                  join verifacto.document_types dt 
                                                    on dt.document_id  = ed.document_id
                                                where ed.start_time::date = CURRENT_DATE 
                                                  and ed.user_id = $1
                                                  ${extCond}
                                                group by ed.id  
                                                        ,ic.insurance_id 
                                                        ,l.leinholder_id 
                                                        ,dt.document_id
                                                order by ed.id desc`
                                            ,[tok.id])
            return callback(null, todayEntry.rows, todayEntry.rowCount) 
        }
                                    
      }
      catch(err)
      {
        return callback(err.detail)
      }
    },
    todayEntryCounts:async(data,tok,callback)=>
    {
      try
      {
        let extCond = ``;

        data.id ?
          (extCond += `and ed.entry_team  = ${data.id}`)
          :''

        const todayEntry  = await pool.query(`select count (distinct ed.id)
                                                from verifacto.entry_details ed
                                               where ed.start_time::date = CURRENT_DATE 
                                                 and ed.user_id = $1
                                                 ${extCond}
                                                 `
                                             , [tok.id])
        return callback(null,todayEntry.rows)                              
      }
      catch(err)
      {
        return callback(err.detail)
      }
    },
    todayDailyCounts:async(data,tok,callback)=>
    {
      try
      {
        let extCond = ``;

        data.id ?
          (extCond += `and ed.entry_team  = ${data.id}`)
          :''

        const todayEntry  = await pool.query(`select count (distinct ed.entry_id)
                                                from verifacto.entry_details ed
                                               where ed.start_time::date = CURRENT_DATE 
                                                 and ed.user_id = $1
                                                 ${extCond}`
                                             , [tok.id])
        return callback(null,todayEntry.rows)                        
      }
      catch(err)
      {
        return callback(err.detail)
      }
    },
    getAllEntryByAgentandAdmins:async(data,tok,callback)=>
    {
      try
      {
        const page  = parseInt(data.page);
        const limit = parseInt(data.limit);

        let extCond = `where true `;

        if (data.search != "" && data.search != undefined) {
            extCond += `and u.firstname                 ilike '%${data.search}%' 
                         OR u.lastname                  ilike '%${data.search}%'  
                         OR dt.document_name            ilike '%${data.search}%'  
                         OR ed.vin_number               ilike '%${data.search}%'  
                         OR ic.insurance_company_name   ilike '%${data.search}%'  
                         OR l.leinholder_name           ilike '%${data.search}%'  
                         OR ed.description              ilike '%${data.search}%'  
                        `;
        }

        if(data.startTime && data.endTime)
        {
          data.startDate && data.endDate && data.startTime && data.endTime
           ? (extCond += ` and ed.start_time >='${data.startDate +' '+ data.startTime}' 
                          and ed.end_time <='${data.endDate +' '+ data.endTime }'`)
           :''
        }
        else
        {
          data.startDate && data.endDate
          ? (extCond += ` and date(ed.start_time) between '${data.startDate}' and '${data.endDate}' `)
          :''
        }
        data.today ?
        (extCond += ` and ed.start_time::date = CURRENT_DATE`)
        :''

        data.entry_team ?
        (extCond += ` and ed.entry_team = ${data.entry_team}`)
        :''
        
        data.leinholder_id
         ? (extCond += ` and l.leinholder_id = ${data.leinholder_id}`)
         :''
        
        data.insurance_company_name
         ? (extCond += ` and ic.insurance_company_name = ${data.insurance_company_name}`)
         :''

        data?.customer_first_name &&  data?.customer_last_name
         ? (extCond += ` and ed.customer_first_name like '%${data.customer_first_name}'
                         and ed.customer_last_name like '%${data.customer_last_name}' `)
         : 
        data?.customer_first_name 
         ? (extCond += ` and ed.customer_first_name like '%${data.customer_first_name}'`)
         :
        data?.customer_last_name 
         ? (extCond += ` and ed.customer_last_name like '%${data.customer_last_name}'`)
         : 
         ''
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

       if(tok.role_name != 'Agent')
       {
        if(data.page!= null && data.limit != null)
        {
          q= `select ed.id 
                    ,ed.entry_id 
                    ,ed.document_id
                    ,dt.document_name
                    ,ed.terminal_name 
                    ,ed.vin_number 
                    ,ed.customer_first_name
                    ,ed.customer_last_name
                    ,ic.insurance_company_name as insurance_name 
                    ,l.leinholder_name,ed.description 
                    ,TO_CHAR(ed.start_time, 'DD-MM-YYYY')  entry_date
                    ,l.leinholder_id 
                    ,ic.insurance_id 
                    ,TO_CHAR(ed.average_time_taken,'HH24:MI:SS')  as average_time_taken
                    ,concat(u.firstname,' ',u.lastname) name
                    ,u.employee_id 
                from verifacto.entry_details ed
                join verifacto.lienholders l
                  on ed.leinholder_id = l.leinholder_id
                join verifacto.insurance_companies ic
                  on ed.insurance_id = ic.insurance_id
                join verifacto.document_types dt 
                  on dt.document_id  = ed.document_id
                join verifacto.assign_teams at2 
                  on at2.user_id = ed.user_id
                join verifacto.users u 
                  on u.user_id = ed.user_id  
                   ${extCond}
              group by ed.id 
                      ,ic.insurance_id 
                      ,l.leinholder_id
                      ,dt.document_id
                      ,u.user_id 
              order by ed.id desc
              LIMIT ${endIndex} OFFSET ${startIndex}`
        }
        else
        {
          q= `select ed.id 
                    ,ed.entry_id 
                    ,ed.document_id
                    ,dt.document_name
                    ,ed.terminal_name 
                    ,ed.vin_number 
                    ,ed.customer_first_name
                    ,ed.customer_last_name
                    ,ic.insurance_company_name as insurance_name 
                    ,l.leinholder_name,ed.description 
                    ,TO_CHAR(ed.start_time, 'DD-MM-YYYY')  entry_date
                    ,l.leinholder_id 
                    ,ic.insurance_id 
                    ,TO_CHAR(ed.average_time_taken,'HH24:MI:SS')  as average_time_taken
                    ,concat(u.firstname,' ',u.lastname) name
                    ,u.employee_id 
                from verifacto.entry_details ed
                join verifacto.lienholders l
                  on ed.leinholder_id = l.leinholder_id
                join verifacto.insurance_companies ic
                  on ed.insurance_id = ic.insurance_id
                join verifacto.document_types dt 
                  on dt.document_id  = ed.document_id
                join verifacto.assign_teams at2 
                  on at2.user_id = ed.user_id 
                join verifacto.users u 
                  on u.user_id = ed.user_id 
                   ${extCond}
              group by ed.id 
                      ,ic.insurance_id 
                      ,l.leinholder_id,dt.document_id
                      ,u.user_id 
              order by ed.id desc`
        }
        const alls  = await pool.query(q);
        return callback(null,alls.rows,alls.rowCount)
       }
       else
       {
        let extCond = `where true and ed.user_id = ${tok.id} `;

        if(data.page!= null && data.limit != null)
        {
          q =`select ed.id
                    ,concat(u.firstname,' ',u.lastname) as name
                    ,u.employee_id 
                    ,u.email_id_1 
                    ,ed.entry_id 
                    ,ed.document_id
                    ,dt.document_name
                    ,ed.terminal_name
                    ,ed.vin_number
                    ,ed.customer_first_name
                    ,ed.customer_last_name
                    ,ic.insurance_company_name as insurance_name 
                    ,l.leinholder_name
                    ,ed.description 
                    ,TO_CHAR(ed.start_time, 'DD-MM-YYYY')  entry_date
                    ,l.leinholder_id 
                    ,ic.insurance_id 
                    ,TO_CHAR(ed.average_time_taken,'HH24:MI:SS')  as average_time_taken
              from verifacto.entry_details ed
              join verifacto.lienholders l
                on ed.leinholder_id = l.leinholder_id
              join verifacto.insurance_companies ic
                on ed.insurance_id = ic.insurance_id
              join verifacto.document_types dt 
                on dt.document_id  = ed.document_id
              join verifacto.users u 
                on u.user_id = ed.user_id 
                    ${extCond}
          order by ed.id desc
          LIMIT ${endIndex} OFFSET ${startIndex}`
        }
        else
        {
           q = `select ed.id
                      ,concat(u.firstname,' ',u.lastname) as name
                      ,u.employee_id 
                      ,u.email_id_1 
                      ,ed.entry_id 
                      ,ed.document_id
                      ,dt.document_name
                      ,ed.terminal_name
                      ,ed.vin_number
                      ,ed.customer_first_name
                      ,ed.customer_last_name
                      ,ic.insurance_company_name as insurance_name 
                      ,l.leinholder_name
                      ,ed.description 
                      ,TO_CHAR(ed.start_time, 'DD-MM-YYYY')  entry_date
                      ,l.leinholder_id 
                      ,ic.insurance_id 
                      ,TO_CHAR(ed.average_time_taken,'HH24:MI:SS')  as average_time_taken
                  from verifacto.entry_details ed
                  join verifacto.lienholders l
                    on ed.leinholder_id = l.leinholder_id
                  join verifacto.insurance_companies ic
                    on ed.insurance_id = ic.insurance_id
                  join verifacto.document_types dt 
                    on dt.document_id  = ed.document_id
                  join verifacto.users u 
                    on u.user_id = ed.user_id 
                    ${extCond}
              order by ed.id desc`
        }
    
         const alls = await pool.query(q)

         return callback(null,alls.rows,alls.rowCount)
       }
      }
      catch(err)
      {
        return callback(err.detail)
      }
    },
    getEntriesTotals:async(data,tok,callback)=>
    {
       try
       {
        if(tok.role_name != 'Agent')
        {
         let extCond = `where true `;

          if(data.startTime && data.endTime)
          {
            data.startDate && data.endDate && data.startTime && data.endTime
              ? (extCond += `and ed.start_time >='${data.startDate +' '+ data.startTime}' 
                            and ed.end_time <='${data.endDate +' '+ data.endTime }' `)
              :''
          }
          else
          {
            data.startDate && data.endDate
            ? (extCond += `and ed.start_time::date  >='${data.startDate}' and ed.end_time::date  <='${data.endDate}' `)
            :''
          }

         data.today ?
          (extCond += `and ed.start_time::date = CURRENT_DATE`)
          :''

        data.entry_team ?
          (extCond += `and ed.entry_team = ${data.entry_team}`)
          :''

         data.leinholder_id
          ? (extCond += `and l.leinholder_id = ${data.leinholder_id}`)
          :''
         
         data.insurance_company_name
          ? (extCond += `and ic.insurance_company_name = ${data.insurance_company_name}`)
          :''
 
         data?.customer_first_name &&  data?.customer_last_name
          ? (extCond += `and ed.customer_first_name like '%${data.customer_first_name}'
                         and ed.customer_last_name like '%${data.customer_last_name}' `)
          : 
         data?.customer_first_name 
          ? (extCond += `and ed.customer_first_name like '%${data.customer_first_name}'`)
          :
         data?.customer_last_name 
          ? (extCond += `and ed.customer_last_name like '%${data.customer_last_name}'`)
          : 
          ''

         const alls  = await pool.query(`select count(ed.id) 
                                            from verifacto.entry_details ed
                                            join verifacto.assign_teams at2 
                                            on at2.user_id = ed.user_id 
                                         ${extCond}`)
         return callback(null, alls.rows)
        }
        else
        {
          let extCond = `where true and user_id = ${tok.id} `;

          if(data.startTime && data.endTime)
          {
            data.startDate && data.endDate && data.startTime && data.endTime
              ? (extCond += `and ed.start_time >='${data.startDate +' '+ data.startTime}' 
                            and ed.end_time <='${data.endDate +' '+ data.endTime }' `)
              :''
          }
          else
          {
            data.startDate && data.endDate
            ? (extCond += `and ed.entry_date >='${data.startDate}' and ed.entry_date <='${data.endDate}' `)
            :''
          }

          const alls = await pool.query(`select count(ed.id) 
                                          from verifacto.entry_details ed
                                         ${extCond}`)
          return callback(null, alls.rows)
        }
       }
       catch(err)
       {
        return callback(err.detail)
       }
    },
    getOverAllMyCounts:async(data,tok,callback)=>
    {
      try
      {
         let extCond = `where true and ed.user_id = ${tok.id} `;

         data.startDate && data.endDate
          ? (extCond += `and ed.start_time >='${data.startDate}' and ed.end_time <='${data.endDate}' `)
          :'' 
               
         const overAllMycount  = await pool.query(`select count (distinct ed.entry_id)
                                                  from  verifacto.entry_details ed
                                                  ${extCond}`)
                                                  
        return callback(null,overAllMycount.rows);   
      }
      catch(err)
      {
        return callback(err.detail)
      }
    },
    getAgentWiseReports:(data,callback)=>
    {
        const page  = parseInt(data.page);
        const limit = parseInt(data.limit);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        
        let extCond = ``;
        data.today ? (extCond += `and DATE_TRUNC('day', ed.start_time) = CURRENT_DATE `) : ""

        const curr_time = moment.tz('America/New_York').format('YYYY-MM-DD HH:mm:ss.SSS');

        console.log('check the curr',curr_time)
  
        if(data.startTime && data.endTime)
        {
          data.startDate && data.endDate
            ? (extCond += `and ed.start_time >= '${data.startDate +' '+data.startTime}' 
                           and ed.end_time <  '${data.endDate +' '+ data.endTime}' `)
            :''      
        }
        else
        {
          data.startDate && data.endDate
            ? (extCond += `and Date(ed.start_time) between '${data.startDate}' and '${data.endDate}' `)
            :''
        }
 
        data.entry_team ?
        (extCond += `and ed.entry_team = ${data.entry_team}`)
        :''
          
        if(data.page && data.limit)
        {  
          q =  `select z.employee_name
                      ,z.employee_id
                      ,z.total_entries
                      ,z.total_vin_number
                      ,z.login_time                                                							                             report_date
                      ,TO_CHAR(z.average_time_taken_2,'HH24:MI:SS')                                                          average_handle_time
                      ,TO_CHAR(z.actual_handle_time,'HH24:MI:SS')                                                            actual_handle_time
                      ,TO_CHAR(z.break_hours,'HH24:MI:SS')                                        			                     break_hours
                      ,TO_CHAR(z.total_login_hours,'HH24:MI:SS')                                                             total_login_hours
                      ,TO_CHAR(z.total_login_hours - (z.average_time_taken_2 + coalesce(z.break_hours,'0') ),'HH24:MI:SS')   idle_time
                  from (select x.user_id
                      ,x.employee_name
                      ,x.employee_id
                      ,MIN(x.login_time)    login_time
                      ,MAX(x.logout_time)   logout_time
                      ,case 
                        when x.logout_time is not null  and ( (MAX(x.logout_time) - MIN(x.login_time)) > INTERVAL '8 hours' or DATE(MIN(x.login_time)) <> CURRENT_DATE )
                        then (MAX(x.logout_time) - MIN(x.login_time))
                        else (TO_TIMESTAMP('${curr_time}', 'YYYY-MM-DD HH24:MI:SS.MS') - MIN(x.login_time))
                      end as total_login_hours
                      // ,(MAX(x.logout_time) - MIN(x.login_time))            total_login_hours
                      ,count(x.entry_id)                                   total_entries
                      ,sum(x.entry_vin_count)                                total_vin_number
                      ,sum(x.time_taken)                                 average_time_taken_2
                      ,sum(x.time_taken) / count(x.entry_id)              actual_handle_time
                      ,(select sum(date_trunc('minute', ubh.end_time - ubh.start_time ))
                          from verifacto.user_break_history ubh
                        where ubh.user_id = x.user_id
                          and date(ubh.start_time) = date(MIN(x.login_time))
                        )  as break_hours
                  from (select y.* 
                ,(select MIN(ul.LOGIN_TIME)
                    from verifacto.user_logins ul
                  where ul.user_id = y.user_id 
                    and date(ul.login_time) = date(y.start_time)
                ) LOGIN_TIME
                ,(select MAX(ul.LOGOUT_TIME)
                    from verifacto.user_logins ul
                  where ul.user_id = y.user_id 
                    and date(ul.login_time) = date(y.start_time)
                ) LOGOUT_TIME
                      from (select u.employee_id
                                  ,concat(u.firstname,' ',u.lastname) as employee_name
                                  ,ed.entry_id
                                  ,ed.user_id 
                                  ,COUNT(ed.vin_number)  entry_vin_count
                                  ,MIN(ed.start_time) start_time
                                  ,MAX(ed.end_time)   end_time
                                  ,(MAX(ed.end_time)-MIN(ed.start_time))        as time_taken
                             from verifacto.entry_details ed
                                 ,verifacto.users u
                            where u.user_id = ed.user_id
                                ${extCond} 
                         group by u.user_id
                                 ,ed.entry_id
                                 ,ed.user_id 
                            )  y
                        ) x
                group by date_trunc('day',x.LOGIN_TIME) 
                        ,x.employee_name
                        ,x.user_id
                        ,x.login_time
                        ,x.logout_time
                        ,x.employee_id
                        ) z
                order by z.login_time desc
                LIMIT ${endIndex} OFFSET ${startIndex}`
        }
        else
        {
          q =  `select z.employee_name
                      ,z.employee_id
                      ,z.total_entries
                      ,z.total_vin_number
                      ,z.login_time                                             							                              report_date
                      ,TO_CHAR(z.average_time_taken_2,'HH24:MI:SS')                                                           average_handle_time
                      ,TO_CHAR(z.actual_handle_time,'HH24:MI:SS')                                                             actual_handle_time
                      ,TO_CHAR(z.break_hours,'HH24:MI:SS')                                        			                      break_hours
                      ,TO_CHAR(z.total_login_hours,'HH24:MI:SS')                                                              total_login_hours
                      ,TO_CHAR(z.total_login_hours - (z.average_time_taken_2 + coalesce(z.break_hours,'0') ),'HH24:MI:SS')    idle_time
                      ,TO_CHAR(
                        (z.total_login_hours - (z.average_time_taken_2 + COALESCE(z.break_hours, '00:00:00')::interval)) / z.total_entries,
                        'HH24:MI:SS'
                         )  as average_idle_time
                  from (select x.user_id
                      ,x.employee_name
                      ,x.employee_id
                      ,MIN(x.login_time)    login_time
                      ,MAX(x.logout_time)   logout_time
                      ,case 
                        when x.logout_time is not null  and ( (MAX(x.logout_time) - MIN(x.login_time)) > INTERVAL '8 hours' or DATE(MIN(x.login_time)) <> CURRENT_DATE )
                        then (MAX(x.logout_time) - MIN(x.login_time))
                        else (TO_TIMESTAMP('${curr_time}', 'YYYY-MM-DD HH24:MI:SS.MS') - MIN(x.login_time))
                       end as total_login_hours
                      ,count(x.entry_id)                                   total_entries
                      ,sum(x.entry_vin_count)                              total_vin_number
                      ,sum(x.time_taken)                                   average_time_taken_2
                      ,sum(x.time_taken) / count(x.entry_id)               actual_handle_time
                      ,(select sum(date_trunc('minute', ubh.end_time - ubh.start_time ))
                          from verifacto.user_break_history ubh
                        where ubh.user_id = x.user_id
                          and date(ubh.start_time) = date(MIN(x.login_time))
                        )  as break_hours
                  from (select y.* 
                ,(select MIN(ul.LOGIN_TIME)
                    from verifacto.user_logins ul
                  where ul.user_id = y.user_id 
                    and date(ul.login_time) = date(y.start_time)
                ) LOGIN_TIME
                ,(select MAX(ul.LOGOUT_TIME)
                    from verifacto.user_logins ul
                  where ul.user_id = y.user_id 
                    and date(ul.login_time) = date(y.start_time)
                ) LOGOUT_TIME
                      from (select u.employee_id
                                  ,concat(u.firstname,' ',u.lastname) as employee_name
                                  ,ed.entry_id
                                  ,ed.user_id 
                                  ,COUNT(ed.vin_number)  entry_vin_count
                                  ,MIN(ed.start_time) start_time
                                  ,MAX(ed.end_time)   end_time
                                  ,(MAX(ed.end_time)-MIN(ed.start_time))        as time_taken
                            from verifacto.entry_details ed
                                ,verifacto.users u
                            where u.user_id = ed.user_id
                                ${extCond} 
                        group by u.user_id
                                ,ed.entry_id
                                ,ed.user_id 
                            )  y
                        ) x
                group by date_trunc('day',x.LOGIN_TIME) 
                        ,x.employee_name
                        ,x.user_id
                        ,x.employee_id
                        ,x.login_time
                        ,x.logout_time
                        ) z
                order by z.login_time desc`
        }

        console.log(q)
        pool.query(q,
                   function(error,result)
                   {
                     if(error)
                     {
                      return callback(error)
                     }
                     else
                     {
                      return callback(null,result.rows)
                     }
                   })
    },
    getAgentWiseReportCounts:(data,callback)=>
    {
         let extCond = ``;
         data.today ? (extCond += `and DATE_TRUNC('day', ed.start_time) = CURRENT_DATE `) : ""

        data.entry_team ?
         (extCond += `and ed.entry_team = ${data.entry_team}`)
        :''
  
        if(data.startTime && data.endTime)
        {
          data.startDate && data.endDate
            ? (extCond += `and ed.start_time >= '${data.startDate +' '+data.startTime}' 
                          and ed.end_time <  '${data.endDate +' '+ data.endTime}' `)
            :''      
        }
        else
        {
          data.startDate && data.endDate
            ? (extCond += `and Date(ed.start_time) between '${data.startDate}' and '${data.endDate}' `)
            :''
        }

           q =  `select z.employee_name
                      ,z.total_entries
                      ,z.total_vin_number
                      ,z.login_time                                                							               report_date
                      ,TO_CHAR(z.average_time_taken_2,'HH24:MI:SS')                                            average_handle_time
                      ,TO_CHAR(z.break_hours,'HH24:MI:SS')                                        			       break_hours
                      ,TO_CHAR(z.total_login_hours,'HH24:MI:SS')                                               total_login_hours
                      ,TO_CHAR(z.total_login_hours - (z.average_time_taken_2 +z.break_hours ),'HH24:MI:SS')    idle_time
                  from (select x.user_id
                      ,x.employee_name
                      ,MIN(x.login_time)    login_time
                      ,MAX(x.logout_time)   logout_time
                      ,(MAX(x.logout_time) - MIN(x.login_time))            total_login_hours
                      ,count(x.entry_id)                                   total_entries
                      ,sum(x.entry_vin_count)                                total_vin_number
                      ,sum(x.time_taken) / count(x.entry_id)                 average_time_taken_2
                      ,(select sum(date_trunc('minute', ubh.end_time - ubh.start_time ))
                          from verifacto.user_break_history ubh
                        where ubh.user_id = x.user_id
                          and date(ubh.start_time) = date(MIN(x.login_time))
                        )  as break_hours
                  from (select y.* 
                ,(select MIN(ul.LOGIN_TIME)
                    from verifacto.user_logins ul
                  where ul.user_id = y.user_id 
                    and date(ul.login_time) = date(y.start_time)
                ) LOGIN_TIME
                ,(select MAX(coalesce(ul.LOGOUT_TIME, now()))
                    from verifacto.user_logins ul
                  where ul.user_id = y.user_id 
                    and date(ul.login_time) = date(y.start_time)
                ) LOGOUT_TIME
                      from (select u.employee_id
                                  ,concat(u.firstname,u.middlename,u.lastname) as employee_name
                                  ,ed.entry_id
                                  ,ed.user_id 
                                  ,COUNT(ed.vin_number)  entry_vin_count
                                  ,MIN(ed.start_time) start_time
                                  ,MAX(ed.end_time)   end_time
                                  ,(MAX(ed.end_time)-MIN(ed.start_time))        as time_taken
                            from verifacto.entry_details ed
                                ,verifacto.users u
                            where u.user_id = ed.user_id 
                                ${extCond} 
                        group by u.user_id
                                ,ed.entry_id
                                ,ed.user_id 
                            )  y
                        ) x
                group by date_trunc('day',x.LOGIN_TIME) 
                        ,x.employee_name
                        ,x.user_id
                        ,x.login_time
                        ,x.logout_time
                        ) z
                order by z.login_time desc`

         

          pool.query(q,
                    function(error,result)
                    {
                      if(error)
                      {
                        return callback(error)
                      }
                      else
                      {
                        return callback(null,result.rowCount)
                      }
                    })
    },
    getDocandVinCounts:(data,callback)=>
    {
        let extCond = `where true `;
          data.today ? (extCond += `and DATE_TRUNC('day', ed.start_time) = CURRENT_DATE `) : ""

        data.entry_team ?
          (extCond += `and ed.entry_team = ${data.entry_team}`)
        :''

        if(data.startTime && data.endTime)
        {
          data.startDate && data.endDate
            ? (extCond += ` and ed.start_time >= '${data.startDate +' '+data.startTime}' 
                          and ed.end_time <  '${data.endDate +' '+ data.endTime}' `)
            :''      
        }
        else
        {
          data.startDate && data.endDate
            ? (extCond += ` and Date(ed.start_time) between '${data.startDate}' and '${data.endDate}' `)
            :''
        }

        cq= `select count (distinct  ed.entry_id ) as total_doc_count
                   ,count(ed.vin_number) as total_vin_count
               from verifacto.entry_details ed
               ${extCond} `
        
        pool.query(cq,
                   function(error,result)
                   {
                    if(error)
                    {
                      return callback(error)
                    }
                    return callback(null, result.rows[0])
                   })
    }
}  