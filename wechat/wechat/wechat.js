'use strict'

var Promise = require('bluebird')
var _ = require('lodash')
 var request = Promise.promisify(require('request'))
 var util = require('./util')
 var fs = require('fs')
 var prefix = 'https://api.weixin.qq.com/cgi-bin/'
 var mpPrefix = 'https://mp.weixin.qq.com/cgi-bin/'
 var semanticUrl = 'https://api.weixin.qq.com/semantic/semproxy/search?'
 var api = {
    semanticUrl:semanticUrl,
    accessToken :prefix + 'token?grant_type=client_credential',
    temporary:{
      upload: prefix+ 'media/upload?',
      fetch:prefix + 'media/get?'
    },
    permanent:{
      //upload: prefix+ 'material/add_material?',
      //uploadNews:prefix+ 'material/add_news?',
      //uploadNewsPic:prefix+ 'media/uploadimg?'
      upload: prefix + 'material/add_material?',
      uploadNews: prefix + 'material/add_news?',
      uploadNewsPic: prefix + 'media/uploadimg?',
      fetch:prefix + 'material/get_material?',
      del:prefix + 'material/del_material?',
      update:prefix + 'material/update_news?',
      count:prefix + 'material/get_materialcount?',
      batch: prefix + 'material/batchget_material?'
    },
    group:{
      create : prefix + 'groups/create?',
      fetch: prefix + 'groups/get?',
      check: prefix + 'groups/getid?',
      update :  prefix + 'groups/update?',
      move : prefix + 'groups/members/update?',
      batchMove : prefix + 'groups/members/batchupdate?',
      detele : prefix + 'groups/delete?',

    },
    users:{
      remark: prefix + 'user/info/updateremark?',
      fetch: prefix + 'user/info?',
      batchFetch: prefix + 'user/info/batchget?',
      list: prefix + 'user/get?'
    },
    mass:{
      group: prefix + 'message/mass/sendall?',
      openid: prefix + 'message/mass/send?',
      del : prefix +'message/mass/delete?',
      preview : prefix + 'message/mass/preview?',
      check : prefix + 'message/mass/get?'
    },
    menu:{
      create: prefix + 'menu/create?',
      check: prefix + 'menu/get?',
      del: prefix + 'menu/delete?',
      current: prefix +'get_current_selfmenu_info?'
    },
    qrcode:{
      create:prefix + 'qrcode/create?',
      show : mpPrefix + 'showqrcode?'
    },
    shortUrl: {
      create: prefix + 'shorturl?'
    },
    ticket: {
      get : prefix + 'ticket/getticket?'
    }
 }
function Wechat(opts){
  var that = this
  this.appID = opts.appID
  this.appSecret = opts.appSecret
  this.getAccessToken = opts.getAccessToken
  this.saveAccessToken = opts.saveAccessToken
  this.getTicket = opts.getTicket
  this.saveTicket = opts.saveTicket
 
  this.fetchAccessToken()
}

Wechat.prototype.fetchAccessToken = function(data){
  var that =this
    // if(this.access_token && this.expires_in){
    //   if(this.isValidAccessToken(this)){
    //     return Promise.resolve(this)
    //   }
    // }
     return this.getAccessToken()
      .then(function(data){
        try{
          data = JSON.parse(data)
        }
        catch(e){
          return that.updateAccessToken(data)
        }
        if(that.isValidAccessToken(data)){
           return Promise.resolve(data)
        }
        else{
          return that.updateAccessToken(data)
        }
      })
      .then(function(data){
        that.saveAccessToken(data)
        return Promise.resolve(data)
      })
  }


  Wechat.prototype.fetchTicket = function(access_token){
  var that =this
     return this.getTicket()
      .then(function(data){
        try{
          data = JSON.parse(data)
        }
        catch(e){
          return that.updateTicket(access_token)
        }
        if(that.isValidTicket(data)){
           return Promise.resolve(data)
        }
        else{
          console.log(access_token)
          return that.updateTicket(access_token)
        }
      })
      .then(function(data){
        that.saveTicket(data)
        return Promise.resolve(data)
      })
  }



