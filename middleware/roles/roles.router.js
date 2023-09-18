const router = require('express').Router();
const {tokenValidation} = require('../../middleware/token');

const {
    addRole,updateRole,getAllRole,getRoleById,deleteRole
} = require('./roles.controller');


router.post('/add',tokenValidation,addRole);
router.patch('/update',tokenValidation,updateRole);
router.post('/get',getAllRole );
router.get('/get/:id',getRoleById);
router.delete('/delete/:id',deleteRole);

module.exports = router;