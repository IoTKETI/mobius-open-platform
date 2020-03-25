module.exports = class UserDTO{
    constructor(){
        this.email = null;
        this.password = null;
        this.salt = null;
        this.name = null;
        this.lastAccess = null;
        this.aeid = null;
    }

    checkNecessaryEmpty(...members){
        members.forEach(el => {
            if(!el){
                return false;
            }
        })
        return true;
    }
}