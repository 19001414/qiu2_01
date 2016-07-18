'use strict'
var path = require('path')
var config = require('../config')
var Wechat = require('../wechat/wechat')
var menu =require('./menu')
var wechatApi = new Wechat(config.wechat)

wechatApi.deteleMenu()
	.then(function(){
		return wechatApi.createMenu(menu)
	})
	.then(function(msg){
	console.log(msg)
	})

exports.reply = function* (next){
	var message = this.weixin


	if(message.MsgType === 'image'){
		this.body = '哈哈你需要对各种MsgType的单独处理了'
	}
	else if(message.MsgType === 'event'){
		if(message.Event === 'subscribe'){
			if(message.EventKey){
				console.log('扫二维码进来'+message.EventKey + '  '+ message)
			}
			this.body = '哈哈，你找到我了'+'消息ID：'+message.MsgId
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
			reply = [
				{
					title:'技术改变世界',
					description:'只是一个描述而已',
					picUrl:'http://img1.imgtn.bdimg.com/it/u=2016049997,229290512&fm=21&gp=0.jpg'
				},
				{
					title:'nodejs开发微信',
					description:'好难学',
					picUrl:'http://img0.imgtn.bdimg.com/it/u=3125712074,4190615654&fm=21&gp=0.jpg',
					url:'https://nodejs.org/'
				}
			]
		}
		else if(content === '5'){
			var data = yield wechatApi.uploadMaterial('image',path.join(__dirname,'../2.jpg'))
			reply = {
				type:'image',
				mediaId:data.media_id
			}
			console.log(reply)
		}
		else if(content === '6'){
			var data = yield wechatApi.uploadMaterial('video',path.join(__dirname,'../6.mp4'))
			reply = {
				type:'video',
				title:'回复视频',
				description:'看个奶子',
				mediaId:data.media_id
			}
			console.log(reply)
		}
		else if(content === '7'){
			var data = yield wechatApi.uploadMaterial('image',path.join(__dirname,'../2.jpg'))
			reply = {
				type:'music',
				title:'回复音乐',
				description:'看海哭的声音',
				musicUrl:'http://bd.kuwo.cn/yinyue/512846?from=baidu',
				thumbMediaId:data.media_id
			}
			console.log(reply)
		}
		else if(content === '8'){
			var data = yield wechatApi.uploadMaterial('image',path.join(__dirname,'../2.jpg'),{type:'image'})
			reply = {
				type:'image',
				mediaId:data.media_id
			}
			console.log(reply)
		}
		else if(content === '9'){
			var data = yield wechatApi.uploadMaterial('video',path.join(__dirname,'../6.mp4'),{type:'video',description:'{"title:"nimahai","introduction":"Never give up"}'})
			console.log(data)
			reply = {
				type:'video',
				title:'回复内容吓死你',
				description:'并不好看',
				mediaId:data.media_id
			}
			console.log(reply)
		}
		else if(content === '10'){
			var picData = yield wechatApi.uploadMaterial('image',path.join(__dirname,'../2.jpg'),{})
			//console.log(picData)
			var media = {
				articles: [{
					title:'tututu1',
					thumb_media_id:picData.media_id,
					author:'qiuer',
					digest:"meiyou",
					show_cover_pic:1,
					content:'nocontent',
					content_source_url:'https://github.com'
				},{
					title:'tututu2',
					thumb_media_id:picData.media_id,
					author:'qiuer',
					digest:"meiyou",
					show_cover_pic:1,
					content:'nocontent',
					content_source_url:'https://github.com'
				}
				]
			}
			data = yield wechatApi.uploadMaterial('news',media,{})
			data = yield wechatApi.fetchMaterial(data.media_id,'news',{})

			console.log(data)

			var items = data.news_item
			var news = []

			items.forEach(function(item){
				news.push({
					title:item.title,
					description:item.digest,
					picUrl:picData.url,
					url:item.url
				})
			})
			reply = news
		}
		else if(content === '11'){
			var counts = yield wechatApi.countMaterial()
			var results = yield [
				wechatApi.batchMaterial({
				type:'image',
				offset:0,
				count:10
			}),wechatApi.batchMaterial({
				type:'video',
				offset:0,
				count:10
			}),wechatApi.batchMaterial({
				type:'voice',
				offset:0,
				count:10
			}),wechatApi.batchMaterial({
				type:'news',
				offset:0,
				count:10
			})
			]
			console.log(JSON.stringify(results))
			reply = '1'
		}
		else if(content === '12'){
			var group = yield wechatApi.createGroup('wechat')
			console.log('新分组 wechat')
			console.log(group)
			var group1 = yield wechatApi.fetchGroup()
			console.log('查询分组')
			console.log(group1)
			var group3 = yield wechatApi.checkGroup(message.FromUserName)
			console.log('查看自己的分组')
			console.log(group3)
			var group4 = yield wechatApi.moveGroup(message.FromUserName,106)
			console.log('移动到106')
			console.log(group4)
			var group5 = yield wechatApi.fetchGroup()
			console.log('移动后的列表')
			console.log(group5)
			//var group5 = yield wechatApi.delGroup(104)
			//console.log('删除了104分组。。')
			//console.log(group5)
			reply = 'group done'
		}
		else if(content === '13'){
			var user = yield wechatApi.fetchUser(message.FromUserName)
			console.log('user')
			var openIds = [
				{
					openid:message.FromUserName,
					lang:'en'
				}
			]
			var users = yield wechatApi.fetchUser(openIds)
			console.log(users)
			reply = JSON.stringify(user)

		}
		else if(content === '14'){
			var listUser = yield wechatApi.listUser()
			console.log(listUser)
			reply = listUser.total
		}
		else if(content === '15'){
			if(message.MsgType ==='event'){
				this.body ="success"
			}
			//console.log(content + 'reply.js')
			// var text = {
			// 	'content':'hello world'
			// }
			// var msgData = yield wechatApi.PreviewMass('text',text, 'oOKrustmAzH62exmP42Obr1bjGJk')
			var mpnews = {
				media_id : '2OxC-sZF2A7YjwMZ0OTrWXjfTE9ZUt_aTIyUqP9T-uI'//这个要依靠上面的回复内容获得ID值
			}
			var msgData = yield wechatApi.sendByMass('mpnews',mpnews,'2OxC-sZF2A7YjwMZ0OTrWXjfTE9ZUt_aTIyUqP9T-uI')//这里的105是分组ID，也需要上面查询到
			console.log(msgData)
			reply = 'Yeah~!'
		}
		else if(content === '16'){
			// var text = {
			// 	'content':'hello world'
			// }
			// var msgData = yield wechatApi.PreviewMass('text',text, 'oOKrustmAzH62exmP42Obr1bjGJk')
			var mpnews = {
				media_id : '2OxC-sZF2A7YjwMZ0OTrWXjfTE9ZUt_aTIyUqP9T-uI'//这个要依靠上面的回复内容获得ID值
			}
			var msgData = yield wechatApi.sendByMass('mpnews',mpnews,'2OxC-sZF2A7YjwMZ0OTrWXjfTE9ZUt_aTIyUqP9T-uI')//这里的105是分组ID，也需要上面查询到
			console.log(msgData)
			reply = '这是回复16'
		}
		else if(content === '17'){
			var msgData = yield wechatApi.checkByMass('')//里面传ID
			console.log(msgData)
			reply = '这是回复17'
		}
		// else if(content === '18'){
		// 	var tempQr = {
		// 		expire_seconds:604800,
		// 		action_name:'QR_SCENE',
		// 		action_info:{
		// 			scene:{
		// 				scene_id:123
		// 			}
		// 		}
		// 	}
		// 	var permQr = {
		// 		action_name:'QR_LIMIT_SCENE',
		// 		action_info:{
		// 			scene:{
		// 				scene_str:123
		// 			}
		// 		}
		// 	}
		// 	var permStrQr = {
		// 		action_name:'QR_LIMIT_STR_SCENE',
		// 		action_info:{
		// 			scene:{
		// 				scene_str:'abc'
		// 			}
		// 		}
		// 	}

		// 	var qr1 = yield wechatApi.createQrcode(tempQr)
		// 	var qr2 = yield wechatApi.createQrcode(permQr)
		// 	var qr3 = yield wechatApi.createQrcode(permStrQr)

		// 	reply = '创建二维码成功'
		// }
		// else if(content === '19'){
		// 	var longUrl = 'http://imooc.com/'
		// 	var shortData = yield wechatApi.createShortUrl(null,longUrl)
		// 	reply = shortData.short_url
		// }
		// else if(content === '20'){
		// 	var semanticData = {
		// 		query:'查一下明天从北京到上海的南航机票',
		// 		city:'北京',
		// 		category: 'flight,hotel',
		// 		uid:message.FromUserName
		// 	}
		// 	var _semanticData = yield wechatApi.semantic(semanticData)
		// 	reply = JSON.stringify(_semanticData)
		// }


		this.body = reply
	}
	
	yield next
}