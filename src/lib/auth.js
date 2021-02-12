module.exports = {

    estaLogueado(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        } else {
            return res.redirect('/signin');

        }

    },




    noEstaLogueado(req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        } else {

            return res.redirect('/');

        }

    },

    esAdministrador(req, res, next) {

        if (req.isAuthenticated()) {
            const { rol_sistema } = req.user;
            // console.log(rol_sistema);
            if (rol_sistema == 'Administrador') {
                return next();
            } else {
                req.flash('success', 'No tiene permiso para este dato');
                return res.redirect('/');
            }

        } else {

            return res.redirect('/signin');

        }

    },



    esLider(req, res, next) {

        if (req.isAuthenticated()) {
            const { rol_sistema } = req.user;
            // console.log(rol_sistema);
            if (rol_sistema == 'Responsable') {
                return next();
            } else {
                req.flash('message', 'No tiene permiso para este dato');
                return res.redirect('/');
            }

        } else {

            return res.redirect('/signin');

        }

    },
    tienePermiso(req, res, next) {

        if (req.isAuthenticated()) {
            const { rol_sistema } = req.user;
            // console.log(rol_sistema);
            if (rol_sistema == 'Responsable' || rol_sistema == 'Administrador') {
                return next();
            } else {
                req.flash('success', 'No tiene permiso para este dato');
                return res.redirect('/');
            }

        } else {

            return res.redirect('/signin');

        }

    }

};  