Wechat.prototype.isValidAccessToken = function(data){
    if(!data||!data.access_token ||!data.expires_in){
      return false
    }
    var access_token = data.access_token
    var expires_in = data.expires_in
    var now = (new Date().getTime())

    if (now < expires_in) {
      return true
    }
    else{
      return false
    }
}


Wechat.prototype.isValidTicket = function(data){
    if(!data||!data.ticket ||!data.expires_in){
      return false
    }
    var ticket = data.access_token
    var expires_in = data.expires_in
    var now = (new Date().getTime())

    if ( ticket &&now < expires_in) {
      return true
    }
    else{
      return false
    }
}




Wechat.prototype.updateAccessToken = function(){
   var appID = this.appID
   var appSecret = this.appSecret
   var url = api.accessToken + '&appid='+appID+'&secret='+appSecret
   return new Promise(function(resolve,reject){
      request({url:url,json:true}).then(function(response){
      var data = response.body
      var now = (new Date().getTime())
      var expires_in = now + (data.expires_in -20)*1000
      data.expires_in = expires_in

      resolve(data)
     })
   })
   
}


Wechat.prototype.updateTicket = function(access_token){
   var url = api.ticket.get + '&access_token='+access_token+'&type=jsapi'
   return new Promise(function(resolve,reject){
      request({url:url,json:true}).then(function(response){
      var data = response.body
      var now = (new Date().getTime())
      var expires_in = now + (data.expires_in -20)*1000
      data.expires_in = expires_in

      resolve(data)
     })
   })
   
}


Wechat.prototype.uploadMaterial = function(type,material,permanent){
  var that = this
  var form ={}
  var uploadUrl = api.temporary.upload
  if(permanent){
    uploadUrl = api.permanent.upload
    _.extend(form,permanent)
  }
  if(type ==='pic'){
    uploadUrl = api.permanent.uploadNewsPic
  }
  if(type ==='news'){
    uploadUrl = api.permanent.uploadNews
    form = material
  }
  else{
    form.media = fs.createReadStream(material)
  }
   return new Promise(function(resolve,reject){
      that.fetchAccessToken()
        .then(function(data){
          var url = uploadUrl + 'access_token=' + data.access_token
          if(!permanent){
            url += '&type=' + type
          }
          else{
            form.access_token =data.access_token
          }
          var options = {
            method:'POST',
            url:url,
            json:true
          } 
          if(type === 'news'){
            options.body = form
          }
          else{
            options.formData = form
          }
        request(options).then(function(response){
            var _data = response.body
            console.log(_data)
            if(_data){
              resolve(_data)
            }
            else{
              throw new Error('Upload material fails')
            }
           })
            .catch(function(err){
              reject(err)
            })
         })
        })     
}

Wechat.prototype.fetchMaterial = function(mediaId,type,permanent){
  var that =this
  var fetchUrl = api.temporary.fetch
  if(permanent){
    fetchUrl = api.permanent.fetch
    }
    return new Promise(function(resolve,reject){
      that.fetchAccessToken()
        .then(function(data){
          var url = fetchUrl + 'access_token=' + data.access_token
          var options = {method:'POST',url:url,json:true}
          var form={}
          if(permanent){
              form.media_id=mediaId
              form.access_token=data.access_token
              options.body = form
          }else{
            if(type === 'video'){
              url = url.replace('https://','http://')
            }
            url += '&media_id='+ mediaId
          }

          if(type ==='news' || type === 'video'){
              request(options).then(function(response){
                var _data = response.body
                if(_data){
                  resolve(_data)
                }
                else{
                  throw new Error('Fetch material fails')
                }
            })
            .catch(function(err){
              reject(err)
            })
          }else{
            resolve(url)
          }         
        })
    })
  }

