const {pool} = require('../config/database');


module.exports = 
{
    getRoleAccessDetails:(data,callback)=>
    {
        mq = ` select am.access_module_id 
                     ,am.access_module_name 
                     ,amf.access_module_function_id 
                     ,amf.access_module_function_name 
                     ,amf.access_module_function_description
                 from verifacto.access_module_functions amf 
                     ,verifacto.access_modules am 
                where amf.access_module_id = am.access_module_id `

        sq = ` select armm.access_module_function_id
                     ,armm.access_module_id 
                     ,armm.role_id
                from verifacto.access_role_module_mapping armm
                where role_id = ${data.role_id}`

            pool.query(mq,
                      function(error,result)
                      {
                         
                         for(let i=0; i<result.rowCount; i++)
                         {
                            result.rows[i].access = false
                         }
                       
                         var parent = result.rows
                         pool.query(sq,
                                    function(error,result)
                                     {
                                        if(error)
                                        {
                                            return callback(error)
                                        }
                                        else
                                        {
                                         var child =  result.rows
                                          for(let i=0; i<parent.length;i++)
                                          {
                                            for(let j=0; j<child.length;j++)
                                            {
                                              if(parent[i].access_module_function_id === child[j].access_module_function_id)
                                              {  
                                                parent[i].access= true
                                                break
                                              }
                                            }
                                          }
                                          return callback(null,parent)
                                        }
                                     })
                      })
    },
    updateRoleAccess:(id,data,tok,callback)=>
    {  

       delq = ` delete 
                  from verifacto.access_role_module_mapping  
                 where role_id = ${id.role_id}`
        // var arr = JSON.parse(data.access); 
        var arr = data.access;
        var curr_date = new Date()

        pool.query(delq,
             function(error,result){
                            if(error)
                            {
                                return callback(error)
                            }
                            else
                            {   
                               iq = `INSERT INTO verifacto.access_role_module_mapping
                                     (role_id, access_module_id, access_module_function_id, created_at, updated_at, created_by, updated_by)
                                     VALUES($1,$2,$3, $4,$5, $6, $7);` 
                                for(let i=0;i<arr.length;i++)
                                {
                                    if(arr[i].access === true)
                                    {
                                      pool.query(iq,[id.role_id,arr[i].access_module_id,arr[i].access_module_function_id,curr_date,curr_date,tok.id,tok.id],
                                                     function(error,result)
                                                     {
                                                      if(error)
                                                      {
                                                        return callback(error)
                                                      }
                                                     }     
                                        )
                                    }
                                }
                                return callback(null,'access updated successfully')
                            }
                        })
       
    },
    checkPageAccess:(id,tok,callback)=>
    {  
      //  console.log('check the tok',id, tok);

          q= `select armm.role_id
                    ,armm.access_module_id
                    ,am.access_module_name
                   ,ARRAY_AGG(armm.access_module_function_id) AS access_module_function_ids
                from verifacto.access_role_module_mapping armm
                join verifacto.access_modules am 
                  on am.access_module_id = armm.access_module_id
                join verifacto.access_module_functions amf 
                  on amf.access_module_function_id = armm.access_module_function_id
               where armm.role_id = ${tok.role}
                 and armm.access_module_id = ${id.page_id}
            group by armm.role_id
                    ,armm.access_module_id
                    ,am.access_module_name`

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
    menuLists:(tok,callback)=>
    {
       q =`select amf.access_module_id 
                  ,amf.access_module_function_name 
              from verifacto.access_role_module_mapping armm 
                  ,verifacto.access_module_functions amf 
             where amf.access_module_function_id  = armm.access_module_function_id 
               and armm.role_id = ${tok.role}
              and amf.access_module_function_description = 'menu'`

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
    newGetRoleAccessDetails:async(data,callback)=>
    {
      q=` SELECT a.id
                ,a.description as pageDesc
                ,a.permission_name 
                ,CASE WHEN res.access > 0 THEN true ELSE false END access
            from verifacto.acc_permission as a
       left join (SELECT o.id as access 
                    from verifacto.acc_permission o
                    JOIN verifacto.acc_permission_function_mapping p 
                      ON o.id = p.acc_permission_id 
                   WHERE p.role_id  =${data.role_id}
                GROUP BY o.id
                        ,p.acc_permission_id) as res on res.access=a.id
          where a.access_required = 1`

       pool.query(q,
                async function(error,result)
                  {
                    if(error)
                    {
                      return callback(error)
                    }
                    else
                    {
                      var page_access = result.rows;
                      
                      for (let i = 0; i < page_access.length; i++) {
                        const page = page_access[i];

                        const sq = `SELECT id
                                      ,role_id
                                      ,function_name 
                                      ,access
                                      ,description
                                  from (SELECT id
                                              ,role_id
                                              ,o2.function_name  
                                              ,CASE WHEN res.access > 0 THEN true ELSE false END access
                                              ,o2.function_description as description
                                          from verifacto.acc_permission_function as o2 
                                    left join (SELECT  pf.id as access
                                                      ,pfm.role_id  as role_id
                                                      ,pf.acc_permission_id
                                                      ,pfm.acc_permission_function_id  
                                                  from verifacto.acc_permission_function_mapping pfm
                                                  JOIN verifacto.acc_permission_function pf
                                                    ON pf.id = pfm.acc_permission_function_id 
                                                WHERE pfm.acc_permission_id  = ${page.id}
                                                  AND pfm.role_id = ${data.role_id}) as res on res.access=o2.id
                                              where o2.acc_permission_id  =  ${page.id}
                                            GROUP BY role_id
                                                    ,o2.id
                                                    ,res.access
                                  ) as a`;

                        try {
                          const result = await pool.query(sq);
                          page.child = result.rows;
                        } catch (err) {
                          return callback(err);
                        }
                      }

                      return callback(null, page_access);
                    }
                  })
    },
    newUpdateRoleAccess:(data,tok,callback)=>
    {
          delq = ` delete 
                     from verifacto.acc_permission_function_mapping 
                    where role_id = ${data.role_id}`

          // var arr = JSON.parse(data.access); 
          var arr = data.access

        pool.query(delq,
                    async function(error,result)
                    {
                      if(error)
                      {
                        return callback(error)
                      }
                      else
                      {
                        for(let i=0;i<arr.length;i++)
                        {    console.log('check the arrr', arr[i])
                            if(arr[i].access === true)
                            {
                              if(arr[i].child.length > 0)
                              {   
                                iq = `INSERT INTO verifacto.acc_permission_function_mapping
                                       (role_id, acc_permission_id, acc_permission_function_id, created_at, updated_at, created_by, updated_by)
                                       VALUES(${data.role_id},${arr[i].id} , 1, now(), now(), ${tok.id},  ${tok.id})`
            
                                  try {
                                         await pool.query(iq);
                                          
                                         var childarr = arr[i].child
                                         for(let j=0; j < childarr.length ; j++)
                                         {
                                           if(childarr[j].access === true)
                                           {
                                             iq = `INSERT INTO verifacto.acc_permission_function_mapping
                                             (role_id, acc_permission_id, acc_permission_function_id, created_at, updated_at, created_by, updated_by)
                                             VALUES(${data.role_id},${arr[i].id} ,${childarr[j].id}, now(), now(), ${tok.id},  ${tok.id})`
                 
                                             try {
                                                     await pool.query(iq);
                                                 } 
                                           catch (err)
                                                 {
                                                   return callback(err);
                                                 }
                                                 }
                                         }
                                      } 
                                catch (err)
                                      {
                                        return callback(err);
                                      }

                               
                              }
                              else
                              {
                                 iq = `INSERT INTO verifacto.acc_permission_function_mapping
                                       (role_id, acc_permission_id, acc_permission_function_id, created_at, updated_at, created_by, updated_by)
                                       VALUES(${data.role_id},${arr[i].id} , 1, now(), now(), ${tok.id},  ${tok.id})`
            
                                  try {
                                         await pool.query(iq);
                                      } 
                                catch (err)
                                      {
                                        return callback(err);
                                      }
                              }
                            }
                        }
                        return callback(null, "role updated successfully")
                      }
                    })

       
    },
    newCheckPageAccess:(data,tok,callback)=>
      {          aq = `select ap.id as page_id
                             ,ap.permission_name as page_name
                             ,case 
                                when ap.id = res.access
                                then true
                                else false
                              end as access    
                         from verifacto.acc_permission ap 
                     left join (select ap.id as access
                                  from verifacto.acc_permission ap 
                                  join verifacto.acc_permission_function_mapping p
                                    on ap.id = p.acc_permission_id  
                                 where p.role_id  = ${tok.role}
                                   and p.acc_permission_id  = ${data.page_id}
                              group by ap.id) as res 
                           on res.access = ap.id
                  where ap.id = ${data.page_id}`
                  pool.query(aq, 
                        async function(error,result)
                            {
                              if(error)
                              {
                                return callback(error)
                              }
                           
                              var page  = result.rows[0]
                            if(page.access === true)
                            {
                              const sq = `SELECT id
                                                ,function_name 
                                                ,access
                                            from (SELECT id
                                                        ,role_id
                                                        ,o2.function_name  
                                                        ,CASE WHEN res.access > 0 THEN true ELSE false END access
                                                        ,o2.function_description as description
                                                    from verifacto.acc_permission_function as o2 
                                              left join (SELECT  pf.id as access
                                                                ,pfm.role_id  as role_id
                                                                ,pf.acc_permission_id
                                                                ,pfm.acc_permission_function_id  
                                                            from verifacto.acc_permission_function_mapping pfm
                                                            JOIN verifacto.acc_permission_function pf
                                                              ON pf.id = pfm.acc_permission_function_id 
                                                          WHERE pfm.acc_permission_id  = ${page.page_id}
                                                            AND pfm.role_id = ${tok.role}) as res on res.access=o2.id
                                                        where o2.acc_permission_id  =  ${page.page_id}
                                                      GROUP BY role_id
                                                              ,o2.id
                                                              ,res.access
                                            ) as a`;

                                      try {
                                            const result = await pool.query(sq);
                                            page.child = result.rows;
                                            return callback(null,page)
                                            } 
                                catch (err) {
                                              return callback(err);
                                            }
                            }
                            else
                            {
                              return callback(null, page)
                            }

                            })
    },
    newMenuLists:(tok,callback)=>
    {
        mq = `select ap.id
                    ,ap.permission_name as name
                    ,ap.url
                from verifacto.acc_permission ap 
              where ap.parent_id is null
           order by ap.sequence_no`

        pool.query(mq,
                   async function(error,result)
                   {
                    if(error)
                    {
                      return callback(error)
                    }
                      var menu = result.rows

                        for(let i=0; i<result.rowCount; i++)
                        {
                           sq = `SELECT a.id
                                       ,a.permission_name as name
                                       ,a.url
                                       ,CASE WHEN res.access > 0 THEN 'true' ELSE 'false' END access
                                   from verifacto.acc_permission as a
                              left join (SELECT o.id as access 
                                           from verifacto.acc_permission o
                                           JOIn verifacto.acc_permission_function_mapping p 
                                             ON o.id = p.acc_permission_id 
                                          WHERE p.role_id = ${tok.role}
                                       GROUP BY o.id) as res on res.access= a.id
                                          where a.access_required = 1 
                                            and a.parent_id = ${menu[i].id}
                                       order by a.sequence_no`

                                try {
                                  const res = await pool.query(sq);
                                  if(res.rowCount === 1) 
                                  {
                                   menu[i].access = res.rows[0].access
                                  }
                                  if(res.rowCount > 1)
                                  {
                                    let hasAccess = "false";
                                    for (let j=0; j < res.rowCount; j++) {
                                      if (res.rows[j].access === "true") {
                                        hasAccess = "true";
                                        break; 
                                      }
                                    }
                                    menu[i].access = hasAccess; 
                                  }
                                  menu[i].submenu = res.rows;
                                 
                                 } 
                                catch (err) {
                                  return callback(err);
                                }
                                
                         }
                         return callback(null, menu)

                   })
    }
}