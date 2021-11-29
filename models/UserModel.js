const Config = require('../config.js')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
	name: { type: String, required: true, trim: true },
	user_id: { type: String, required: true, trim: true, unique: true },
	access_token: { type: String },
	expiry: { type: Number },
},{ timestamps: true })

const UserModel = mongoose.model('users', UserSchema)
module.exports = UserModel