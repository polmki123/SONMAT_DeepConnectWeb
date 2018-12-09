var fs = require('fs');
var request = require('request');
var path = require('path');
var ps = require('python-shell');
var convert = require('./model_apply_python/test');

function startToMakingFont(font) {

    // handwrite image download
    downloadInputImage(font.handwrite_image_path, font.id, 'handwrite_image.jpg')
   /* .then(function(imagePath) {

    // run python code
        console.log("[downloadInputImage success] ", imagePath);
        return runPythonCode(imagePath, font.id)
    })*/.then(function() {

    // convert svg to ttf
        console.log("[runPythonCode success] ");
        var ttf_file_path = [];
        ttf_file_paths.push(convert.convert_svg_to_ttf(font.id,1));
        ttf_file_paths.push(convert.convert_svg_to_ttf(font.id,2));
        ttf_file_paths.push(convert.convert_svg_to_ttf(font.id,3));
        return ttf_file_paths;
    }).then(function(fontFilePaths) {

    // font files upload
        console.log("[runPythonCode success] ", fontFilePaths);
        return uploadFontFiles(fontFilePaths)
    }).then(function(fontUrls) {

    // send make-complete message to SONMAT-WEB
        console.log("[uploadFontFiles success] ", fontUrls);
        return sendCompleteMessage(font.id, fontUrls, font.phone)

    }).then(function(result) {
        console.log(result)
    }).catch(function(err) {
        console.log(err);
    });
}



function download_example() {

    downloadInputImage('http://file.son-mat.com/file/212/fc72b451-3ca3-4c91-a6f8-84a091e3559c.png', 10, '/sample.png')
    .then(function(imagePath) {
        console.log(imagePath)
        // 'C:\\Users\\hhjun\\Desktop\\workspace\\nodejs\\SONMAT_DeepConnectWeb\\workspace\\repository\\10\\sample.png'
    }).catch(function(err) {
        console.log(err);
    });
}

function python_example(){

    runPythonCode('C:\\Users\\hhjun\\Desktop\\workspace\\nodejs\\SONMAT_DeepConnectWeb\\workspace\\repository\\10\\sample.png')
    .then(function(fontFilePaths) {
        console.log(fontFilePaths)
  //       [ 'C:\\Users\\hhjun\\Desktop\\workspace\\nodejs\\SONMAT_DeepConnectWeb\\workspace\\repository\\10\\sample.png',
  //         'C:\\Users\\hhjun\\Desktop\\workspace\\nodejs\\SONMAT_DeepConnectWeb\\workspace\\repository\\10\\sample.png' ]

    }).catch(function(err) {
        console.log(err);
    });
}

function upload_WS_example() {

    // upload font data
    uploadFontFiles(['C:\\Users\\hhjun\\Desktop\\workspace\\nodejs\\SONMAT_DeepConnectWeb\\workspace\\repository\\10\\sample.png',
                           'C:\\Users\\hhjun\\Desktop\\workspace\\nodejs\\SONMAT_DeepConnectWeb\\workspace\\repository\\10\\sample.png',])
    .then(function(fontUrls) {
        console.log(fontUrls)
  //       [ 'http://file.son-mat.com/file/9639/a5f7baa1-6799-497a-8aea-bfb7a2e7ac02.png',
  //         'http://file.son-mat.com/file/1539/0549c1c9-fc49-4ec5-a5a3-16d4b06ef47a.png' ]
        
    }).catch(function(err) {
        console.log(err);
    });
}

function upload_WAS_example() {

    var font_id = 10;
    uploadFontFiles(font_id, [ 'http://file.son-mat.com/file/9639/a5f7baa1-6799-497a-8aea-bfb7a2e7ac02.png',
                                     'http://file.son-mat.com/file/1539/0549c1c9-fc49-4ec5-a5a3-16d4b06ef47a.png' ])
    .then(function(result) {
        console.log(result)
        
    }).catch(function(err) {
        console.log(err);
    });
}



