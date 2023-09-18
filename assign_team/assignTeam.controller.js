const {assignTeamforUsers,updateAssignTeamforUsers,
    getAllAssignTeamUsers,getAssignTeamUserByIds,deleteAssignTeamUsers} = require('./assignTeam.service');

module.exports =
{
    assignTeamforUser:(req,res)=>
    {
        assignTeamforUsers(req.body,req.authData,(err,data)=>{
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
    updateAssignTeamforUser:(req,res)=>
    {
        updateAssignTeamforUsers(req.body,req.authData,(err,data)=>{
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
    getAllAssignTeamUser:(req,res)=>
    {
        getAllAssignTeamUsers(req.body,(err,data,count)=>{
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
    getAssignTeamUserById:(req,res)=>
    {
        getAssignTeamUserByIds(req.params,(err,data)=>{
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
    deleteAssignTeamUser:(req,res)=>
    {
        deleteAssignTeamUsers(req.params,(err,data)=>{
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
    }
}