var mongoose = require('mongoose')
var Movie = mongoose.model('Movie')
var Category = mongoose.model('Category')
var koa_request = require('koa-request')

// index page
exports.findAll = function *() {
  var Category = yield Category
    .find({})
    .populate({
      path: 'movies',
      select: 'title poster',
      options: { limit: 6 }
    })
    .exec()
    return categories
}

// search page
exports.searchByCategory = function *(catId) {
  var categories = yield Category
      .find({_id:catId})
      .populate({
        path:'movies',
        select:'title poster'
      })
      .exec()
      return categories
}

exports.searchByName = function *(q) {
  var movies = yield Movie
      .find({title: new RegExp(q + '.*', 'i')})
      .exec()
      return movies
}


exports.searchByDouBan = function *(q) {
    var options = {
      url :'https://api.douban.com/v2/movie/search?q='
    }
    options.url += encodeURIComponent(q)
    var response = yield koa_request(options)
    var data = JSON.parse(response.body)
    var subjects = []
    if(data && data,subjects){
      subjects = data.subjects
    }
    return subjects
}


// exports.searchByName = function(req, res) {
//   var catId = req.query.cat
//   var q = req.query.q
//   var page = parseInt(req.query.p, 10) || 0
//   var count = 2
//   var index = page * count

//   if (catId) {
//     Category
//       .find({_id: catId})
//       .populate({
//         path: 'movies',
//         select: 'title poster'
//       })
//       .exec(function(err, categories) {
//         if (err) {
//           console.log(err)
//         }
//         var category = categories[0] || {}
//         var movies = category.movies || []
//         var results = movies.slice(index, index + count)

//         res.render('results', {
//           title: 'imooc 结果列表页面',
//           keyword: category.name,
//           currentPage: (page + 1),
//           query: 'cat=' + catId,
//           totalPage: Math.ceil(movies.length / count),
//           movies: results
//         })
//       })
//   }
//   else {
//     Movie
//       .find({title: new RegExp(q + '.*', 'i')})
//       .exec(function(err, movies) {
//         if (err) {
//           console.log(err)
//         }
//         var results = movies.slice(index, index + count)

//         res.render('results', {
//           title: 'imooc 结果列表页面',
//           keyword: q,
//           currentPage: (page + 1),
//           query: 'q=' + q,
//           totalPage: Math.ceil(movies.length / count),
//           movies: results
//         })
//       })
//   }
// }