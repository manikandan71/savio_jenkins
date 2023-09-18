const router = require('express').Router();
const {
    addTeam,updateTeam,getAllTeam,getTeamId,deleteTeam,
} = require('./team.controller');
const {tokenValidation} = require('../middleware/token')

router.post('/add',tokenValidation,addTeam);
router.patch('/update',tokenValidation,updateTeam);
router.get('/get',getAllTeam);
router.get('/get/:id',getTeamId);
router.delete('/delete/:id',deleteTeam);

module.exports = router;