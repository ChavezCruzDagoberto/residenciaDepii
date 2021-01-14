
const express =require('express');
const router=express.Router();
const products=[{
    id: 1,
    name:'products 1'
},
{id: 2,
    name:'product 2'}];


//rutas URL

router.get('/product',(req,res)=>{
    res.render('partida/list');
});
router.get('/products',(req,res)=>{
    res.json(products);
});

router.post('/products',(req,res)=>{
    
   // console.log(req.body);

    const {name}=req.body;
    products.push ({
        id:products.length+1,
        name

    });
    res.json('creado ');
})

router.put('/products/:id',(req,res)=>{
 const {id}=req.params;
 const {name}= req.body;

 products.forEach((product,i)=>{
if(product.id==id){
product.name=name;

}

 })
 res.json('actualizado');

 } );




 router.delete('/products/:id',(req,res)=>{
    const {id}=req.params;
     
   
    products.forEach((product,i)=>{
   if(product.id==id){
   products.splice(i,1);
   
   }
   
    });
    
   console.log(req.params);
    res.json('eliminado');
   
    } );

    module.exports=router;