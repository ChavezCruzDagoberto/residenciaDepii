//rutas 
const express = require('express');
const router = express.Router();

//inicio principal
router.get('/', (req, res) => {


   res.render('../index');

});

module.exports = router;
