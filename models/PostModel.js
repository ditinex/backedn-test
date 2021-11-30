const Config = require('../config.js')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PostSchema = new Schema({
	post_id: { type: String, required: true, trim: true },
	user_id: { type: String, required: true, trim: true },
	parmalink_url: { type: String, trim: true },
	created_time: { type: Date },
	insight: { type: Object },
	reaction_summary:{ type: Array },
	comment_summary:{ type: Array },
	share_summary:{ type: Array }
},{ timestamps: true })

const PostModel = mongoose.model('posts', PostSchema)
module.exports = PostModel