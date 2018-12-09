var fs = require('fs');
var svg2ttf = require('svg2ttf');
var svgicons2svgfont = require('svgicons2svgfont');
var ImageTracer = require('./javascripts/imagetracer_v1.2.1');
var PNG = require('pngjs').PNG;
var path = require('path');

var REPOSITORY_PATH = '/home/deep_user/repository';

function get_dir(dir_path_list) {

    var dir = path.join(dir_path_list[0]);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    dir_path_list.forEach(function(dir_path, index) {

        if (index == 0) return;

        dir = path.join(dir, dir_path + '');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    return dir;
}

function convert_svg_to_ttf(font_id, image_set_index) {

    return new Promise(function(resolve, reject){

        convert_pngs_to_svgs(font_id, image_set_index)
            .then(function(result) {

                SVG_COMBINE_FILE_PATH= result.SVG_COMBINE_FILE_PATH;
                TTF_FILE_PATH = result.TTF_FILE_PATH;
                SVG_IMAGES_DIR= result.SVG_IMAGES_DIR;
                sources = result.sources;
                filename = result.fileName;
                fontStream= result.fontStream;

                var ttf = svg2ttf(fs.readFileSync(SVG_COMBINE_FILE_PATH, 'utf8'), {});

                console.log("font stream write start");
                // open TTF file stream
                fs.writeFileSync(TTF_FILE_PATH, new Buffer(ttf.buffer));

                // wrtie TTF file
                for (var i=0; i < sources.length; i++) {
                    // Writing glyphs
                    let glyph1 = fs.createReadStream(SVG_IMAGES_DIR + '/' + fileName[i] + '.svg');
                    glyph1.metadata = {
                        unicode: [String.fromCharCode((sources[i]).toString(10))],
                        name: 'glyph' + sources[i]
                    };
                    fontStream.write(glyph1);
                }
                fontStream.end();

                console.log("font stream end");
                resolve(TTF_FILE_PATH);

            }).catch(function(err) {
            console.log(err);
        });
    });
}

function convert_pngs_to_svgs(font_id, image_set_index) {

    return new Promise(function(resolve, reject){

        var PNG_IMAGES_DIR = get_dir([REPOSITORY_PATH, font_id, 'save_image', image_set_index]);
        console.log("PNG_IMAGES_DIR ", PNG_IMAGES_DIR);

        var fontStream = new svgicons2svgfont({
            fontName: 'myfont'
        });

        var files = fs.readdirSync(PNG_IMAGES_DIR);
        var sources=[];
        var fileName=[];

        for(var i=0; i<files.length; i++) {
            sources[i] = '0x' + files[i].substring(0,4);
            fileName[i] = files[i].substring(0,4);
        }

        // PNG to SVG
        var SVG_IMAGES_DIR = get_dir([REPOSITORY_PATH, font_id, 'svg', image_set_index]);
        console.log("SVG_IMAGES_DIR ", SVG_IMAGES_DIR);

        for(var i=0; i<files.length; i++) {

            var data = fs.readFileSync(PNG_IMAGES_DIR + '/' + files[i]);
            var png = PNG.sync.read(data);
            var myImageData = {width:64, height:64, data:png.data};

            let svgstring = ImageTracer.imagedataToSVG( myImageData);
            fs.writeFileSync(SVG_IMAGES_DIR + '/' + fileName[i] + '.svg', svgstring);
        }


        // SVG to combine SVG
        var SVG_COMBINE_DIR = get_dir([REPOSITORY_PATH, font_id, 'svg_fonts']);

        var TTF_FILE_DIR = get_dir([REPOSITORY_PATH, font_id, 'ttf_fonts', image_set_index]);

        var SVG_COMBINE_FILE_PATH = path.join(SVG_COMBINE_DIR, image_set_index + '.svg');
        var TTF_FILE_PATH = path.join(TTF_FILE_DIR, 'myfont.ttf');

        console.log("SVG_COMBINE_FILE_PATH ", SVG_COMBINE_FILE_PATH);
        console.log("TTF_FILE_PATH ", TTF_FILE_PATH);

        fontStream.pipe(fs.createWriteStream(SVG_COMBINE_FILE_PATH))
            .on('finish',function() {

                console.log("font created successful!");

                var result = {};
                result.SVG_COMBINE_FILE_PATH = SVG_COMBINE_FILE_PATH;
                result.TTF_FILE_PATH = TTF_FILE_PATH;
                result.SVG_IMAGES_DIR= SVG_IMAGES_DIR;
                result.sources = sources;
                result.filename = fileName;
                result.fontStream= fontStream;

                resolve(result);
            })
            .on('error',function(err) {
                reject(err);
            });
    });
}

var func = {}
func.convert_svg_to_ttf = convert_svg_to_ttf;

module.exports = func;