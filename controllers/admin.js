const sanitizeImage = require('../util/sanitizeImage')
const Product = require('../models/products')
const User = require('../models/users')
const { validationResult } = require('express-validator')
const ash = require('express-async-handler')
const fs = require('fs')
const itemPerPage = 10

exports.getAllUsers = ash(async (_req, res) => {
    const users = await User.allUser()
    const hasUser = users.length > 0 ? true : false
    res.render('admin/users', {
        'title': 'Nusantaran JS | Manage Users',
        'path': '/users',
        'hasUser': hasUser,
        'users': users,
    })
})

exports.getProduct = ash(async (req, res) => {
    // Calculating items per page and total page
    const page = req.query.page ? req.query.page - 1 : 0
    const productAndLength = await Product.fetchChunk(page, itemPerPage)
    const products = productAndLength.chunkData
    const length = productAndLength.tableRowsCount
    const totalPage = Math.ceil(length / itemPerPage)
    const displayPage = totalPage * itemPerPage >= itemPerPage ? true : false
    const limit = {
        firstPage: 1,
        lastPage: totalPage
    }

    // Retrieteving placeholder and error message
    const placeholder = req.flash('placeholder')
    const placeholderData = placeholder.length > 0 ? placeholder[0] : {}
    const error = req.flash('errorMessage')
    const errorMessage = error.length > 0 ? error[0] : null
    const hasProduct = products.length > 0 ? true : false

    res.render('admin/product', {
        'title': 'Nusantaran JS | Admin Products',
        'path': '/product',
        'hasProduct': hasProduct,
        'products': products,
        'errorMessage': errorMessage,
        'errors': req.flash('errors'),
        'placeholder': placeholderData,
        'page': page + 1,
        'totalPage': totalPage,
        'displayPage': displayPage,
        'limit': limit
    })
})

exports.postAddProduct = ash(async (req, res) => {
    const deleteImage = () => {
        try {
            fs.unlinkSync(sanitizeImage(req.file.path.split('\\')[1]))
        } catch (error) {
            console.log(error)
        }
    }
    const validationError = validationResult(req)
    if (validationError.isEmpty()) {
        const safeImage = sanitizeImage(req.file.path.split('\\')[1])
        const product = new Product(
            req.body.name,
            req.body.category,
            req.body.description,
            req.body.price,
            safeImage,
            req.session.user.email
        )
        try {
            await product.save()
            res.redirect('/admin/product')
        } catch (error) {
            console.log(error)
            deleteImage()
            req.flash('errorMessage', [`Product "${req.body.name}" is already in database`])
            req.flash('errors', [{ param: 'name' }])
            req.flash('placeholder', {
                'name': req.body.name,
                'category': req.body.category,
                'description': req.body.description,
                'price': req.body.price
            })
            res.status(422).redirect('/admin/product')
        }
    } else {
        deleteImage()
        req.flash('errorMessage', validationError.array()[0].msg)
        req.flash('errors', validationError.array())
        req.flash('placeholder', {
            'name': req.body.name,
            'category': req.body.category,
            'description': req.body.description,
            'price': req.body.price
        })
        res.status(422).redirect('/admin/product')
    }
})

exports.postUpdateProduct = ash(async (req, res) => {
    let product = req.body
    const oldImage = sanitizeImage(product.imagepath.split('/')[1])
    // If user update the image, then product.image will be the path from updated image and
    // delete the old image. Otherwise, we used the old path and keep the old image
    product.image = req.file ? sanitizeImage(req.file.path.split('\\')[1]) : oldImage
    if (req.file) {
        try {
            fs.unlinkSync(oldImage)
        } catch (err) {
            console.log(err)
        }
    }
    await Product.updateProduct(product)
    res.redirect('/admin/product')
})

exports.postDeleteProduct = ash(async (req, res) => {
    await Product.deleteProduct(req.body.id)
    res.redirect('/admin/product')
})

exports.postChangeStatus = ash(async (req, res) => {
    const id = req.body.id
    const status = req.body.status
    await User.updateStatus(id, status)
    res.status(200).redirect('/myorder')
})