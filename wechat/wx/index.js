'use strict'

var path = require('path')
var util = require('../libs/util')
var Wechat = require('../wechat/wechat')
var wechat_file = path.join(__dirname,'../config/wechat.txt')
var wechat_ticket_file = path.join(__dirname,'../config/wechat_ticket.txt')
var config = {
	wechat:{
  	appID : 'wx7bc382214be971a3',
  	appSecret:'8dda5de41f7959c5fc1541600df6d9f2',
  	token: 'nihao',//与网页上的一致即可
    getAccessToken:function(){
      return util.readFileAsync(wechat_file)
    },
    saveAccessToken:function(data){
      data =JSON.stringify(data)
      return util.writeFileAsync(wechat_file,data)
    },
    getTicket:function(){
      return util.readFileAsync(wechat_ticket_file)
    },
    saveTicket:function(data){
      data =JSON.stringify(data)
      return util.writeFileAsync(wechat_ticket_file,data)
    }
	}
}
exports.wechatOptions = config
exports.getWechat = function(){
  var wechatApi = new Wechat(config.wechat)
  return wechatApi
}