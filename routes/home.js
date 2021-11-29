const express = require('express');
const router = express.Router();

const Controllers = require('../controllers')
const Home = Controllers.Home

router.get('/verify-new-post-status/:user_id',Home.verifyNewPostStatus);
router.get('/show-latest-insights/:user_id',Home.showLatestInsight);
router.get('/fetch-insight-data/:user_id',Home.fetchInsightData);
router.post('/add-or-update-user',Home.addOrUpdateUser);

module.exports = router;