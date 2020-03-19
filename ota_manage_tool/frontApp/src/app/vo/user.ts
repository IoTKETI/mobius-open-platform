export class UserVO {

    email : String = null;
    password : String = null;
    name : String = null;
    lastAcess : Date = null;

    constructor(email : String, password : String, name : String){
        this.email = email;
        this.password = password;
        this.name = name;
    }   


}