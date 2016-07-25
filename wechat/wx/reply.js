'use strict'
var path = require('path')
var wx = require('../wx/index')
var Movie = require('../app/api/movie')
var wechatApi = wx.getWechat()

exports.reply = function* (next){
	var message = this.weixin


	if(message.MsgType === 'image'){
		this.body = '哈哈你需要对各种MsgType的单独处理了'
	}
	else if(message.MsgType === 'event'){
		if(message.Event === 'subscribe'){
			
			this.body = '哈哈，你找到我了\n'+
			'回复1-3测试文字回复\n'+
			'回复4，测试图文回复\n'+
			'回复首页，进入电影首页\n'+
			'回复游戏，进入游戏页面\n' +
			'回复电影名字，查询电影信息\n'+
			'回复语音，查询电影信息\n'+
			'也可以点击<a href="http://js7f65gnts.proxy.qqbrowser.cc/movie">语音查电影</a>'
		}
		else if(message.Event === 'unsubscribe'){
			console.log('你敢抛弃本宝宝？')
			this.body = ''
		}
		else if(message.Event === 'LOCATION') {
			this.body = '你他妈在哪里我都知道了哈哈哈哈'+ message.Latitude +'/' +message.Longitude+ '-'+ message.Precision
		}
		else if(message.Event === 'CLICK'){
			this.body = '你点击了菜单' + message.EventKey
		}else if(message.Event === 'SCAN'){
			console.log('关注后扫二维码'+ message.EventKey+ ' '+message.Ticket)
			this.body = '看到你就骚一下嘛'
		}
		else if(message.Event === 'VIEW'){
			this.body = '您点击了菜单中的连接'+message.EventKey
		}
		else if(message.Event === 'scancode_push'){
			console.log(message.ScanCodeInfo.ScanType)
			console.log(message.ScanCodeInfo.ScanResult)
			this.body = '您点击了菜单中'+message.EventKey
		}
		else if(message.Event === 'scancode_waitmsg'){
			console.log(message.ScanCodeInfo.ScanType)
			console.log(message.ScanCodeInfo.ScanResult)
			this.body = '您点击了菜单中'+message.EventKey
		}
		else if(message.Event === 'pic_sysphoto'){
			console.log(message.SendPicsInfo.PicList)
			console.log(message.SendPicsInfo.Count)
			this.body = '您点击了菜单中'+message.EventKey
		}
		else if(message.Event === 'pic_photo_or_album'){
			console.log(message.SendPicsInfo.PicList)
			console.log(message.SendPicsInfo.Count)
			this.body = '您点击了菜单中'+message.EventKey
		}
		else if(message.Event === 'pic_weixin'){
			console.log(message.SendPicsInfo.PicList)
			console.log(message.SendPicsInfo.Count)
			this.body = '您点击了菜单中'+message.EventKey
		}
		else if(message.Event === 'location_select'){
			console.log(message.SendLocationInfo.Location_X)
			console.log(message.SendLocationInfo.Location_Y)
			console.log(message.SendLocationInfo.Scale)
			console.log(message.SendLocationInfo.Label)
			console.log(message.SendLocationInfo.Poiname)
			this.body = '您点击了菜单中'+message.EventKey
		}
	}
	else if(message.MsgType === 'voice'){
		var voiceText = message.Recognition
		var movies = yield Movie.searchByName(voiceText)

			if(!movies || movies.length === 0 ){
				movies = yield Movie.searchByDouBan(voiceText)
			}
			if(movies && movies.length>0){
				reply = []

				movies = movies.slice(0,10)
				movies.forEach(function(movie){
					reply.push({
						title:movie.title,
						description:movie.title,
						picUrl:movie.poster,
						url:'http://js7f65gnts.proxy.qqbrowser.cc/movie/'+ movie._id
					})
				})
			}
			else {
				reply = "没有查询到与"+ content +'匹配的电影'
			}
			this.body = reply
	}
	else if(message.MsgType === 'text'){
		this.body = '这是一个文本类型'
		var content = message.Content
		var reply ='额，你说的'+ message.Content + '太复杂了'

		if(content ==='1'){
			reply = '天下第一吃大米'
		}
		else if(content === '2'){
			reply = '天下第二老大了'
		}
		else if(content === '3'){
			reply = '天下第三老大蠢了'
		}
		else if(content === '4'){
			reply = [{
					title:'技术改变世界',
					description:'只是一个描述而已',
					picUrl:'http://img1.imgtn.bdimg.com/it/u=2016049997,229290512&fm=21&gp=0.jpg'
				},{
					title:'nodejs开发微信',
					description:'好难学',
					picUrl:'http://img0.imgtn.bdimg.com/it/u=3125712074,4190615654&fm=21&gp=0.jpg',
					url:'https://nodejs.org/'
				}]
		}
		else{
			var movies = yield Movie.searchByName(content)

			if(!movies || movies.length === 0 ){
				movies = yield Movie.searchByDouBan(content)
			}
			if(movies && movies.length>0){
				reply = []

				movies = movies.slice(0,10)
				movies.forEach(function(movie){
					reply.push({
						title:movie.title,
						description:movie.title,
						picUrl:movie.poster,
						url:'http://js7f65gnts.proxy.qqbrowser.cc/movie/'+ movie._id
					})
				})
			}
			else {
				reply = "没有查询到与"+ content +'匹配的电影'
			}
		}


		this.body = reply
	}
	
	yield next
}