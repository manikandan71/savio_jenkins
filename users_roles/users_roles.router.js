const router = require('express').Router();
const {tokenValidation} = require('../middleware/token')
const {
    updateUserRole,addUserRole,deleteUserRole,getUserRole
} = require('./users_roles.controller');

router.post('/add',tokenValidation,addUserRole);
router.patch('/update',tokenValidation,updateUserRole);
router.delete('/delete/:id',deleteUserRole);
router.get('/get',getUserRole);

module.exports = router;