const router = require('express').Router();
const {tokenValidation} = require('../middleware/token')
const {
    add,update,getAll,deleted,getSortedAsc
} = require('./lienholder.controller');

router.post('/add',tokenValidation,add);
router.patch('/update',tokenValidation,update);
router.post('/get',getAll );
router.get('/list',getSortedAsc)
router.delete('/delete/:id',deleted);

module.exports = router;