function downloadInputImage(filePath, font_id, newFileName) {

    var REPOSITORY_PATH = '/home/deep_user/repository';
    var IMAGE_DOWNLOAD_DIR_PATH = path.join(REPOSITORY_PATH, ''+ font_id);
    if (!fs.existsSync(IMAGE_DOWNLOAD_DIR_PATH))
        fs.mkdirSync(IMAGE_DOWNLOAD_DIR_PATH,{ recursive: true })

    var newFilePath = path.join(IMAGE_DOWNLOAD_DIR_PATH, newFileName);

    var download = function(uri, filename, callback, Error_callback){
        request.head(uri, function(err, res, body){
            request(uri).pipe(fs.createWriteStream(filename))
            .on('close', callback)
            .on('error', Error_callback);
        });
    };

    return new Promise(function(resolve, reject){
        download(filePath, newFilePath, function(){
            console.log('done');
            resolve(newFilePath);
        }, function(err){
            console.log('File download error');
            reject(err);
        });
    });
}


function runPythonCode(imagePath, font_id) {

    var PYTHON_PATH = "/usr/bin/python3";
    var MODEL_APPLY_PYTHON_CODE_DIR = __dirname + '/model_apply_python';
    var MODEL_APPLY_PYTHON_NAME = 'deep_main.py';

    var options = {
        mode: 'text',
        pythonPath: PYTHON_PATH, // 'path/to/python'
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: MODEL_APPLY_PYTHON_CODE_DIR,// 'path/to/my/***.py'
        args: [ imagePath, font_id ] // sending Parameter
    };

    return new Promise(function(resolve, reject){
        // results - font path into local storage
        ps.PythonShell.run(MODEL_APPLY_PYTHON_NAME, options, function (err, results) {
            if (err) reject(err);
            resolve(results);
            // [ 'C:/Users/Desktop/.../10/sample1.ttf', ]
        });
    });
}

function uploadFontFiles(fontFilePaths) {

    var FILE_UPLOAD_API_URL = 'http://file-api.seolgi.com/api/files/multiple/upload';
    var file_stream = [];

    var formData = {
        files: [],
    };
    fontFilePaths.forEach(function(fontFilePath){
        console.log("<< fontFilePath >> ", fontFilePath);
        formData.files.push(fs.createReadStream(fontFilePath))
    });
    return new Promise(function(resolve, reject){

        request.post({url: FILE_UPLOAD_API_URL, formData: formData}, function (err, resp, body) {
            if (err) {
                reject(err)
            } else {
                var font_paths = []
                console.log('URL: ' + body);
                JSON.parse(body).map(filePath => { font_paths.push(filePath.host + filePath.downloadPath)});
                // [
                //     {
                //         "host":"http://file.son-mat.com",
                //         "uploadName":"92a452e5-c2ac-43be-a5ef-06667e254e05.png",
                //         "originalName":"sample.png",
                //         "downloadPath":"/file/4202/92a452e5-c2ac-43be-a5ef-06667e254e05.png"
                //     },{
                //         "host":"http://file.son-mat.com",
                //         "uploadName":"2dcb010b-01c7-4e11-a703-99a1bb0753af.png",
                //         "originalName":"sample.png",
                //         "downloadPath":"/file/879/2dcb010b-01c7-4e11-a703-99a1bb0753af.png"
                //     }
                // ]
                resolve(font_paths)
            }
        });
    });
}

function sendCompleteMessage(font_id, fontUrls, user_phone_number){

    var FONT_MAKE_COMPELETE_API_URL = 'http://45.119.145.130:9000/api/font/make/complete'

    var formData = {
        fontUrls : fontUrls,
        font_id : font_id,
        phone : user_phone_number
    }
    
    return new Promise(function(resolve, reject){

        // fontFilePaths.forEach(function(fontFilePath) {
        request.post({ url: FONT_MAKE_COMPELETE_API_URL, formData: formData },  function (err, resp, body) {
            if (err) {
                reject(err)
            } else {
                console.log('Result: ' + body);
                resolve(body)
            }
        });
    });
}

var func = {}
func.startToMakingFont = startToMakingFont;
func.download_example = download_example;
func.python_example = python_example;
func.upload_WS_example = upload_WS_example;
func.upload_WAS_example = upload_WAS_example;

module.exports = func;