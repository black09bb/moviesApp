const fetch = require('node-fetch')
const Movie = require('../../models/movie')
const { defaultResponse, getFilters } = require('../../common')

exports.find = defaultResponse(req => {
    const filter = getFilters(req.query)
    return Movie.find(filter).sort(req.query.sortBy || '').exec()
})

exports.findById = defaultResponse(req => Movie.findById(req.params.id).exec())

exports.pagination = defaultResponse(req => {
    const filter = getFilters(req.query)
    const limit = Number(req.params.limit)
    const page = req.params.page
    return Promise.all([
        Movie.countDocuments(filter),
        Movie.find(filter).sort(req.query.sort || '').skip(limit * (page - 1)).limit(limit)
    ]).then(([total, result]) => ({total, result}))
})

exports.add = defaultResponse(async req => {
    if ( Object.keys(req.body).length > 1 || req.body.title) throw 'You can only send movie title with capitalized first letter'

    return fetch(`http://www.omdbapi.com/?apikey=a02d102&t=${req.body.Title}`)
        .then(res => res.json())
        .then(body => new Movie({...req.body, ...body}).save())
        .catch(console.log)
})

exports.delete = defaultResponse(req => Movie.findOneAndDelete({_id: req.params.id}).then(movie => `Deleted ${movie.Title} movie`))