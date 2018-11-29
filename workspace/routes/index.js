var express = require('express');
var router = express.Router();

var fontService = require('../service/font');


/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express', title2: 'Condition', is_check: true});
});

router.get('/shutdown', function(req, res, next) {
    process.exit(0);
    //
});

router.get('/ping', function(req, res, next) {
    res.sendStatus(200);
});

/*router.get('/1', function(req, res, next) {
	fontService.download_example()
	res.render('index', { title: 'Express', title2: 'Condition', is_check: true});
});
router.get('/2', function(req, res, next) {
	fontService.python_example()
	res.render('index', { title: 'Express', title2: 'Condition', is_check: true});
});
router.get('/3', function(req, res, next) {
	fontService.upload_WS_example()
	res.render('index', { title: 'Express', title2: 'Condition', is_check: true});
});
router.get('/4', function(req, res, next) {
	fontService.upload_WAS_example()
	res.render('index', { title: 'Express', title2: 'Condition', is_check: true});
});

router.get('/false', function(req, res, next) {
	res.render('index', { title: 'Express', title2: 'Condition', is_check: false});
});
router.get('/text', function(req, res, next){
	res.render('template/shop-cart');
})*/

module.exports = router;
