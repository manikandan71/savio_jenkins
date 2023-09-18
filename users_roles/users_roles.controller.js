const {
    updateUserRoles,addUserRoles,deleteUserRoles,getUserRoles
} = require('./users_roles.service')

module.exports={
    addUserRole:(req,res)=>{
        addUserRoles(req.body,req.authData,(err,data)=>{
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
                    message:'user role added successfully'
                })
            }
        }) 
    },
    updateUserRole:(req,res)=>
    {
        updateUserRoles(req.body,req.authData,(err,data)=>{
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
                    message:'user role updated successfully'
                })
            }
        }) 
    },
    deleteUserRole:(req,res)=>
    {
        deleteUserRoles(req.params,(err,data)=>
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
                    message:'user role deleted successfully'
                })
            } 
        })
    },
    getUserRole:(req,res)=>
    {
        getUserRoles(req.body,(err,data,count)=>{
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
                    total: count,
                })
            } 
        })
    }
}