const router = require('express').Router();
const {tokenValidation} = require('../middleware/token')
const {
    add,update,getAll,deleted,listSortedAsc
} = require('./insuranceCompany.controller');

router.post('/add',tokenValidation,add);
router.patch('/update',tokenValidation,update);
router.post('/get',getAll );
router.get('/list',listSortedAsc)
router.delete('/delete/:id',deleted);

module.exports = router;