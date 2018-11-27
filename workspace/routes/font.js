var express = require('express');
var router = express.Router();
var fontService = require('../service/font');

router.post('/make', function(req, res, next) {

    var body = req.body;

    /**
     *  { making_status: 1,
          open_state: 1,
          read_state: 1,
          id: 117,
          user_id: 1,
          name: '2018/11/26 17:04:12',
          description: '',
          handwrite_image_path: 'http://file.son-mat.com/file/212/fc72b451-3ca3-4c91-a6f8-84a091e3559c.png' }
     */

    fontService.startToMakingFont(body);

	res.send();
});

module.exports = router;
