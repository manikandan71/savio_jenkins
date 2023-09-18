const express = require('express')
const app = express()
const {pool} = require('./config/database');
const cors = require('cors');
const cron = require('node-cron');
const moment = require('moment-timezone'); 
const {cronJobMail} = require('./middleware/sendMail');

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cors())
require('dotenv').config()

const port = 5050;

app.listen(port, ()=>{
    console.log(`NODE CRON APP IS RUNNING ON PORT ${port}`)
})

const trigger =()=>
{  
    const current_time = moment.tz('America/New_York').format('YYYY-MM-DD HH:mm:ss.SSS');

    ct = `select t.user_id 
            from verifacto.terminals t 
           where status = 'y' `

       pool.query(ct,
                  function(error,result)
                  {
                    if(error)
                    {
                        return error
                    }
                    else
                    { 
                        var user_ids = result.rows;
                       
                       if(result.rowCount != 0)
                       {

                       
                        ut = `UPDATE verifacto.terminals
                                 SET user_id=null
                                    ,status='n'
                               WHERE status='y'`
                    
                        pool.query(ut,
                                function(error,result){
                                    if(error)
                                    {
                                        return error
                                    }

                                    fmt = `select max(ed.end_time) 
                                            from verifacto.entry_details ed  
                                            where user_id = $1
                                            and start_time :: date = current_date`
                                    for(let i=0; i<user_ids.length; i++)
                                    {
                                        pool.query(fmt,[user_ids[i].user_id],
                                                    function(error,result)
                                                    {
                                                        if(error)
                                                        {
                                                            return error
                                                        }
                                                        else
                                                        {
                                                        
                                                        const logouts = result.rows[0].max ? 
                                                                        moment(result.rows[0].max).format('YYYY-MM-DD HH:mm:ss.SSS')
                                                                            : current_time ;
                                                        
                                                        lg = `update verifacto.user_logins 
                                                                set logout_time = $1
                                                                    ,logout_by='system'
                                                                where user_id = $2
                                                                and login_time :: date = current_date`
                                                        pool.query(lg,[logouts,user_ids[i].user_id],
                                                                        function(error,result)
                                                                        {
                                                                            if(error)
                                                                            {
                                                                                return error
                                                                            }
                                                                            else
                                                                            {
                                                                                console.log('successfully logout')
                                                                            }
                                                                        })  
                                                        }
                                                    })
                                    }

                              })  

                      }
                        else
                        {
                        console.log('all terminals are active')

                        return 'all terminals are active'
                        }

                    }
                  })
}

 
cron.schedule('30 23 * * *', () => {
    console.log('Cron job running at 11:30 PM EST');
    trigger();
    cronJobMail();
  }, {
    scheduled: true,
    timezone: "America/New_York" // Set the timezone explicitly
  });