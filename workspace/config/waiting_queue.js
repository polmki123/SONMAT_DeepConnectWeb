'use strict';

var waiting_Queue = function () {
    this._$constructor();
}


waiting_Queue.prototype =  {

    _$constructor: function() {
        this.waiting_queue = []
    },

    push : function(font_id, imagePath, font_phone) {
        this.waiting_queue.push({
            font_id: font_id,
            imagePath: imagePath, 
            font_phone: font_phone,
        })
    },

    pop : function(font_id) {
        var index = -1;
        var request = {};
        this.waiting_queue.forEach(function(font_request, i){
            if(font_request.font_id == font_id){
                index = i
                request = font_request
            }
        })
        if(index != -1){
            this.waiting_queue.splice(index, 1);
            return request;
        }else{
            return null;
        }
    },

    pop_last: function() {
        var request = this.waiting_queue[0];
        this.waiting_queue.splice(0, 1);
        return request;
    },

    getCount : function() {
        return this.waiting_queue.length
    },

};

module.exports = new waiting_Queue();


// var dataset = {
//  a: 10,
// }


// module.exports = dataset