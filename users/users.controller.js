const 
{
 addUsers,updateUsers,getAlls,getByIds,deleteByIds,exportys,updatePasswords
} = require('./users.service');
const ExcelJS = require('exceljs');
const {pool} = require('../config/database');

module.exports={
    addUser:(req,res)=>
    {
        addUsers(req.body,req.authData,(err,data)=>{
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
                    message:'agent created successfully'
                })
            }
        })
    },
    updateUser:(req,res)=>
    {
        updateUsers(req.body,req.params,req.authData,(err,data)=>{
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
                    message:'agent updated successfully'
                })
            }
        }) 
    },
    getAll:(req,res)=>
    {
        getAlls(req.body,(err,data,count)=>{
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
    getById:(req,res)=>
    {
        getByIds(req.params,(err,data)=>
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
    deleteById:(req,res)=>
    {
        deleteByIds(req.params,(err,data)=>
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
                    message:'agent deleted successfully'
                })
            }
        }) 
    },
    updatePassword:(req,res)=>
    {
        updatePasswords(req.body,req.params,req.authData,(err,data)=>{
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
    exporty:async(req,res)=>
    {  
        try
        {
            
        const q= `select u.user_id as id ,concat(u.firstname,' ', u.middlename, ' ', u.lastname) as name,u.email_id_1 as email
                ,u.date_of_joining , u.employee_id , u.phone_number_1 as phone_number
                ,t.team_name 
                ,r.role_name  as role
                ,u.gender
                ,u.desgination
                from verifacto.users u 
                join verifacto.assign_teams at2 
                on u.user_id  = at2.user_id 
                join verifacto.teams t 
                on at2.team_id = t.team_id 
                join verifacto.user_roles ur
                on  ur.user_id = u.user_id
                join verifacto.roles r
                on ur.role_id = r.role_id
                group by u.user_id, ur.user_role_id, r.role_name,t.team_id
                ORDER BY u.user_id  `
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
        res.setHeader('Content-Disposition', 'attachment; filename="employee_details.xlsx"');
      
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
}