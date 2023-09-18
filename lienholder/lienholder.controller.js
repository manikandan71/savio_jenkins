const {adds,updates,getAlls,deletes,getSortedAscs} =  require('./lienholder.service');

module.exports ={
    add:(req,res)=>
    {
        adds(req.body,req.authData,(err,data)=>{
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
                    message:'lienholder added successfully'
                })
            }
        })
    },
    update:(req,res)=>
    {
        updates(req.body,req.authData,(err,data)=>{
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
                    message:'lienholder updated successfully'
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
                    data:data,
                    total:count,
                })
            }
        })
    },
    getSortedAsc:(req,res)=>{
        getSortedAscs(req.body,(err,data)=>{
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
                })
            }
        })
    },
    deleted:(req,res)=>
    {
        deletes(req.params,(err,data)=>{
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
                    message:'lienholder deleted successfully',
                })
            }
        })
    },
}