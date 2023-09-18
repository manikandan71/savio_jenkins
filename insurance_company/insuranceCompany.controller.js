const {adds,updates,getAlls,deletes,listSortedAscs} =  require('./insuranceCompany.service');

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
                    message:'insurance company added successfully'
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
                    message:'insurance company updated successfully'
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
                    message:'insurance company deleted successfully',
                })
            }
        })
    },
    listSortedAsc:(req,res)=>
    {
        listSortedAscs(req.body,(err,data)=>{
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
    }
}