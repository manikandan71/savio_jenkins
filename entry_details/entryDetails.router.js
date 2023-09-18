const router = require('express').Router();
const {tokenValidation} = require('../middleware/token')
const { addEntry,updateEntry,getAllEntry,getEntryById,deleteById,
       todayEntryCount,todayEntryData,getAllEntryByAgentandAdmin,getOverAllMyCount,getEntriesTotal,exportEntries,
       todayDailyCount,getAgentWiseReport,getAgentWiseReportCount,exportAgentWiseReport,exportConsolidateReport,getDocandVinCount
       } = require('./entryDetails.controller');

router.post('/add', tokenValidation, addEntry);
router.patch('/update',tokenValidation,updateEntry);
router.get('/get',getAllEntry);
router.get('/get/:id',getEntryById);
router.delete('/delete/:id',deleteById);
router.post('/today/data', tokenValidation, todayEntryData);
router.get('/today/count/:id', tokenValidation, todayEntryCount);
router.get('/daily/count/:id',tokenValidation,todayDailyCount);
router.post('/my-entries',tokenValidation,getAllEntryByAgentandAdmin);
router.post('/overall-count',tokenValidation,getOverAllMyCount);
router.post('/entries-list-total',tokenValidation,getEntriesTotal);
router.post('/excel-entry',exportEntries);
router.post('/agent-wise-report',getAgentWiseReport);
router.post('/agent-wsie-report-count',getAgentWiseReportCount);
router.post('/get-total-count-vin-doc',getDocandVinCount)
router.get('/export-excel-agentwise',exportAgentWiseReport)
router.get('/export-excel-consolidatereport',exportConsolidateReport)
module.exports = router;