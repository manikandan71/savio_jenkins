const express = require('express')
const app = express()
const db = require('./config/database');
const cors = require('cors');

const roles_router = require('./middleware/roles/roles.router');
const team_router = require('./teams/team.router');
const users_router = require('./users/users.router');
const users_roles_router = require('./users_roles/users_roles.router');
const forgot_password_router = require('./forgot_password/forgot_password.router');
const auth_router = require('./auth/auth.router');
const insuranceCompany_router = require('./insurance_company/insuranceCompany.router');
const lienholder_router = require('./lienholder/lienholder.router');
const entryDetails_router = require('./entry_details/entryDetails.router');
const terminal_router = require('./terminals/terminals.router');
const assignTeam_router = require('./assign_team/assignTeam.router');
const break_router = require('./breaks/breaks.router');
const document_types_router = require('./document_types/documentTypes.router');
const notes_router = require('./notes/notes.router');
const roles_access_router = require('./role_access/role_access.router')

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cors())
require('dotenv').config()

const port = process.env.PORT || 3000;

app.listen(port, ()=>{
    console.log(`NODE APP IS RUNNING ON PORT ${port}`)
})

app.use('/api/v1/roles', roles_router);
app.use('/api/v1/teams', team_router);
app.use('/api/v1/users',users_router);
app.use('/api/v1/user_roles',users_roles_router);
app.use('/api/v1/forgot_password',forgot_password_router);
app.use('/api/v1/auth',auth_router);
app.use('/api/v1/insurance_companies',insuranceCompany_router);
app.use('/api/v1/lienholder',lienholder_router);
app.use('/api/v1/entry_details',entryDetails_router);
app.use('/api/v1/terminals',terminal_router);
app.use('/api/v1/assign_teams',assignTeam_router);
app.use('/api/v1/breaks',break_router);
app.use('/api/v1/document_types',document_types_router);
app.use('/api/v1/notes',notes_router);
app.use('/api/v1/role-access',roles_access_router)

