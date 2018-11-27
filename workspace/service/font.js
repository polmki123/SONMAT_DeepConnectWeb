var fs = require('fs');
var request = require('request');
var path = require('path');
var ps = require('python-shell');

function startToMakingFont(font) {

    // handwrite image download
    downloadInputImage(font.handwrite_image_path, font.id, 'sample.png')
    .then(function(imagePath) {
        console.log(imagePath)
        return runPythonCode(imagePath) // run python code
    }).then(function(fontFilePaths) {
        console.log(fontFilePaths)

    // font files upload

// send make-complete message to SONMAT-WEB
    }).catch(function(err) {
        console.log(err);
    });
//     return runPythonCode(imagePath)
//   // run python code
//   runPythonCode(imagePath)
//   .then(function(fontFilePaths) {

//   // font files upload

// // send make-complete message to SONMAT-WEB
//   })




//   }).then(function(result) {




//   });
}

function startToMakingFont_ex() {

    // handwrite image download
    downloadInputImage('http://file.son-mat.com/file/212/fc72b451-3ca3-4c91-a6f8-84a091e3559c.png', 10, '/sample.png')
    .then(function(imagePath) {
        return runPythonCode(imagePath) // run python code
    }).then(function(fontFilePaths) {
        console.log(fontFilePaths)

        // font files upload
        return uploadFontFiles_to_WAS(fontFilePaths)
    }).then(function(result) {
        console.log(result)

        // send make-complete message to SONMAT-WEB
        // send message to WAS server
        
    }).catch(function(err) {
        console.log(err);
    });
}

function upload_example() {

    // handwrite image download
    uploadFontFiles_to_WAS(['C:\\Users\\hhjung\\Desktop\\workspace\\nodejs\\SONMAT_DeepConnectWeb\\workspace\\repository\\10\\sample.png',
                        'C:\\Users\\hhjung\\Desktop\\workspace\\nodejs\\SONMAT_DeepConnectWeb\\workspace\\repository\\10\\sample.png',])
    .then(function(imagePath) {
        
    }).catch(function(err) {
        console.log(err);
    });
}

function downloadInputImage(filePath, font_id, newFileName) {

    var IMAGE_DOWNLOAD_DIR_PATH = path.join(__dirname, '..', 'repository', ''+font_id);
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


function runPythonCode(imagePath) {

    var options = {
        mode: 'text',
        pythonPath: 'C:/Users/hhjung/python3.6/python3.exe', // 'path/to/python'
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: __dirname, // 'path/to/my/***.py'
        args: [ imagePath ] // sending Parameter
    };

    return new Promise(function(resolve, reject){
        // results - font path into local storage
        ps.PythonShell.run('test.py', options, function (err, results) {
            if (err) reject(err);
            resolve(results);
            // [ 'C:/Users/Desktop/.../10/sample1.ttf', ]
        });
    });
    

}

function uploadFontFile_to_WS(fontFilePath) {

    var FILE_UPLOAD_API_URL = 'http://file-api.seolgi.com/api/files/upload';
    

    return new Promise(function(resolve, reject){

        // fontFilePaths.forEach(function(fontFilePath) {
        var req = request.post(FILE_UPLOAD_API_URL, function (err, resp, body) {
            if (err) {
                reject(err)
            } else {
                console.log('URL: ' + body);
                resolve(body.host + body.downloadPath)
            }
        });

        var form = req.form();
        form.append('file', fs.createReadStream(fontFilePath));

    });
}

function uploadFontFiles_to_WAS(fontFilePaths){
    var fontFileURLs = [];

    // 이걸 어떻게 forEach 문 처럼 하게 할 것인가...

    uploadFontFile_to_WS(fontFilePaths[0])
    .then(function(url){
        fontFileURLs.push(url);
        return uploadFontFile_to_WS(fontFilePaths[1])
    }).then(function(url){
        fontFileURLs.push(url);
        return uploadFontFile_to_WS(fontFilePaths[2])
    }).then(function(url){
        fontFileURLs.push(url);
        return uploadFontFile_to_WS(fontFilePaths[3])
    }).then(function(url){
        fontFileURLs.push(url);
        return new Promise(function(resolve, reject){

            // fontFilePaths.forEach(function(fontFilePath) {
            var req = request.post(/* WAS Server */ '', function (err, resp, body) {
                if (err) {
                    reject(err)
                } else {
                    console.log('URL: ' + body);
                    resolve(body)
                }
            });

            var form = req.form();
            form.append('list', fontFileURLs);

        });
    // 

    }).catch(function(err) {
        console.log(err);
    });


    
    // fontFilePaths.forEach(function(fontFilePath) {

    //     result = uploadFontFile_to_WS(fontFilePath)

    //     var req = request.post(FILE_UPLOAD_API_URL, function (err, resp, body) {
    //         if (err) {
    //             console.log('Error!');
    //         } else {
    //             console.log('URL: ' + body);
    //             fontFileURLs.push(body);
    //         }
    //     });

    //     var form = req.form();
    //     form.append('file', fs.createReadStream(fontFilePath));
    // });
}

var func = {}
func.startToMakingFont = startToMakingFont;
func.startToMakingFont_ex = startToMakingFont_ex;
func.upload_example = upload_example;

module.exports = func;