'use strict';

var Queue = function () {
    this._$constructor();
}


Queue.prototype =  {

    _$constructor: function() {
        this.queue = []
    },

    push : function(request) {
        this.queue.push({
            font_id: request.font_id,
            imagePath: request.imagePath, 
            font_phone: request.font_phone,
        })
    },

    pop : function(font_id) {
        var index = -1;
        var data = {};
        this.queue.forEach(function(font_request, i){
            if(font_request.font_id == font_id){
                index = i
                data = font_request
            }
        })
        if(index != -1){
            this.queue.splice(index, 1);
            return data;
        }else{
            return null;
        }
    },

    getCount : function() {
        return this.queue.length
    },

};

module.exports = new Queue();


// var dataset = {
//  a: 10,
// }


// module.exports = dataset