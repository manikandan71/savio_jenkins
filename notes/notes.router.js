const router = require('express').Router();
const {tokenValidation} = require('../middleware/token')
const { addNote,updateNote } = require('./notes.controller');

router.post('/add',tokenValidation,addNote);
router.patch('/update', tokenValidation, updateNote)



module.exports = router;