const 
{
    addBreaks,updateBreaks,getAllBreaks,getByIds,deleteByIds,
    chooseBreaks,endBreaks,breakStatusLists,unlockBreaks,unlockedBreakLists,unlockedBreakCounts,checkAgentBreakStatuss,
    breakReportLists,dateWiseReportLists,breakReportListcounts,todayRemainingBreakTimes
} = require('./breaks.service');
const {pool} = require('../config/database');
const ExcelJS = require('exceljs');


module.exports=
{
    addBreak:(req,res)=>
    {
        addBreaks(req.body,req.authData,(err,data)=>{
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
                    message:data
                })
            }
        })
    },
    updateBreak:(req,res)=>
    {
        updateBreaks(req.body,req.authData,(err,data)=>{
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
                    message:data
                })
            }
        })
    },
    getAllBreak:(req,res)=>
    {
        getAllBreaks(req.body,(err,data,count)=>{
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
    getById:(req,res)=>
    {
        getByIds(req.params,(err,data)=>{
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
                    data:data
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
                    message:data
                })
            }
        })
    },
    chooseBreak:(req,res)=>
    {
        chooseBreaks(req.body,req.authData,(err,data)=>{
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
                    data:data
                })
            }
        })
    },
    endBreak:(req,res)=>
    {
        endBreaks(req.body,req.authData,(err,data)=>{
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
                    message:data
                })
            }
        })
    },
    breakStatusList:(req,res)=>
    {
        breakStatusLists(req.body,(err,data)=>{
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
                    data:data
                })
            }
        })
    },
    unlockBreak:(req,res)=>
    {
        unlockBreaks(req.body,req.authData,(err,data)=>{
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
                    message:data
                })
            }
        })
    },
    unlockedBreakList:(req,res)=>
    {
        unlockedBreakLists(req.body,req.authData,(err,data)=>
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
                    data:data
                })
            }
        })
    },
    unlockedBreakCount:(req,res)=>
    {
        unlockedBreakCounts(req.body,req.authData,(err,data)=>
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
                    total:data
                })
            }
        })
    },
    checkAgentBreakStatuslogin:async(req,res,next)=>
    {
        q = `Select u.user_id
        FROM verifacto.users u
       WHERE u.employee_id = '${req.body.employee_id}'`
       var resd =''

        let stat = await pool.query(`Select u.user_id
                                        FROM verifacto.users u
                                    WHERE u.employee_id = '${req.body.employee_id}'`)
     
        var resd = {"id": stat.rows[0]?.user_id}
       if(!stat.rows[0]?.user_id)
        return res.status(500).json({
                    failed:1,
                    error: 'employee id is wrong'
                })

        checkAgentBreakStatuss(resd,(err,data)=>
            {
                if(err)
                {
                    return res.status(500).json({
                        failed:1,
                        error: err
                    })
                }
                console.log('resss',data);
                req.break = data
                next();
            })
    },
    checkAgentBreakStatus:async(req,res)=>
    {      checkAgentBreakStatuss(req.authData,(err,data)=>
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
                    if(data.status === 2)
                    {
                        return res.status(200).json({
                            success:1,
                            data:data
                        })
                    }
                    else
                    {
                        return res.status(200).json({
                            success:1,
                            data:data
                        })
                    }
                   
                }
            })
        
       
    },
    breakReportList:async(req,res)=>
    {      
        breakReportLists(req.body,(err,data)=>
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
                        data:data
                    })
                }
                   
            })
        
       
    },
    dateWiseReportList:async(req,res)=>
    {      
        dateWiseReportLists(req.body,(err,data)=>
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
                        data:data
                    })
                }
                   
            })
    },
    breakReportListcount:async(req,res)=>
    {      
        breakReportListcounts(req.body,(err,data)=>
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
                        total:data
                    })
                }
                   
            })
        
       
    },
    todayRemainingBreakTime:async(req,res)=>
    { 
        todayRemainingBreakTimes(req.authData,(err,data)=>
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
                    time:data
                })
            }
               
        })
    },
    exportBreakReport:async(req,res)=>
    {   
            try
            {
            var data = req.body
            
            var extCond = ``;

            data.today ? (extCond += `and DATE_TRUNC('day', ubh.start_time) = CURRENT_DATE `): '' 
            
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
                     where b.break_id  = ubh.break_id 
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
    }

}