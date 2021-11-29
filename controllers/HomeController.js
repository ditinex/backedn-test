const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Config = require('../config.js');
const fs = require('fs');
const axios = require('axios');
const moment = require('moment');
const { User, Post, Mongoose } = require('../models')


const {
	IsExists, IsExistsOne, Insert, Find, FindOne, CompressImageAndUpload, FindAndUpdate, Delete,
	HandleSuccess, HandleError, HandleServerError,
	ValidateEmail, PasswordStrength, ValidateAlphanumeric, ValidateLength, ValidateMobile, isDataURL, GeneratePassword, Aggregate
} = require('./BaseController');

module.exports = {

	addOrUpdateUser: async (req, res, next) => {
		try {
			const { name, user_id, access_token, expiry } = req.body

			let isExists = await IsExistsOne({
				model: User,
				where: {
					user_id: user_id
				}
			})

			let data = []

			if (isExists) {
				data = await FindAndUpdate({
					model: User,
					where: { user_id: user_id },
					update: {
						$set: {
							name: name,
							access_token: access_token,
							expiry: expiry
						}
					}
				})
				if (!data)
					return HandleError(res, 'Failed to update data.')
			}
			else {

				data = await Insert({
					model: User,
					data: {
						name: name,
						user_id: user_id,
						access_token: access_token,
						expiry: expiry
					}
				})
				if (!data)
					return HandleError(res, 'Failed to insert data.')
			}

			return HandleSuccess(res, data)

		} catch (err) {
			HandleServerError(res, req, err)
		}
	},
	showLatestInsight: async (req, res, next) => {
		try {
			const user_id = req.params.user_id

			let data = await Find({
				model: Post,
				where: {
					user_id: user_id
				}
			})
			if(!data)
				data = []
			return HandleSuccess(res, data)

		} catch (err) {
			HandleServerError(res, req, err)
		}
	},
	fetchInsightData: async (req, res, next) => {
		try {
			const user_id = req.params.user_id

			let data = await Find({
				model: Post,
				where: {
					user_id: user_id
				}
			})

			if(!data)
				return HandleSuccess(res, [])

			//get access_token
			let isExists = await IsExistsOne({
				model: User,
				where: {
					user_id: user_id
				}
			})

			for (const post of data) {

				let reactions = 0
				let comments = 0

				let graphApiUrl = 'https://graph.facebook.com/v12.0/'+post.post_id+'/reactions?summary=total_count&access_token=' + isExists.access_token
				let response = await axios.get(graphApiUrl)
				
				if(response.data && response.data.summary && response.data.summary.total_count){
					reactions = response.data.summary.total_count
				}

				graphApiUrl = 'https://graph.facebook.com/v12.0/'+post.post_id+'/comments?summary=total_count&access_token=' + isExists.access_token
				response = await axios.get(graphApiUrl)
				if(response.data && response.data.summary && response.data.summary.total_count){
					comments = response.data.summary.total_count
				}

				updatedData = await FindAndUpdate({
					model: Post,
					where: { user_id: user_id, post_id: post.post_id},
					update: {
						$set: {
							insight:{
								reactions: reactions,
								comments: comments
							}
						}
					}
				})
				
			}

			data = await Find({
				model: Post,
				where: {
					user_id: user_id
				}
			})

			return HandleSuccess(res, data)

		} catch (err) {
			HandleServerError(res, req, err)
		}
	},
	verifyNewPostStatus: async (req, res, next) => {
		try {
			const user_id = req.params.user_id

			//get access_token
			let isExists = await IsExistsOne({
				model: User,
				where: {
					user_id: user_id
				}
			})

			if (isExists) {
				const graphApiUrl = 'https://graph.facebook.com/v12.0/me/posts?fields=id,permalink_url,created_time,application&limit=1&access_token=' + isExists.access_token
				let response = await axios.get(graphApiUrl)
				let data = []
				if (response.data && response.data.data.length > 0 && response.data.data[0].application && moment().diff(moment(response.data.data[0].created_time), 'minutes') < 5) {
					const postData = response.data.data[0]
					// Insert the new post if not exists
					let isExists = await IsExistsOne({
						model: Post,
						where: {
							user_id: user_id,
							post_id: postData.id
						}
					})
					if (!isExists) {
						data = await Insert({
							model: Post,
							data: {
								user_id: user_id,
								post_id: postData.id,
								parmalink_url: postData.permalink_url,
								created_time: postData.created_time,
								insight: {
									reactions: 0,
									comments: 0
								}
							}
						})
						if (!data)
							return HandleError(res, 'Failed to insert data.')
					}
				}
			}

			return HandleSuccess(res, true)

		} catch (err) {
			HandleServerError(res, req, err)
		}
	},
}