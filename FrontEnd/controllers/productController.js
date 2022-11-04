const productData = require('../models/productModel')
const brandData = require('../models/brandModel')
const categoryData = require('../models/categoryModel')
const cloudinary = require('../utils/cloudinary')
const upload = require('../utils/multer')

// const axios = require('axios')






const adminProduct = async(req,res) => {
 
    try {
        const products = await productData.find({})
        // console.log(products)
        res.render('admin/adminProducts',{products})
    } catch (err) {
        console.log(err)
    }
}

const addProduct = async(req,res) => {
    try{
        const categories = await categoryData.find({})
        const brands = await brandData.find({})
        // console.log(categories)
        // console.log(brands)
        res.render('admin/addProduct',{categories,brands})
    } catch(err) {
        console.log(err)
    }

}


const saveAddedProduct = async(req,res) => {
   
   
    try {
        if(!req.body){
            res.status(400).send({message:'content cannot be empty'})
            // console.log(req.body)
            return;
        }
        

        // const result = await cloudinary.uploader.upload(req.file.path)
        const product = new productData ({

            name: req.body.name,
            price: req.body.price,
            discount: req.body.discount,
            originalPrice: req.body.originalPrice,
            category: req.body.category,
            brand: req.body.brand,
           
            highlights: req.body.highlights,
            description: req.body.description,
            stock: req.body.stock,
            expiresAt: Date.now() + 172800000, //2 days
            deleted: false
            
           
        })
        product.images = req.files.map(f => ({url:f.path,filename:f.filename}))
        await product.save()
            
              //  res.send(data)
              req.flash('success','Product added successfully')
              res.redirect("/addProduct")
          
            
    } catch(err) {
        console.log(err)
    }



   
}


const editProduct = async(req,res) => {
    try {
        const {id} = req.params 
        const product = await productData.findById(id)
        const categories = await categoryData.find({deleteStatus:false})
        const brands = await brandData.find({deleteStatus:false})
        res.render('admin/editProduct',{product,categories,brands})
    } catch(err) {
        console.log(err)
    }

}

const saveUpdatedProduct = async(req,res) => {
    
   try {
    const {id} = req.params 
    // const prod = await productData.findByIdAndUpdate(id)
    // await cloudinary.uploader.destroy(prod.cloudinary_id)
    // const result = await cloudinary.uploader.upload(req.file.path)
    const product = await productData.findByIdAndUpdate(id,{...req.body},{
       
        deleted: false
    })
    const imgs = req.files.map(f => ({url:f.path,filename:f.filename}))
    console.log(imgs)
    product.images.unshift(...imgs)
    console.log(product)
    await product.save()
    req.flash('success','Product updated successfully.')
    res.redirect('/adminProducts')
   } catch(err) {
    console.log(err)     
   }
    
}

const deleteProduct = async(req,res) => {
   try {
    const {id} = req.params
    await productData.findByIdAndUpdate(id,{deleted:true})
    
    
    
    res.send({success:true})
   } catch(err) {
        console.log(err)
   }
}

const addBrand = async(req,res) => {
    try {
        
        res.render('admin/addBrand')
        
    } catch (err) {
        console.log(err)
    }
}

const saveBrandName = async(req,res) => {
    try {
        const {name} = req.body
        if(!name) {
            req.flash('error','Empty values are not allowed')
            res.redirect('/addBrand')
        } 

        const redundunt = await brandData.find({name},{deleteStatus:false})
        console.log(redundunt)
        if(redundunt.length > 0){
            req.flash('error','Brand is already exists')
            res.redirect('/addBrand')
        } else {
            const brand = new brandData({
                name: req.body.name,
            
            })
            brand.save()
            req.flash('success','Brand name added successfully')
            res.redirect('/addBrand')
        }
        
       


    } catch(err) {
        console.log(err)
    }
}

const deleteBrand = async(req,res) => {
    try {
        const {id} = req.params
        
        await brandData.findByIdAndUpdate(id,{deleteStatus: true})
        
        res.send({status:true})
    } catch(err) {
        console.log(err)
    }

}

const addCategory = async(req,res) => {
    try{
        res.render('admin/addCategory')
    } catch(err) {
        console.log(err)
    }
}

const saveCategory = async(req,res) => {
    try {
        const {name} = req.body
        if(!name) {
            req.flash('error','Empty inputs are not allowed')
            res.redirect('/addCategory')
        }
        const redundant = await categoryData.find({name})
        if(redundant.length > 0){
            req.flash('error','This Category name is already exists')
            res.redirect('/addCategory')
        } else {
            const category = new categoryData ({
                name: req.body.name
            })
            category.save()
            req.flash('success','Category added successfully')
            res.redirect('/addCategory')
        }
    } catch(err){
        console.log(err)
    }
}

const deleteCategory = async(req,res) => {
   try{
    const {id} = req.params

    await categoryData.findByIdAndUpdate(id,{deleteStatus: true})
    res.send({success:true})
    
   } catch(err) {
    console.log(err)
   }
}


const viewProductDetails = async(req,res) => {
    try {
        const {id} = req.params

        const details = await productData.findById(id)

        res.render('user/productDetails',{details})
    } catch(err) {
        console.log(err)
    }

}

const allProducts = async(req,res) => {
    try {
        const products = await productData.find({deleted:false})
        res.render('user/allProducts',{products})
    } catch(err) {
        console.log(err)
    }
}


const allNewProducts = async(req,res) => {
    const justArrived = await productData.find({$and:[{
        expiresAt:{$gte: Date.now()}},{deleted:false}]
    })

    res.render('user/allNewProducts',{justArrived})
}

module.exports = {
    adminProduct,
    addProduct,
    editProduct,
    saveAddedProduct,
    saveUpdatedProduct,
    deleteProduct,
    addBrand,
    saveBrandName,
    addCategory,
    saveCategory,
    deleteCategory,
    deleteBrand,
    viewProductDetails,
    allNewProducts,
    allProducts
}