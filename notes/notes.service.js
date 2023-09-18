const {pool} = require('../config/database');


module.exports={
    addNotes:async(data,tok,callback)=>
    {
        try
        {
           var addnot = await pool.query(`INSERT INTO verifacto.notes
                                         (notes_description,notes_date, created_at, updated_at, created_by, updated_by)
                                         VALUES($1, $2, now(), now(), $3, $4)`,
                                         [data.notes_description,data.notes_date,tok.id, tok.id])                          
            return callback(null,'notes added successfully');
        }
        catch(err)
        {
            return callback(err.detail)
        }
    },
    updateNotes:async(data,tok,callback)=>
    {
        try
        {
           var updNotes = await pool.query(`UPDATE verifacto.notes
                                            SET notes_description=$1, notes_status=$2, notes_date=$3
                                            ,updated_at=now() ,updated_by=$4
                                            WHERE notes_id=$5`,
                                            [data.notes_description ,data.notes_status ,data.notes_date
                                             ,tok.id ,data.notes_id])
           return callback(null,'notes updated successfully')
        } 
        catch(err)
        {
            return callback(err.detail)
        }
    }
}