Wechat.prototype.deleteMaterial = function(mediaId){
  var that=this
  var form={
    media_id:mediaId
  }

  return new Promise(function(resolve,reject){
      that.fetchAccessToken()
        .then(function(data){
          var url = api.permanent.del + 'access_token=' + data.access_token + '&media_id=' + mediaId
          
          request({method:'POST',url:url,body:form,json:true}).then(function(response){
              var _data = response.body

              if(_data){
                resolve(_data)
              }
              else{
                throw new Error('Del material fails')
              }
          })
          .catch(function(err){
            reject(err)
          })
        })
    })
}


Wechat.prototype.updateMaterial = function(mediaId,news){
  var that=this
  var form={
    media_id:mediaId
  }

  _.extend(form,news)

  return new Promise(function(resolve,reject){
      that.fetchAccessToken()
        .then(function(data){
          var url = api.permanent.update + 'access_token=' + data.access_token + '&media_id=' + mediaId
          
          request({method:'POST',url:url,body:form,json:true}).then(function(response){
              var _data = response.body

              if(_data){
                resolve(_data)
              }
              else{
                throw new Error('update material fails')
              }
          })
          .catch(function(err){
            reject(err)
          })
        })
    })
}



Wechat.prototype.countMaterial = function(){
  var that=this

  return new Promise(function(resolve,reject){
      that.fetchAccessToken()
        .then(function(data){
          var url = api.permanent.count + 'access_token=' + data.access_token
          
          request({method:'GET',url:url,json:true}).then(function(response){
              var _data = response.body

              if(_data){
                resolve(_data)
              }
              else{
                throw new Error('update material fails')
              }
          })
          .catch(function(err){
            reject(err)
          })
        })
    })
}



Wechat.prototype.batchMaterial = function(options){
  var that=this

  options.type = options.type || 'image'
  options.offset = options.offset || 0
  options.count = options.count || 1

  return new Promise(function(resolve,reject){
      that.fetchAccessToken()
        .then(function(data){
          var url = api.permanent.batch + 'access_token=' + data.access_token
          
          request({method:'POST',url:url,body:options,json:true}).then(function(response){
              var _data = response.body

              if(_data){
                resolve(_data)
              }
              else{
                throw new Error('update material fails')
              }
          })
          .catch(function(err){
            reject(err)
          })
        })
    })
}


Wechat.prototype.createGroup = function(name){
  var that=this

  return new Promise(function(resolve,reject){
      that.fetchAccessToken()
        .then(function(data){
          var url = api.group.create + 'access_token=' + data.access_token

          var form = {
            group:{
              name:name
            }
          }
          
          request({method:'POST',url:url,body:form,json:true}).then(function(response){
              var _data = response.body

              if(_data){
                resolve(_data)
              }
              else{
                throw new Error('createGroup  fails')
              }
          })
          .catch(function(err){
            reject(err)
          })
        })
    })
}



Wechat.prototype.fetchGroup = function(){
  var that=this

  return new Promise(function(resolve,reject){
      that.fetchAccessToken()
        .then(function(data){
          var url = api.group.fetch + 'access_token=' + data.access_token

          request({url:url,json:true}).then(function(response){
              var _data = response.body

              if(_data){
                resolve(_data)
              }
              else{
                throw new Error('fetchGroup  fails')
              }
          })
          .catch(function(err){
            reject(err)
          })
        })
    })
}



Wechat.prototype.checkGroup = function(openid){
  var that=this

  return new Promise(function(resolve,reject){
      that.fetchAccessToken()
        .then(function(data){
          var url = api.group.check + 'access_token=' + data.access_token

          var form = {
            openid:openid
          }

          request({method:'POST',url:url,body:form,json:true}).then(function(response){
              var _data = response.body

              if(_data){
                resolve(_data)
              }
              else{
                throw new Error('fetchGroup  fails')
              }
          })
          .catch(function(err){
            reject(err)
          })
        })
    })
}




Wechat.prototype.updateGroup = function(id,name){
  var that=this

  return new Promise(function(resolve,reject){
      that.fetchAccessToken()
        .then(function(data){
          var url = api.group.update + 'access_token=' + data.access_token

          var form = {
            id:id,
            name:name 
          }

          request({method:'POST',url:url,body:form,json:true}).then(function(response){
              var _data = response.body

              if(_data){
                resolve(_data)
              }
              else{
                throw new Error('updateGroup  fails')
              }
          })
          .catch(function(err){
            reject(err)
          })
        })
    })
}



