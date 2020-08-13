const Proyecto = require('../models/Proyecto');
const { validationResult } = require('express-validator');

exports.crearProyectos = async (req, res) => {

    // revisar si hay errores
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({errores: errores.array()})
    }

    try {

        // crear un nuevo proyecto
        const proyecto = new Proyecto(req.body);

        // Guardar el creador via JWT
        proyecto.creador = req.usuario.id;

        // guardamos el proyecto
        proyecto.save();
        res.json(proyecto);
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error: ' + error);
    }
}

// Obtener todos los proyectos del usuario actual
exports.obtenerProyectos = async (req, res) => {
    try {
        const proyectos = await Proyecto.find({ creador: req.usuario.id }).sort({ creador: -1 });
        res.json({ proyectos });
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }
}

// Actualizar un proyecto
exports.actualizarProyecto = async (req, res) => {

    // revisar si hay errores
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({errores: errores.array()})
    }

    // extraer la informacion del proyecto
    const {nombre} = req.body;
    const nombreProyecto = {};

    if (nombre) {
        nombreProyecto.nombre = nombre;
    }

    try {

        // Revisar el ID
        let proyecto = await Proyecto.findById(req.params.id);

        // si el proyecto o no
        if (!proyecto) {
            return res.status(404).json({msg: 'Proyecto no encontrado'});
        }

        // Verificar el creador del proyecto
        if (proyecto.creador.toString() !== req.usuario.id) {
            return res.status(401).json({msg: 'Usuario no autorizado'});
        }

        // actualizar
        proyecto = await Proyecto.findByIdAndUpdate({ _id: req.params.id }, { $set : nombreProyecto }, { new: true });

        res.json({proyecto});
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Error en el servidor');
    }

}

// Eliminar proyecto por su id
exports.eliminarProyecto = async (req, res) => {
    try {
        // Revisar el ID
        let proyecto = await Proyecto.findById(req.params.id);

        // si el proyecto o no
        if (!proyecto) {
            return res.status(404).json({msg: 'Proyecto no encontrado'});
        }

        // Verificar el creador del proyecto
        if (proyecto.creador.toString() !== req.usuario.id) {
            return res.status(401).json({msg: 'Usuario no autorizado'});
        }

        // Eliminar el proyecto
        await Proyecto.findByIdAndRemove({ _id: req.params.id });
        res.json({ msg: 'Proyecto eliminado'});
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Error en el servidor');
    }
}