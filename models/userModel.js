const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

//name ,email , phôt, passsword, passwordConifrm

const userSchema = new mongoose.Schema({
  name: {
    type: 'string',
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: 'string',
    required: [true, 'Please provide your email address'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type : String,
    default : "default.jpg"
  },
  role: {
    type: 'string',
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: 'string',
    required: [true, 'Please provide your password'],
    minLength: [6, 'Password must be at least 6 characters'],
    select: false, /// Automatically never show up
  },
  passwordConfirm: {
    type: 'string',
    required: [true, 'Please confirm your password'],
    validate: {
      //This only apply to SAVE and CREATE
      validator: function (el) {
        return el == this.password;
      },
      message: 'Password is not the same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active : {
    type : Boolean,
    default : true,
    select : false
  }
});
////Middlware

userSchema.pre('save', async function (next) {
  /// Ta sử dụng modifield bởi vị ta phải tính tới trường hợp update password
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  //////////Ta set passwordConfirm = undefined bởi vì nó chỉ cần trong giai đoạn input còn trước khi lưu thì không cần nên ta có thể cho nó =undeifned để xóa nó
  this.passwordConfirm = undefined;
  next();
});
 ////// loại thằng create new document
userSchema.pre("save",function(next){
    if(!this.isModified("password") || this.isNew) return next();
         
    this.passwordChangedAt = Date.now() - 1000;
    next();
})
//// Loại bỏ thằng inactive khi find
userSchema.pre(/^find/,function(next){
    this.find({active : {$ne : false}});
    next();
});

///Method
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changedPassword = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changeTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changeTimestamp;
  }
  //Not change means not changed
  return false;
};
userSchema.methods.createPasswordResetToken = function () {
    ////Tạo token
  const resetToken = crypto.randomBytes(32).toString('hex');
  /////Mã hóa token để đưa lên schema
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
 
  this.passwordResetExpires = Date.now() + 10*60*1000;
   
  return resetToken;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
