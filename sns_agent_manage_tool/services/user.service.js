const UserModel = require('../models/user.model');

exports.createUser = (user) => {

    newUser = new UserModel({
        email : user.email,
        name : user.name,
    });

    return newUser.save();
}

exports.modifyUserInfo = (user) => {

    console.log(user);
    return UserModel.findOneAndUpdate({email : user.email}, {
        password : user.password,
        name : user.name
    }).exec()
}

exports.resetPassword = (user) => {

    return UserModel.findOneAndUpdate({ email : user.email }, 
        { password : user.password }
    ).exec();
}

exports.leaveUser = (userEmail) => {
    return UserModel.findOneAndDelete({ email : userEmail}).exec();
}

exports.deleteUser = (userEmail) => {
    return UserModel.deleteMany({email : { $in : userEmail}}).exec();
}

exports.getUserInfomation = (userEmail) => {
    return UserModel.findOne({email : userEmail}).exec();
}

exports.getUserList = () => {
    return UserModel.find({},{email : 1, name : 1, lastAccess : 1, admin : 1}).exec();
}

exports.getUserListByEmail = (userList) => {
    return UserModel.find({email : {$in : userList}}, {_id : true, email : true}).lean().exec();
}