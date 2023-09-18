const router = require('express').Router();
const {tokenValidation} = require('../middleware/token')
const {
    getRoleAccessDetail,updateRoleAccessed,checkPageAccessed,menuList
    ,newGetRoleAccessDetail,newUpdateRoleAccessed,newCheckPageAccessed,newMenuList
 } = require('./role_access.controller');

router.get('/get/:role_id',getRoleAccessDetail);
router.post('/update-access/:role_id',tokenValidation,updateRoleAccessed)
router.get('/get-pageaccess/:page_id',tokenValidation,checkPageAccessed);
router.get('/menu-list',tokenValidation,menuList);
router.get('/get-roleaccess/:role_id',newGetRoleAccessDetail)
router.post('/update-role-access',tokenValidation,newUpdateRoleAccessed)
router.get('/check_page_access/:page_id',tokenValidation,newCheckPageAccessed)
router.get('/access-menu-list',tokenValidation,newMenuList);
module.exports = router;