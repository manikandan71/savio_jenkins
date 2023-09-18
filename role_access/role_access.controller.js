const {getRoleAccessDetails,updateRoleAccess
        ,checkPageAccess,menuLists,newGetRoleAccessDetails
        ,newUpdateRoleAccess,newCheckPageAccess,newMenuLists} =  require('./role_access.service');

module.exports ={
    getRoleAccessDetail:(req,res)=>
    {
        getRoleAccessDetails(req.params,(err,data)=>{
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
                    access: data
                })
            }
        })
    },
    updateRoleAccessed:(req,res)=>
    {
        updateRoleAccess(req.params,req.body,req.authData,(err,data)=>{
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
                    access: data
                })
            }
        })
    },
    checkPageAccessed:(req,res)=>
    {
        checkPageAccess(req.params,req.authData,(err,data)=>{
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
                    access: data
                })
            }
        })
    },
    menuList:(req,res)=>
    {
        menuLists(req.authData,(err,data)=>{
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
    newGetRoleAccessDetail:(req,res)=>
    {
        newGetRoleAccessDetails(req.params,(err,data)=>{
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
                    access: data
                })
            }
        })
    },
    newUpdateRoleAccessed:(req,res)=>
    {
        newUpdateRoleAccess(req.body,req.authData,(err,data)=>{
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
                    message: data
                })
            }
        })
    },
    newCheckPageAccessed:(req,res)=>
    {
        newCheckPageAccess(req.params,req.authData,(err,data)=>{
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
                    access: data
                })
            }
        }) 
    },
    newMenuList:(req,res)=>
    {
        newMenuLists(req.authData,(err,data)=>{
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
                    access: data
                })
            }
        }) 
    }
    
}