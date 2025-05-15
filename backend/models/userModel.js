import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
  fullname : {
    type:String,
    require:true
  },
  username : {
    type:String,
    require:true,
    unique:true
  },
  password : {
    type:String,
    require:true,
    minlength: 6,
  },
   phonenumber : {
    type:String,
    require:true
  },
   email : {
    type:String,
    require:true
  },
  year_of_study:{
    type:String
  },
  googleId: {
     type: String 
  },
  role: {
    type: String,
    default: ""
  }
});

const User = mongoose.model("newUser",userSchema);

export default User;