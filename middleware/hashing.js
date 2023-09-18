const bcrypt = require('bcryptjs');
const saltRounds = 10;

module.exports={
    hashGenerate:async(password)=>
    {
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(password,salt);
        return hash;
    },
    hashValidator:async(password,hashedPassword)=>
    {
        const result = await bcrypt.compare(password,hashedPassword);
        return result;
    }
}