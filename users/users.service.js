const {pool} = require('../config/database');
const {hashGenerate} = require('../middleware/hashing');
const {handleMail} = require('../middleware/sendMail')


module.exports={
    addUsers:async(data,tok,callback)=>
    {   
        try
        {
          const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&';
          let password = '';
        
          for (let i = 0; i < 10; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
          }
          //  console.log('check the password',password );
          var sent = { 'subject':'your verifacto UserId and Password',
                        'email' : data.email_id_1,
                        'user_id' : data.employee_id,
                        'password' : password
                     }
           data.password = await hashGenerate(password);
          // data.password = await hashGenerate(data.password);

           const res= await  pool.query(`INSERT INTO verifacto.users
                (firstname, middlename, lastname, email_id_1, "password", 
                date_of_joining, employee_id, phone_number_1, email_id_2, 
                profile_pic, phone_number_2, address, city, state, country, created_at, updated_at, created_by, updated_by, active_flag,gender,desgination)
                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, now(), now(), $16, $17, 'y',$18,$19)
                RETURNING user_id
                `,[data.firstname, data.middlename, data.lastname, data.email_id_1,data.password,
                   data.date_of_joining, data.employee_id, data.phone_number_1, data.email_id_2,
                   data.profile_pic, data.phone_number_2, data.address, data.city, data.state, data.country,tok.id, 
                   tok.id, data.gender,data.designation
                  ]
                )
              await pool.query(`INSERT INTO verifacto.user_roles
                                (user_id, role_id, created_at, updated_at, created_by, updated_by)
                                VALUES($1, $2, now(), now(), $3, $4)`,
                                [res.rows[0].user_id,data.role,tok.id,tok.id]);

              await pool.query(`INSERT INTO verifacto.assign_teams
                                (user_id, team_id, created_at, updated_at, created_by, updated_by)
                                VALUES($1, $2, now(), now(), $3, $4)`,
                                [res.rows[0].user_id,data.team,tok.id,tok.id]
                                )   
            console.log('check the response', res.rows[0].user_id)  
           if(res.rows[0].user_id)
           {
            await handleMail(sent);
           }       
           return callback(null, res);
        }
        catch(err)
        {
            return callback(err.detail)
        }
    },
    updateUsers:async(data,params,tok,callback)=>
    {
        try
        {  

           const update_role  = await pool.query(`UPDATE verifacto.user_roles
                                                     SET role_id = $1
                                                   where user_id=$2`,[data.role_id,params.id])
          
          const update_teams  = await pool.query(`UPDATE verifacto.assign_teams
                                                     SET team_id = $1
                                                   where user_id=$2`,[data.team_id,params.id])                                        
        
           delete  data.team_id;
           delete data.role_id;


            var columns = Object.keys(data);
            var values = Object.values(data);
            console.log('check ', columns , values )
            const setClause = columns.map((column, index) => `${column} = $${index + 1}`).join(', ');
            const query = {
                 text: `UPDATE verifacto.users SET ${setClause},updated_by= $${columns.length + 1} ,updated_at=now()  WHERE user_id = $${columns.length + 2}`,
                 values: [...values,tok.id, params.id],
                  };
            const res = await pool.query(query)
            return callback(null, res);
        }
        catch(err)
        {
            return callback(err.detail)
        }
    },
    getAlls:(data,callback)=> 
    {
        const page  = parseInt(data.page);
        const limit = parseInt(data.limit);
        
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        let extCond = " ";
        
        // if (data.search != "" && data.search != undefined) {
        //     extCond += `and u.firstname ILIKE  '%${data.search}%' 
        //      OR u.employee_id ILIKE '%${data.search}%'  
        //      OR u.email_id_1 ILIKE '%${data.search}%' 
        //      OR ur.role_name ILIKE '%${data.search}'
        //      `;
        //   }

        data.firstname 
          ? (extCond += ` and u.firstname = '${data.firstname}'`)  
          :""
        data.email 
          ? (extCond += `and u.email_id_1 = '${data.email}' or u.email_id_2 = '${data.email}'`)
          : '';
        data.employeeId
          ? (extCond += `and u.employee_id = ${data.employeeId}`)
          :'';
        data.status
          ? (extCond += `and u.active_flag = '${data.status}'`)
          :''
        data.role
          ? (extCond += `and ur.role_name ='${data.role}' `)
          :''
        data.startDate && data.endDate
          ? (extCond += `and u.date_of_joining between '${data.startDate}' and '${data.endDate}' `)
          :''

         if(data.page && data.limit)
         {
            q= `select u.user_id 
                      ,u.firstname 
                      ,u.middlename
                      ,u.lastname
                      ,u.email_id_1 
                      ,u.date_of_joining 
                      ,u.employee_id 
                      ,u.phone_number_1
                      ,u.email_id_2 
                      ,u.profile_pic
                      ,u.phone_number_2 
                      ,u.address 
                      ,u.city 
                      ,u.state 
                      ,u.gender
                      ,u.desgination
                      ,u.country 
                      ,t.team_name
                      ,r.role_name
                  from verifacto.users u
                  LEFT join verifacto.assign_teams at2
                    on u.user_id = at2.user_id
                  LEFT join verifacto.teams t
                    on at2.team_id = t.team_id
                  LEFT JOIN verifacto.user_roles ur
                    ON u.user_id  = ur.user_id
                  LEFT join verifacto.roles r
                    on ur.role_id = r.role_id
                  where u.active_flag != 'n'
                      ${extCond}
                ORDER BY u.user_id desc
                      LIMIT ${endIndex} OFFSET ${startIndex}`
         }  
         else
         {
             q=`select u.user_id 
                      ,u.firstname 
                      ,u.middlename
                      ,u.lastname
                      ,u.email_id_1 
                      ,u.date_of_joining 
                      ,u.employee_id 
                      ,u.phone_number_1
                      ,u.email_id_2 
                      ,u.profile_pic
                      ,u.phone_number_2 
                      ,u.address 
                      ,u.city 
                      ,u.state 
                      ,u.gender
                      ,u.desgination
                      ,u.country 
                      ,t.team_name
                      ,r.role_name
                  from verifacto.users u
                  LEFT join verifacto.assign_teams at2
                    on u.user_id = at2.user_id
                  LEFT join verifacto.teams t
                    on at2.team_id = t.team_id
                  LEFT JOIN verifacto.user_roles ur
                    ON u.user_id  = ur.user_id
                  LEFT join verifacto.roles r
                    on ur.role_id = r.role_id
                 where u.active_flag != 'n'
                       ${extCond}
                ORDER BY u.user_id desc`
         }
  
          pool.query(q, 
             function(error,result)
             {
              if(error)
              {
                return callback(error)
              }
              else
              {
                return callback(null, result.rows, result.rowCount)
              }
             })
          // var res = await pool.query(q) 
          // return callback(null, res.rows, res.rowCount);
  // =========================================================
      
    },
    getByIds: async(data,callback)=>
    {
      console.log('check the data',data);
        try
        {
          q = ``
          var res = await pool.query(`select u.user_id 
                                            ,u.firstname
                                            ,u.middlename
                                            ,u.lastname
                                            ,u.email_id_1 
                                            ,u.date_of_joining 
                                            ,u.employee_id 
                                            ,u.phone_number_1
                                            ,u.email_id_2 
                                            ,u.profile_pic
                                            ,u.phone_number_2 
                                            ,u.address 
                                            ,u.city 
                                            ,u.state 
                                            ,u.gender
                                            ,u.desgination
                                            ,u.country 
                                            ,t.team_name
                                            ,t.team_id
                                            ,r.role_name
                                            ,r.role_id
                                        from verifacto.users u
                                        join verifacto.assign_teams at2
                                          on u.user_id = at2.user_id
                                        join verifacto.teams t
                                          on at2.team_id = t.team_id
                                        JOIN verifacto.user_roles ur
                                          ON u.user_id  = ur.user_id
                                        join verifacto.roles r
                                          on ur.role_id = r.role_id
                                      where u.user_id = $1`,[data.id])

                                    console.log('check the riw',res)
            return callback(null, res.rows);
        }
        catch(err)
        {
            return callback(err.detail)
        }
    },
    deleteByIds: (data,callback)=>
    {
      const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?';
      let result = '';
      
      for (let i = 0; i < 12; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset[randomIndex];
      }

          q  = `update verifacto.users 
                   set active_flag = 'n'
                      ,email_id_1 = '${result}'
                      ,phone_number_1 = '${result}'
                      ,employee_id = '${result}'
                 where user_id =$1`
                 console.log('check the q',q);
          pool.query(q,[data.id],
                     function(error,result)
                     {
                       if(error)
                       {
                        return callback(error)
                       }
                       else
                       {
                        return callback(null,'agent deleted successfully')
                       }
                     }) 
   
    },
    updatePasswords:async(data,params,tok,callback)=>
    {
      data.password = await hashGenerate(data.password);
      q = `update verifacto.users 
              set "password" =$1
                 ,updated_at=now() 
                 ,updated_by = $2
            where user_id = $3`
        pool.query(q,[data.password,tok.id,params.id],
                     function(error,result)
                     {
                      if(error)
                      {
                        return callback(error)
                      }
                      return callback(null, 'updated password successfully')
                     })
    }
}