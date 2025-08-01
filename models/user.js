import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    userName : { type : String, required : true },
    email : { type : String, required : true, unique : true },
    password : { type : String, required : true },
    role : { type : String, default : 'user' , enum : ["user" , "moderator" , "admin"] },
    skills : {type : [String]},
    createdAt : { type : Date, default : Date.now },
})

export default mongoose.model('User', userSchema);