/*Wechat.prototype.moveGroup = function(openid ,to_groupid){
  var that=this

  return new Promise(function(resolve,reject){
      that.fetchAccessToken()
        .then(function(data){
          var url = api.group.move + 'access_token=' + data.access_token

          var form = {
            openid :openid ,
            to_groupid:to_groupid 
          }

          request({method:'POST',url:url,body:form,json:true}).then(function(response){
              var _data = response.body

              if(_data){
                resolve(_data)
              }
              else{
                throw new Error('updateGroup  fails')
              }
          })
          .catch(function(err){
            reject(err)
          })
        })
    })
}*/



Wechat.prototype.moveGroup = function(openid_list,to_groupid){
  var that=this

  return new Promise(function(resolve,reject){
      that.fetchAccessToken()
        .then(function(data){
            var url 
            var form = {
              to_groupid:to_groupid 
          }
            if(_.isArray(openid_list)){
                url = api.group.batchMove + 'access_token=' + data.access_token
                form.openid_list = openid_list
            }else{
              url = api.group.move + 'access_token=' + data.access_token
              form.openid =  openid_list
            }

          

          request({method:'POST',url:url,body:form,json:true}).then(function(response){
              var _data = response.body

              if(_data){
                resolve(_data)
              }
              else{
                throw new Error('updateGroup  fails')
              }
          })
          .catch(function(err){
            reject(err)
          })
        })
    })
}




Wechat.prototype.batchMoveGroup = function(id){
  var that=this

  return new Promise(function(resolve,reject){
      that.fetchAccessToken()
        .then(function(data){
          var url = api.group.delete + 'access_token=' + data.access_token

          var form = {
            group:{
              id:id
            }
          }

          request({method:'POST',url:url,body:form,json:true}).then(function(response){
              var _data = response.body

              if(_data){
                resolve(_data)
              }
              else{
                throw new Error('updateGroup  fails')
              }
          })
          .catch(function(err){
            reject(err)
          })
        })
    })
}


Wechat.prototype.delGroup = function(id){
  var that=this

  return new Promise(function(resolve,reject){
      that.fetchAccessToken()
        .then(function(data){
          var url = api.group.detele + 'access_token=' + data.access_token

          var form = {
            group:{
              id:id
            } 
          }

          request({method:'POST',url:url,body:form,json:true}).then(function(response){
              var _data = response.body

              if(_data){
                resolve(_data)
              }
              else{
                throw new Error('deteleGroup  fails')
              }
          })
          .catch(function(err){
            reject(err)
          })
        })
    })
}

Wechat.prototype.remarkUser = function(openid,remark){
  var that=this

  return new Promise(function(resolve,reject){
      that.fetchAccessToken()
        .then(function(data){
          var url = api.users.remark + 'access_token=' + data.access_token

          var form = {
            openid:openid,
            remark:remark
          }

          request({method:'POST',url:url,body:form,json:true}).then(function(response){
              var _data = response.body

              if(_data){
                resolve(_data)
              }
              else{
                throw new Error('remark user  fails')
              }
          })
          .catch(function(err){
            reject(err)
          })
        })
    })
}



Wechat.prototype.fetchUser = function(openIds,lang){
  var that=this
  lang =lang || 'zh_CN'
  return new Promise(function(resolve,reject){
      that.fetchAccessToken()
        .then(function(data){
          var options = {
            json:true
          }
          if(_.isArray(openIds)){
            options.url = api.users.batchFetch + 'access_token=' + data.access_token
              options.body = {
              user_list:openIds
            }
            options.method = 'POST'
          }else{
            options.url = api.users.fetch + 'access_token=' + data.access_token + '&openid='+openIds+'&lang=' + lang 
          }

          request(options).then(function(response){
              var _data = response.body

              if(_data){
                resolve(_data)
              }
              else{
                throw new Error('fetch user  fails')
              }
          })
          .catch(function(err){
            reject(err)
          })
        })
    })
}


