var fs = require('fs');
var svg2ttf = require('svg2ttf');
var svgicons2svgfont = require('svgicons2svgfont');

function convert_svg_to_ttf(){
  var fontStream = new svgicons2svgfont({
    fontName: 'myfont'
  });
  var ImageTracer = require('./javascripts/imagetracer_v1.2.1');
  var PNG = require('pngjs').PNG;

  var files;
  files = fs.readdirSync(__dirname + './save_image/');
  var sources=[];
  var fileName=[];


  for(var i=0; i<files.length; i++) {
        sources[i] = '0x' + files[i].substring(0,4);
        fileName[i] = files[i].substring(0,4);
  }
  for(var i=0; i<files.length; i++) {
      let j = i;
      var data = fs.readFileSync(__dirname + './save_image/'+files[i]);
      var png = PNG.sync.read(data);
      var myImageData = {width:64, height:64, data:png.data};

      let svgstring = ImageTracer.imagedataToSVG( myImageData);
      fs.writeFileSync(__dirname + './svg/' + fileName[i] + '.svg', svgstring); 
      
  }
  console.log('error');
  fontStream.pipe(fs.createWriteStream( __dirname+ './svg_fonts/font_ss.svg'))
    .on('finish',function() {
      var ttf = svg2ttf(fs.readFileSync(__dirname+ './svg_fonts/font_ss.svg', 'utf8'), {});
      fs.writeFileSync(__dirname + './ttf_fonts/myfont.ttf', new Buffer(ttf.buffer));
    })
    .on('error',function(err) {
      console.log(err);
    });

  console.log('error');
  for (var i=0; i < sources.length; i++) {
    // Writing glyphs
    let glyph1 = fs.createReadStream(__dirname+ './svg/' + fileName[i] + '.svg');
    glyph1.metadata = {
      unicode: [String.fromCharCode((sources[i]).toString(10))],
      name: 'glyph' + sources[i]
    };
    fontStream.write(glyph1);
  }
  fontStream.end();
  
  var list = [];

  return 
}
