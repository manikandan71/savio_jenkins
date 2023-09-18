const {addRoles,updateRoles,getAllRoles,getRoleByIds,deleteRoles} = require('./roles.service');

module.exports =
{
    addRole:(req, res)=>
    {
        addRoles(req.body,req.authData,(err, data)=>
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
                message:'role added successfully'
            })
          }
        })
    },
    updateRole:(req,res)=>
    {
        updateRoles(req.body,req.authData,(err,data)=>{
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
                    message:'role updated successfully'
                })
            }
        })
    },
    getAllRole:(req,res)=>
    {
        getAllRoles(req.body,(err,data,count)=>{
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
    getRoleById:(req,res)=>
    {
        getRoleByIds(req.params,(err,data)=>{
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
    deleteRole:(req,res)=>
    {
        deleteRoles(req.params,(err,data)=>
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
                    message:'role deleted successfully'
                })
            }   
        })
    }
}