Wechat.prototype.listUser = function(openId){
  var that=this
  return new Promise(function(resolve,reject){
      that.fetchAccessToken()
        .then(function(data){
          var url = api.users.list + 'access_token=' + data.access_token
          if(openId){
            url+= '&next_openid='+ openId
          }    

          request({url:url,json:true}).then(function(response){
              var _data = response.body

              if(_data){
                resolve(_data)
              }
              else{
                throw new Error('list user  fails')
              }
          })
          .catch(function(err){
            reject(err)
          })
        })
    })
}


Wechat.prototype.sendByMass = function(type,message,groupId){
  var that=this
  var msg = {
    filter:{},
    msgtype:type
  }
  msg[type] = message
  if(!groupId){
    msg.filter.is_to_all = true
  }
  else{
    msg.filter.is_to_all = false
    msg.filter = {
      is_to_all:false,
      group_id:groupId
    }
  }
  return new Promise(function(resolve,reject){
      that.fetchAccessToken()
        .then(function(data){
          var url = api.mass.group + 'access_token=' + data.access_token

          request({method:'POST',url:url,body:msg,json:true}).then(function(response){
              var _data = response.body

              if(_data){
                resolve(_data)
              }
              else{
                throw new Error('send Mass  fails')
              }
          })
          .catch(function(err){
            reject(err)
          })
        })
    })
}


Wechat.prototype.sendByOpenid = function(type,message,openIds){
  var that=this
  console.log(openIds)
  var msg = {
    touser:openIds,
    msgtype:type
  }
  msg[type] = message
  return new Promise(function(resolve,reject){
      that.fetchAccessToken()
        .then(function(data){
          var url = api.mass.openid + 'access_token=' + data.access_token

          request({method:'POST',url:url,body:msg,json:true}).then(function(response){
              var _data = response.body

              if(_data){
                resolve(_data)
              }
              else{
                throw new Error('send by openid  fails')
              }
          })
          .catch(function(err){
            reject(err)
          })
        })
    })
}


Wechat.prototype.delByMass = function(msg_id){
  var that=this

  return new Promise(function(resolve,reject){
      that.fetchAccessToken()
        .then(function(data){
          var url = api.mass.del + 'access_token=' + data.access_token

          var form = {
            msg_id : msg_id
          }

          request({method:'POST',url:url,body:form,json:true}).then(function(response){
              var _data = response.body

              if(_data){
                resolve(_data)
              }
              else{
                throw new Error('detele Mass  fails')
              }
          })
          .catch(function(err){
            reject(err)
          })
        })
    })
}



Wechat.prototype.PreviewMass = function(type,message,openId){
  var that=this
  var msg = {
    msgtype:type,
    touser:openId
  }

  msg[type] = message
  console.log(msg[type])
  return new Promise(function(resolve,reject){
      that.fetchAccessToken()
        .then(function(data){
          var url = api.mass.preview + 'access_token=' + data.access_token
          console.log(data)
          request({method:'POST',url:url,body:msg,json:true}).then(function(response){
              var _data = response.body
              console.log(response)
              if(_data){
                resolve(_data)
              }
              else{
                throw new Error('perview Mass fails')
              }
          })
          .catch(function(err){
            reject(err)
          })
        })
    })
}



Wechat.prototype.checkByMass = function(msg_id){
  var that=this

  return new Promise(function(resolve,reject){
      that.fetchAccessToken()
        .then(function(data){
          var url = api.mass.check + 'access_token=' + data.access_token

          var form = {
            msg_id : msg_id
          }

          request({method:'POST',url:url,body:form,json:true}).then(function(response){
              var _data = response.body

              if(_data){
                resolve(_data)
              }
              else{
                throw new Error('detele Mass  fails')
              }
          })
          .catch(function(err){
            reject(err)
          })
        })
    })
}


