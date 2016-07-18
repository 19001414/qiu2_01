'use strict'
/*入口文件*/
var Koa = require('koa')
var path = require('path')
var wechat = require('./wechat/g')
var util = require('./libs/util')
//var wechat_file = path.join(__dirname,'./config/wechat.txt')
var config = require('./config')
var reply = require('./wx/reply')
var Wechat = require('./wechat/wechat')
 
var app = new Koa()

var ejs = require('ejs')
var heredoc = require('heredoc')
//var zepto = require('zepto')
var crypto = require('crypto')

var tpl = heredoc(function(){/*
	<!DOCTYPE html>
	<html>
		<head>
			<title>搜电影</title>
			<meta name="viewport" content="initial-scale=1,maximum-scale=1,minimum-scale=1"/>
		</head>
		<body>
			<h1>点击标记开始录音</h1>
			<p id="title"></p>
			<p id="director"></p>
			<p id="year"></p>
			<div id="poster"></div>
			<script src="http://zeptojs.com/zepto-docs.min.js"></script>
			<script src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>
			<script>
				wx.config({
				    debug: false, 
				    appId: 'wx7bc382214be971a3' ,
				    timestamp: '<%= timestamp %>' , 
				    nonceStr:  '<%= noncestr %>' , 
				    signature: '<%= signature %>' ,
					jsApiList: [
						'onMenuShareTimeline',
						'onMenuShareAppMessage',
						'onMenuShareQQ',
						'onMenuShareWeibo',
						'onMenuShareQZone',
						'startRecord',
						'stopRecord',
						'onVoiceRecordEnd',
						'translateVoice'
				    ] 
				})
				wx.ready(function(){
					wx.checkJsApi({
						    jsApiList: ['onVoiceRecordEnd'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
						    success: function(res) {
						        // 以键值对的形式返回，可用的api值true，不可用为false
						        // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
						        console.log(res)
						    }
						})
						var shareContent = {
						    title: '猜猜我是谁', // 分享标题
						    desc: '这不是一个什么好东西', // 分享描述
						    link: 'http://wwww.tmooc.cn', // 分享链接
						    imgUrl: 'http://coding.imooc.com/static/module/common/img/logo.png?t=1', // 分享图标
						    type: 'link', // 分享类型,music、video或link，不填默认为link
						    dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
						    success: function () { 
						       alert('分享成功')
						    },
						    cancel: function () { 
						        alert('分享失败')
						    }
						}

						wx.onMenuShareAppMessage(shareContent)
						var sliders
						var isRecording = false
						
						$('#poster').on('tap',function(){
							wx.previewImage(sliders)
						})

						$('h1').on('tap',function(){
							if(!isRecording){
								isRecording = true
								wx.startRecord({
									cancel:function(){
										window.alert('那就不能使用搜索了')
									}
								})
								return 
							}
							isRecording = false
							wx.stopRecord({
							    success: function (res) {
							        var localId = res.localId
							        wx.translateVoice({
									   localId: localId, // 需要识别的音频的本地Id，由录音相关接口获得
									    isShowProgressTips: 1, // 默认为1，显示进度提示
									    success: function (res) {
									        var result = res.translateResult

									        $.ajax({
												type:'get',
												url:'https://api.douban.com/v2/movie/search?q=' + result,
												dataType:'jsonp',
												jsonp:'callback',
												success:function(data){
													var subject = data.subjects[0]
													$('#title').html(subject.title)
													$('#year').html(subject.year)
													$('#director').html(subject.directors[0].name)
													$('#poster').html('<img src="'+ subject.images.large+'"/>')
													var shareContent = {
													    title: subject.title, // 分享标题
													    desc: '我搜出来了' +subject.title , // 分享描述
													    link: 'http://wwww.tmooc.cn', // 分享链接
													    imgUrl: subject.images.large, // 分享图标
													    type: 'link', // 分享类型,music、video或link，不填默认为link
													    dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
													    success: function () { 
													       alert('分享成功')
													    },
													    cancel: function () { 
													        alert('分享失败')
													    }
													}
													
													sliders = {
														current : subject.images.large,
														urls : [subject.images.large]
													}
													
													data.subjects.forEach(function(item){
														sliders.urls.push(item.images.large)
													})

													wx.onMenuShareAppMessage(shareContent)
												}
									        })
									    }
									})
							    }
							})
						})
					})
			</script>
		</body>
	</html>
*/})

//随机创建一个字符串~~
var createNonce = function(){
	return Math.random().toString(36).substr(2,15)
}
//创建一个当时时间的字符串
var createTimestamp = function(){
	return parseInt(new Date().getTime()/1000,10) + ''
}


function sign(ticket,url){
	var noncestr = createNonce()
	var timestamp = createTimestamp()
	var signature = _sign(noncestr,ticket,timestamp,url)
	console.log(timestamp)
	return {
		noncestr:noncestr,
		timestamp:timestamp,
		signature:signature
	}
}

var _sign = function(noncestr,ticket,timestamp,url){
	var parmas = [
		'noncestr='+ noncestr,
		'jsapi_ticket=' + ticket,
		'timestamp=' + timestamp,
		'url='+ url
	]
	console.log(timestamp)
	var str = parmas.sort().join('&')
	var shasum = crypto.createHash('sha1')

	shasum.update(str)
	return shasum.digest('hex')
}



app.use(function *(next) {
	if(this.url.indexOf('/movie') > -1){
		var wechatApi = new Wechat(config.wechat)
		var data = yield wechatApi.fetchAccessToken()
		var access_token = data.access_token
		var ticketData = yield wechatApi.fetchTicket(access_token)
		var ticket = ticketData.ticket
		var url = this.href.replace(':8000','')
		var parmas = sign(ticket,url)
		this.body = ejs.render(tpl,parmas)

		return next
	}

	yield next
})
  
  app.use(wechat(config.wechat,reply.reply))

  app.listen(3000)
  console.log('Listening:3000')
