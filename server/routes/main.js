// DESCRIPCION

/*
    En este archivo JavaScript fueron definidas las rutas que nos mostrarán el contenido principal de
    la página web, como, por ejemplo: el landing page, las categorías de cómics, la biblioteca dispon-
    ible para el usuario, etcétera...
*/

const express = require('express');
const router = express.Router();

// MODELOS

const Authors = require('../models/Authors')
const Characters = require('../models/Characters')
const Issues = require('../models/Issues')
const Publishers = require('../models/Publishers')
const Titles = require('../models/Titles')
const Users = require('../models/Users')
const Volumes = require('../models/Volumes')

const bcrypt = require('bcrypt');
const jwt  = require('jsonwebtoken');   

const jwtSecret  = process.env.JWT_SECRET;



// RUTAS

/*
    En esta sección es donde definimos cuáles rutas tendrá nuestro sitio web. La manera en la que fue-
    ron definidas es la siguiente:

    router.get('<Aquí debe ir el nombre de la ruta>')...
    res.render('<Aquí debe ir el nombre del archivo .ejs'>)...

    La instrucción 'render', como dice el nombre: renderiza el código hallado en el .ejs 
*/



/*
    * GET * HOME PAGE * MUESTRA INICIO *
*/

router.get('', (req, res) => {
    const locals = {
        title: "Home Page"
    }

    res.render('index', { locals });
});

/*
    * GET * COLLECTIONS * MUESTRA CONTENIDO DISPONIBLE *
*/

router.get('/collections', async(req, res) => {
    try {
        const locals = {
            title: "Collections"
        }
    
        const data = await Titles.find();
        res.render('collections', { data, locals });
    } catch(error) {
        console.log(error);
    }
});

/*
    * GET * DESCRIPTION * MUESTRA LA DESCRIPCION DE COMIC *
*/

router.get('/description/:id', async(req, res) => {
    try {
        let slug = req.params.id;

        const data = await Titles.findById({ _id: slug });

        res.render("description", { data });
    } catch(error) {
        console.log(error);
    }
});

/*
    * POST * RESULTS * MUESTRA RESULTADO DE BUSQUEDA *
*/

router.post('/result', async(req, res) => {
    try {
        let searchTerm = req.body.searchBar
        const searchNoSpecialCharacter = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

        const data = await Titles.find({
            $or: [
                { Name: { $regex: new RegExp(searchNoSpecialCharacter, 'i') }}
            ]
        });
        res.render("result", { data });
    } catch(error) {
        console.log(error);
    }
});

/*
    * GET * USERS * MUESTRA CREAR / USAR CUENTA *
*/

router.get('/users', async(req, res) => {
    try {
        const locals = {
            title: "Users"
        }
    
        const data = await Users.find();
        res.render('users', { data, locals });
    } catch(error) {
        console.log(error);
    }
});

/*
    * POST * USERS * PERMITE USAR CUENTA *
*/

router.post('/login', async(req, res) => {
    try {
        const { Username, Password } = req.body;

        const user = await Users.findOne({ Username });

        if(!user) {
            return res.status(401).json({ message: 'Invalid Credentials!' });
        }

        const isPasswordValid = await bcrypt.compare(Password, user.Password);

        if(!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid Credentials!' });
        }

        const token = jwt.sign({ userId: Users._id}, jwtSecret)
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/logedin/homepage')
    } catch(error) {
        console.log(error);
    }
}); 

/*
    * GET * USERS * DIRIGE A PAGINA DE REGISTRO *
*/

router.get('/createaccount', async(req, res) => {
    try {
        const locals = {
            title: "Create Account"
        }

        res.render('createaccount', { locals })
    } catch(error) {
        console.log(error);
    }
});

/*
    * POST * USERS * PERMITE CREAR CUENTA *
*/

router.post('/register', async(req, res) => {
    try {
        const { Email, Username, Password, Date_of_Birth } = req.body;
        const hashedPassword = await bcrypt.hash(Password, 10);

        try {
            const user = await Users.create({ Email, Username, Password: hashedPassword, Date_of_Birth });
            res.redirect('/users');
        } catch(error) {
            if(error.code === 11000) {
                res.status(409).json({ message: 'User Already Created!' });
            }
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    } catch(error) {
        console.log(error);
    }
});


/*
    * GET * AUTHORS * MUESTRA LOS AUTORES *
*/

router.get('/authors', async(req, res) => {
    try {
        const locals = {
            title: "Home Page"
        }

        const data = await Authors.find();
        res.render('authors', { data, locals })
    } catch(error) {
        console.log(error);
    }
});

/*
    * GET * AUTHORS * MUESTRA LA BIOGRAFIA DEL AUTOR *
*/

router.get('/bio/:id', async(req, res) => {
    try {
        let slug = req.params.id;

        const data = await Authors.findById({ _id: slug });

        res.render("bio", { data });
    } catch(error) {
        console.log(error);
    }
});



//  METODOS

/*
    * COOKIE * MANTENER USUARIO AL INGESRESAR
*/

module.exports = router;