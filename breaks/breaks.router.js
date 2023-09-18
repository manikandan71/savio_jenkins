const router = require('express').Router();
const {
    addBreak,updateBreak,getAllBreak,getById,deleteById,chooseBreak,endBreak,
    breakStatusList,unlockBreak,unlockedBreakList,unlockedBreakCount,checkAgentBreakStatus,breakReportList,dateWiseReportList
    ,breakReportListcount,exportBreakReport,todayRemainingBreakTime
} = require('./breaks.controller');
const {tokenValidation} = require('../middleware/token')

router.post('/add',tokenValidation,addBreak)
router.patch('/update',tokenValidation,updateBreak);
router.post('/getAll',getAllBreak);
router.get('/get/:id',getById);
router.delete('/delete/:id',deleteById);
router.post('/choose-break',tokenValidation,chooseBreak);
router.patch('/end-break',tokenValidation,endBreak);
router.post('/break-status',breakStatusList);
router.patch('/unlock-agent',tokenValidation,unlockBreak);
router.post('/unlock-byagent-list',tokenValidation,unlockedBreakList);
router.get('/unlock-byagent-count',tokenValidation,unlockedBreakCount);
router.get('/check-agent-break-status',tokenValidation,checkAgentBreakStatus);
router.post('/break-reports',breakReportList);
router.post('/datewise-break-report',dateWiseReportList);
router.post('/break-report-count',breakReportListcount);
router.get('/export-excel-breakreport',exportBreakReport);
router.get('/today-remaining-break-time',tokenValidation,todayRemainingBreakTime)


module.exports = router;