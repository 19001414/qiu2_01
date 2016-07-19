'use strict'

var wechat = require('../../wechat/g')
var reply = require('../../wx/reply.js')
var wx= require('../../wx/index.js')

exports.hear = function *(next){
	this.middle = wechat(wx.wechatOptions.wechat,reply.reply)

	yield this.middle(next)
}