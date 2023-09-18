const {addNotes,updateNotes
} = require('./notes.service');

module.exports =
{
    addNote:(req,res)=>
    {
        addNotes(req.body,req.authData,(err,data)=>{
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
    updateNote:(req,res)=>
    {
        updateNotes(req.body,req.authData,(err,data)=>{
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
    }
}