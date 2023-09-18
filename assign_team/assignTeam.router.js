const router = require('express').Router();
const {tokenValidation} = require('../middleware/token')

const {
    assignTeamforUser,updateAssignTeamforUser,getAllAssignTeamUser,getAssignTeamUserById,deleteAssignTeamUser,
} = require('./assignTeam.controller');

router.post('/add',tokenValidation,assignTeamforUser);
router.patch('/update',tokenValidation,updateAssignTeamforUser);
router.get('/get',getAllAssignTeamUser);
router.get('/get/:id',getAssignTeamUserById);
router.delete('/delete/:id',deleteAssignTeamUser);

module.exports = router;