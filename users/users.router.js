const router = require('express').Router();
const {
    addUser,updateUser,getAll,getById,deleteById,exporty,updatePassword
} = require('./users.controller');
const {tokenValidation} = require('../middleware/token')

router.post('/add',tokenValidation, addUser);
router.patch('/update/:id',tokenValidation, updateUser);
router.post('/get',getAll);
router.get('/get/:id',getById);
router.delete('/delete/:id',deleteById);
router.get('/export',exporty);
router.patch('/update-password/:id',tokenValidation,updatePassword)

module.exports = router;