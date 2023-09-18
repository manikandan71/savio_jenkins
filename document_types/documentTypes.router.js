const router = require('express').Router();
const {
    adddocumentType,updateDocumentType,getAllDocumentType,getById,deleteByIdDocumentType
} = require('./documentTypes.controller');
const {tokenValidation} = require('../middleware/token')

router.post('/add',tokenValidation,adddocumentType);
router.patch('/update',tokenValidation,updateDocumentType);
router.post('/get',getAllDocumentType)
router.get('/get/:id',getById);
router.delete('/delete/:id',deleteByIdDocumentType)


module.exports = router;