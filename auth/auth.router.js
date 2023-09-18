const router = require('express').Router();
const {tokenValidation} = require('../middleware/token');
const  { login,logout,loginReport,loginReportCount,exportLoginReport,forceLogout,checkTerminalAccex
    } = require('./auth.controller');
const { checkAgentBreakStatuslogin } = require('../breaks/breaks.controller');

router.post('/login',checkAgentBreakStatuslogin,login);
router.post('/logout/:id',tokenValidation,logout)
router.post('/login-report',loginReport)
router.post('/login-report-count',loginReportCount);
router.post('/force-logout/:id',tokenValidation,forceLogout);
router.get('/export-excel-loginreport',exportLoginReport)
router.get('/check-access-terminal',tokenValidation,checkTerminalAccex)

module.exports = router;