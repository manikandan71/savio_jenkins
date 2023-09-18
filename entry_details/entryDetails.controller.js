const {
    addEntrys,updateEntrys,getAllEntrys,getEntryByIds,deleteByIds,todayEntryDatas,todayEntryCounts,
    getAllEntryByAgentandAdmins,getOverAllMyCounts,getEntriesTotals,todayDailyCounts,getAgentWiseReports,
    getAgentWiseReportCounts,getDocandVinCounts
} = require('./entryDetails.service');
const ExcelJS = require('exceljs');
const {pool} = require('../config/database');


module.exports={
    addEntry:(req,res)=>
    {
        addEntrys(req.body,req.authData,(err,data)=>{
            if(err)
            {
                return res.status(500).json({
                    failed:1,
                    error: err
                })
            }
            else
            {
                return res.status(200).json({
                    success:1,
                    message:data,
                })
            }
        })
    },
    updateEntry:(req,res)=>
    {
        updateEntrys(req.body,req.authData,(err,data)=>{
            if(err)
            {
                return res.status(500).json({
                    failed:1,
                    error: err
                })
            }
            else
            {
                return res.status(200).json({
                    success:1,
                    message:'entry updated successfully'
                })
            }
        })
    },
    getAllEntry:(req,res)=>
    {
        getAllEntrys(req.body,(err,data,count)=>{
            if(err)
            {
                return res.status(500).json({
                    failed:1,
                    error: err
                })
            }
            else
            {
                return res.status(200).json({
                    success:1,
                    data: data,
                    total:count
                })
            }
        })
    },
    getEntryById:(req,res)=>
    {
        getEntryByIds(req.params,(err,data)=>{
            if(err)
            {
                return res.status(500).json({
                    failed:1,
                    error: err
                })
            }
            else
            {
                return res.status(200).json({
                    success:1,
                    data: data
                })
            }
        })
    },
    deleteById:(req,res)=>
    {
        deleteByIds(req.params,(err,data)=>{
            if(err)
            {
                return res.status(500).json({
                    failed:1,
                    error: err
                })
            }
            else
            {
                return res.status(200).json({
                    success:1,
                    message:'entry deleted successfully'
                })
            }
        })
    },
    todayEntryData:(req,res)=>
    {
        todayEntryDatas(req.body,req.authData,(err,data,count)=>{
            if(err)
            {
                return res.status(500).json({
                    failed:1,
                    error: err
                })
            }
            else
            {
                return res.status(200).json({
                    success:1,
                    data: data,
                    total:count
                })
            }
        })
    },
    todayEntryCount:(req,res)=>
    {
        todayEntryCounts(req.params,req.authData,(err,data)=>{
            if(err)
            {
                return res.status(500).json({
                    failed:1,
                    error: err
                })
            }
            else
            {
                return res.status(200).json({
                    success:1,
                    total:data
                })
            }
        })
    },
    todayDailyCount:(req,res)=>
    {
        todayDailyCounts(req.params,req.authData,(err,data)=>{
            if(err)
            {
                return res.status(500).json({
                    failed:1,
                    error: err
                })
            }
            else
            {
                return res.status(200).json({
                    success:1,
                    total:data
                })
            }
        })
    },
    getAllEntryByAgentandAdmin:(req,res)=>
    {
        getAllEntryByAgentandAdmins(req.body,req.authData,(err,data,count)=>{
            if(err)
            {
                return res.status(500).json({
                    failed:1,
                    error: err
                })
            }
            else
            {
                return res.status(200).json({
                    success:1,
                    data:data,
                    total:count
                })
            }
        })
    },
    getOverAllMyCount:(req,res)=>
    {
        getOverAllMyCounts(req.body,req.authData,(err,count)=>{
            if(err)
            {
                return res.status(500).json({
                    failed:1,
                    error: err
                })
            }
            else
            {
                return res.status(200).json({
                    success:1,
                    total:count
                })
            }
        })
    },
    getEntriesTotal:(req,res)=>
    {
        getEntriesTotals(req.body,req.authData,(err,count)=>{
            if(err)
            {
                return res.status(500).json({
                    failed:1,
                    error: err
                })
            }
            else
            {
                return res.status(200).json({
                    success:1,
                    total:count
                })
            }
        })
    },
    exportEntries:async(req,res)=>
    {  
        try
        {
          var data = req.body
         let extCond = `where true `;

         data.startDate && data.endDate
              ? (extCond += `and ed.entry_date between '${data.startDate}' and '${data.endDate}' `)
              :''
        data.leinholder_id
            ? (extCond += `and l.leinholder_id = ${data.leinholder_id}`)
            :''
        
        data.insurance_company_name
            ? (extCond += `and ic.insurance_company_name = ${data.insurance_company_name}`)
            :''

        data?.customer_first_name &&  data?.customer_last_name
            ? (extCond += `and ed.customer_first_name like '%${data.customer_first_name}%'
                            and ed.customer_last_name like '%${data.customer_last_name}%' `)
            : 
        data?.customer_first_name 
            ? (extCond += `and ed.customer_first_name like '%${data.customer_first_name}%'`)
            :
        data?.customer_last_name 
            ? (extCond += `and ed.customer_last_name like '%${data.customer_last_name}%'`)
            : 
            ''
            
        const q= `select ed.id, ed.entry_id, ed.document_id,ed.terminal_name, ed.vin_number,ed.customer_first_name, ed.customer_last_name
                ,ic.insurance_company_name as insurance_name, l.leinholder_name,ed.description, ed.entry_date
                ,ed.average_time_taken
                from  verifacto.entry_details ed
                join verifacto.lienholders l
                on ed.leinholder_id = l.leinholder_id
                join verifacto.insurance_companies ic
                on ed.insurance_id = ic.insurance_id
                ${extCond}
                group by ed.id , ic.insurance_id , l.leinholder_id`

      

        var result = await pool.query(q) 
     
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet 1');
      
        const columns = Object.keys(result.rows[0]);
        worksheet.columns = columns.map((column) => ({
          header: column,
          key: column,
          width: 15, 
        }));
    
        // Add data rows
        result.rows.forEach((row) => {
          const rowData = columns.map((column) => row[column]);
          worksheet.addRow(rowData);
        });

      
        // Set the response headers for the Excel file
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="entry_details.xlsx"');
      
        // Send the workbook as a response
        workbook.xlsx.write(res).then(() => {
          res.end();
        });

        }
        catch(err)
        {
        res.status(500).send('Internal Server Error');
        }
    },
    getAgentWiseReport:async(req,res)=>
    {
        getAgentWiseReports(req.body,(err,data)=>
        {
            if(err)
            {
                return res.status(500).json({
                    failed:1,
                    error: err
                })
            }
            else
            {
                return res.status(200).json({
                    success:1,
                    data: data
                })
            }
        })
    },
    getAgentWiseReportCount:async(req,res)=>
    {
        getAgentWiseReportCounts(req.body,(err,data)=>
        {
            if(err)
            {
                return res.status(500).json({
                    failed:1,
                    error: err
                })
            }
            else
            {
                return res.status(200).json({
                    success:1,
                    total: data
                })
            }
        })
    },
    getDocandVinCount:(req,res)=>
    {
         getDocandVinCounts(req.body,(err,data)=>
         {
             if(err)
             {
                 return res.status(500).json({
                     failed:1,
                     error: err
                 })
             }
             else
             {
                 return res.status(200).json({
                     success:1,
                     total: data
                 })
             }
         })

    },
    exportAgentWiseReport:async(req,res)=>
    {
            try
            {
            var data = req.body
            
            let extCond = ``;
            data.today ? (extCond += `and DATE_TRUNC('day', ed.start_time) = CURRENT_DATE `) : ""
      
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
            const q =  `select z.employee_name
                              ,z.total_entries
                              ,z.total_vin_number
                              ,z.login_time                                                					   report_date
                              ,TO_CHAR(z.average_time_taken_2,'HH24:MI:SS')                                    average_handle_time
                              ,TO_CHAR(z.break_hours,'HH24:MI:SS')                                        	   break_hours
                              ,TO_CHAR(z.total_login_hours,'HH24:MI:SS')                                       total_login_hours
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

        

            var result = await pool.query(q) 
        
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sheet 1');
        
            const columns = Object.keys(result.rows[0]);
            worksheet.columns = columns.map((column) => ({
            header: column,
            key: column,
            width: 15, 
            }));
        
            // Add data rows
            result.rows.forEach((row) => {
            const rowData = columns.map((column) => row[column]);
            worksheet.addRow(rowData);
            });

        
            // Set the response headers for the Excel file
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="agent_wise_report.xlsx"');
        
            // Send the workbook as a response
            workbook.xlsx.write(res).then(() => {
            res.end();
            });

            }
            catch(err)
            {
            res.status(500).send('Internal Server Error');
            }
    },
    exportConsolidateReport:async(req,res)=>
    {
            try
            {
            var data = req.body
            
            let extCond = `where true `;

            if(data.startTime && data.endTime)
            {
              data.startDate && data.endDate && data.startTime && data.endTime
               ? (extCond += `and ed.start_time >='${data.startDate +' '+ data.startTime}' 
                              and ed.end_time <='${data.endDate +' '+ data.endTime }'`)
               :''
            }
            else
            {
              data.startDate && data.endDate
              ? (extCond += `and date(ed.start_time) between '${data.startDate}' and '${data.endDate}' `)
              :''
            }
            data.today ?
            (extCond += `and ed.entry_date::date = CURRENT_DATE`)
            :''

           q=`select ed.id, ed.entry_id, ed.document_id,dt.document_name,ed.terminal_name, ed.vin_number,ed.customer_first_name, ed.customer_last_name
                    ,ic.insurance_company_name as insurance_name, l.leinholder_name,ed.description, ed.entry_date
                    ,l.leinholder_id, ic.insurance_id 
                    ,ed.average_time_taken
                    from  verifacto.entry_details ed
                    join verifacto.lienholders l
                    on ed.leinholder_id = l.leinholder_id
                    join verifacto.insurance_companies ic
                    on ed.insurance_id = ic.insurance_id
                    join verifacto.document_types dt 
                    on dt.document_id  = ed.document_id
                    ${extCond}
                    group by ed.id , ic.insurance_id , l.leinholder_id,dt.document_id
                    order by ed.id desc`

        

            var result = await pool.query(q) 
        
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sheet 1');
        
            const columns = Object.keys(result.rows[0]);
            worksheet.columns = columns.map((column) => ({
            header: column,
            key: column,
            width: 15, 
            }));
        
            // Add data rows
            result.rows.forEach((row) => {
            const rowData = columns.map((column) => row[column]);
            worksheet.addRow(rowData);
            });

        
            // Set the response headers for the Excel file
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="consolidate_report.xlsx"');
        
            // Send the workbook as a response
            workbook.xlsx.write(res).then(() => {
            res.end();
            });

            }
            catch(err)
            {
            res.status(500).send('Internal Server Error');
            }
    }

}