Wechat.prototype.createMenu = function(menu){
  var that=this

  return new Promise(function(resolve,reject){
      that.fetchAccessToken()
        .then(function(data){
          var url = api.menu.create + 'access_token=' + data.access_token

          request({method:'POST',url:url,body:menu,json:true}).then(function(response){
              var _data = response.body

              if(_data){
                resolve(_data)
              }
              else{
                throw new Error('create Menu  fails')
              }
          })
          .catch(function(err){
            reject(err)
          })
        })
    })
}



Wechat.prototype.checkMenu = function(menu){
  var that=this

  return new Promise(function(resolve,reject){
      that.fetchAccessToken()
        .then(function(data){
          var url = api.menu.check + 'access_token=' + data.access_token

          request({url:url,json:true}).then(function(response){
              var _data = response.body

              if(_data){
                resolve(_data)
              }
              else{
                throw new Error('check Menu  fails')
              }
          })
          .catch(function(err){
            reject(err)
          })
        })
    })
}


Wechat.prototype.deteleMenu = function(){
  var that=this
  
  return new Promise(function(resolve,reject){
      that.fetchAccessToken()
        .then(function(data){
          var url = api.menu.del + 'access_token=' + data.access_token

          request({url:url,json:true}).then(function(response){
              var _data = response.body

              if(_data){
                resolve(_data)
              }
              else{
                throw new Error('detele Menu  fails')
              }
          })
          .catch(function(err){
            reject(err)
          })
        })
    })
}


Wechat.prototype.getCurrentMenu = function(){
  var that=this

  return new Promise(function(resolve,reject){
      that.fetchAccessToken()
        .then(function(data){
          var url = api.menu.current + 'access_token=' + data.access_token

          request({url:url,json:true}).then(function(response){
              var _data = response.body

              if(_data){
                resolve(_data)
              }
              else{
                throw new Error('current Menu  fails')
              }
          })
          .catch(function(err){
            reject(err)
          })
        })
    })
}


Wechat.prototype.createQrcode = function(qr){
  var that=this

  return new Promise(function(resolve,reject){
      that.fetchAccessToken()
        .then(function(data){
          var url = api.qrcode.create + 'access_token=' + data.access_token

          request({method:'POST',url:url,body:qr,json:true}).then(function(response){
              var _data = response.body

              if(_data){
                resolve(_data)
              }
              else{
                throw new Error('create qrcode  fails')
              }
          })
          .catch(function(err){
            reject(err)
          })
        })
    })
}


Wechat.prototype.showQrcode = function(ticket){
  return api.qrcode.show + 'ticket' +encodeURI(ticket)
}


Wechat.prototype.createShortUrl = function(action,url){
  action = action || 'long2short'
  var that=this

  return new Promise(function(resolve,reject){
      that.fetchAccessToken()
        .then(function(data){
          var url = api.shortUrl.create + 'access_token=' + data.access_token

          var form ={
            action:action,
            long_url:url
          }
          request({method:'POST',url:url,body:form,json:true}).then(function(response){
              var _data = response.body

              if(_data){
                resolve(_data)
              }
              else{
                throw new Error('create shorturl  fails')
              }
          })
          .catch(function(err){
            reject(err)
          })
        })
    })
}


Wechat.prototype.semantic = function(semanticData){
  var that=this

  return new Promise(function(resolve,reject){
      that.fetchAccessToken()
        .then(function(data){
          var url = api.semanticUrl + 'access_token=' + data.access_token
          semanticData.appid = data.appID
        
          request({method:'POST',url:url,body:semanticData,json:true}).then(function(response){
              var _data = response.body

              if(_data){
                resolve(_data)
              }
              else{
                throw new Error('semanticUrl  fails')
              }
          })
          .catch(function(err){
            reject(err)
          })
        })
    })
}


Wechat.prototype.reply = function(){
  var content = this.body
  var message = this.weixin
  console.log(content +'wechat.js')
  console.log(message +'wechat.js')
  var xml = util.tpl(content,message)

  this.status = 200
  this.type = 'application/xml'
  this.body = xml
}



module.exports = Wechat