const {logins,logouts,loginReportCounts,loginReports,forceLogouts,checkTerminalAccess} = require('./auth.service');
const ExcelJS = require('exceljs');
const {pool} = require('../config/database');


module.exports = {
    login:(req,res)=>
    {
        logins(req.break,req.body,(err,result)=>{
            if(err)
            {
                return res.status(500).json({
                    failed:1,
                    error: err
                })
            }
            if(result)
            {
                return res.status(200).json({
                    // success:1,
                    data:result
                })
            }
        })
    },
    logout:(req,res)=>
    {
        logouts(req.params,req.authData,(err,result)=>{
            if(err)
            {
                return res.status(500).json({
                    failed:1,
                    error: err
                })
            }
            if(result)
            {
                return res.status(200).json({
                    message:result
                })
            }
        })
    },
    loginReport:(req,res)=>
    {
        loginReports(req.body,(err,result)=>{
            if(err)
            {
                return res.status(500).json({
                    failed:1,
                    error: err
                })
            }
            if(result)
            {
                return res.status(200).json({
                    data:result
                })
            }
        })
    },
    loginReportCount:(req,res)=>
    {
        loginReportCounts(req.body,(err,result)=>{
            if(err)
            {
                return res.status(500).json({
                    failed:1,
                    error: err
                })
            }
            if(result)
            {
                return res.status(200).json({
                    total:result
                })
            }
        })
    },
    forceLogout:(req,res)=>
    {
        forceLogouts(req.params,req.authData,(err,result)=>{
            if(err)
            {
                return res.status(500).json({
                    failed:1,
                    error: err
                })
            }
            if(result)
            {
                return res.status(200).json({
                    success:1,
                    data:result
                })
            }
        })
    },
    exportLoginReport:async(req,res)=>
    {   
            try
            {
            var data = req.body
            
            var extCond = ``;

            data.today ? (extCond += `and DATE_TRUNC('day', login_time) = CURRENT_DATE `): '' 

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
                ? (extCond += `and date(ul.login_time) >= '${data.startDate}' 
                            and date(ul.logout_time) < '${data.endDate}' `)
                :''
            }

         q =`select y.employee_id
                   ,y.name
                   ,min(y.login_time ) as login_time
                   ,max(y.logout_time) as logout_time
                   ,TO_CHAR(sum(work_time),'HH24:MI:SS') as login_hours
               from (select u.employee_id
                           ,concat(u.firstname,' ', u.middlename,' ',u.lastname) as name
                           ,date_trunc('day',ul.login_time) as report_date 
                           ,ul.login_time as login_time 
                           ,ul.logout_time as logout_time 
                           ,sum(ul.logout_time - ul.login_time ) as work_time
                       from verifacto.user_logins ul 
                       join verifacto.users u 
                         on u.user_id = ul.user_id 
                      where u.user_id = ul.user_id
                            ${extCond}   
                   group by u.user_id
                            ,ul.login_time
                            ,report_date 
                            ,ul.logout_time) as y
                    group by y.employee_id
                            ,y.name
                            ,y.report_date 
                    order by report_date desc`

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
            res.setHeader('Content-Disposition', 'attachment; filename="login_report.xlsx"');
        
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
    checkTerminalAccex:async(req,res)=>
    {
        checkTerminalAccess(req.authData,(err,result)=>{
            if(err)
            {
                return res.status(500).json({
                    failed:1,
                    error: err
                })
            }
            if(result)
            {
                return res.status(200).json({
                    success:1,
                    data:result
                })
            }
        })
    }
}