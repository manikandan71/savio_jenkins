const 
{
    addTeams,updateTeams,getAllTeams,getTeamIds,deleteTeams,
} = require('./team.service');

module.exports={
    addTeam:(req,res)=>
    {
        addTeams(req.body,req.authData,(err,data)=>{
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
                  message:'team added successfully'
              })
            }
        })
    },
    updateTeam:(req,res)=>
    {
        updateTeams(req.body,req.authData,(err,data)=>{
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
                  message:'team updated successfully'
              })
            }
        })
    },
    getAllTeam:(req,res)=>
    {
        getAllTeams(req.body,(err,data,count)=>
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
                  data: data,
                  total:count
              })
            } 
        })
    },
    getTeamId:(req,res)=>
    {
        getTeamIds(req.params,(err,data)=>
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
                  data: data
              })
            } 
        })
    },
    deleteTeam:(req,res)=>
    {
        deleteTeams(req.params, (err,data)=>{
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
                  message:'team deleted successfully'
              })
            } 
        })
    }
}