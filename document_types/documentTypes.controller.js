const 
{
    adddocumentTypes,updateDocumentTypes,getAllDocumentTypes,getByIds,deleteByIdDocumentTypes
} = require('./documentTypes.service');

module.exports=
{
    adddocumentType:(req,res)=>
    {
        adddocumentTypes(req.body,req.authData,(err,data)=>{
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
    updateDocumentType:(req,res)=>
    {
        updateDocumentTypes(req.body,req.authData,(err,data)=>{
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
    getAllDocumentType:(req,res)=>
    {
        getAllDocumentTypes(req.body,(err,data,count)=>{
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
    deleteByIdDocumentType:(req,res)=>
    {
        deleteByIdDocumentTypes(req.params,(err,data)=>{
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
}