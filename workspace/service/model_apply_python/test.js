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

    var image_set_count = 3;
    var ttf_file_paths = [];

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
            var ttf = svg2ttf(fs.readFileSync(SVG_COMBINE_FILE_PATH, 'utf8'), {});

            // open TTF file stream
            fs.writeFileSync(TTF_FILE_PATH, new Buffer(ttf.buffer));
        })
        .on('error',function(err) {
            console.log(err);
        });

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
    
    return TTF_FILE_PATH;
}

var func = {}
func.convert_svg_to_ttf = convert_svg_to_ttf;

module.exports = func;