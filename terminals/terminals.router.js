const router = require('express').Router();
const {
    addTerminal,updateTerminal,getTerminalAll,getTerminalById,
    deleteTerminal,listAvailableTerminal,chooseTerminal,listofActiveTerminal
} = require('./terminals.controller');
const {tokenValidation} = require('../middleware/token')

router.post('/add',tokenValidation,addTerminal);
router.patch('/update/:id',tokenValidation,updateTerminal);
router.get('/get',getTerminalAll);
router.get('/get/:id',getTerminalById);
router.delete('/delete/:id',deleteTerminal);
router.post('/availables',tokenValidation,listAvailableTerminal);
router.patch('/choose',tokenValidation,chooseTerminal);
router.get('/active-terminal',listofActiveTerminal);


module.exports = router;