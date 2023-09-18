const {addTerminals,updateTerminals,getTerminalAlls,
      getTerminalByIds,deleteTerminals,
      listAvailableTerminals,chooseTerminals,listofActiveTerminals} = require('./terminals.service')

module.exports ={
    addTerminal:(req,res)=>
    {
        addTerminals(req.body,req.authData,(err,data)=>{
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
    updateTerminal:(req,res)=>
    {
        updateTerminals(req.body,req.authData,req.params,(err,data)=>{
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
                  message:'terminal updated successfully'
              })
            }
        })
    },
    getTerminalAll:(req,res)=>
    {
        getTerminalAlls(req.body,(err,data,count)=>{
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
    getTerminalById:(req,res)=>
    {
        getTerminalByIds(req.params,(err,data)=>{
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
    deleteTerminal:(req,res)=>
    {
        deleteTerminals(req.params,(err,data)=>{
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
                  message:'terminal deleted successfully'
              })
            }
        })
    },
    listAvailableTerminal:(req,res)=>{
        listAvailableTerminals(req.body, req.authData,(err,data,count)=>{
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
    chooseTerminal:(req,res)=>
    {
        chooseTerminals(req.body, req.authData,(err,data)=>{
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
    listofActiveTerminal:(req,res)=>
    {
        listofActiveTerminals(req.body,(err,data,count)=>{
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
    }
}