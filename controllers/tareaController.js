const Tarea = require('../models/Tarea');
const Proyecto = require('../models/Proyecto');
const { validationResult } = require('express-validator');

// Crear una nueva tarea
exports.crearTarea = async (req, res) => {

    // revisar si hay errores
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({errores: errores.array()})
    }

    // Extraer el proyecto y comprobar que existe

    try {

        const { proyecto } = req.body;

        const proyectoExistente = await Proyecto.findById(proyecto);

        if (!proyectoExistente) {
            return res.status(404).json({msg: 'Proyecto no encontrado'});
        }

        // Revisar si el proyecto actual pertenece al usuario actrual
        if (proyectoExistente.creador.toString() !== req.usuario.id) {
            return res.status(401).json({msg: 'No Autorizado'});
        }

        // Crear la tarea
        const tarea = new Tarea(req.body);
        await tarea.save();
        res.json({tarea});
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }

}

// Obtener las tareas por proyecto
exports.obtenerTareas = async (req, res) => {

    try {
        
        const { proyecto } = req.query;

        const proyectoExistente = await Proyecto.findById(proyecto);

        if (!proyectoExistente) {
            return res.status(404).json({msg: 'Proyecto no encontrado'});
        }

        // Revisar si el proyecto actual pertenece al usuario actrual
        if (proyectoExistente.creador.toString() !== req.usuario.id) {
            return res.status(401).json({msg: 'No Autorizado'});
        }

        // Obtener las tareas por proyecto
        const tareas = await Tarea.find({proyecto}).sort({ creado: -1 });
        res.json({tareas});

    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }

}

// Actualizar tarea
exports.actualizarTarea = async (req, res) => {
    try {

        const { proyecto, nombre, estado } = req.body;

        const proyectoExistente = await Proyecto.findById(proyecto);

        // Si la tarea existe o no
        let tarea = await Tarea.findById(req.params.id);

        if (!tarea) {
            return res.status(404).json({msg: 'Tarea no encontrada'});
        }
        
        // Revisar si el proyecto actual pertenece al usuario actrual
        if (proyectoExistente.creador.toString() !== req.usuario.id) {
            return res.status(401).json({msg: 'No Autorizado'});
        }

        // Crear un objeto con la nueva informacion
        const nuevaTarea = {};

        nuevaTarea.nombre = nombre;
        nuevaTarea.estado = estado;

        // Guardar la tara
        tarea = await Tarea.findOneAndUpdate({_id : req.params.id}, nuevaTarea, {new : true});

        res.json({tarea});
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }
}

// Eliminar Tarea
exports.eliminarTarea = async (req, res) => {
    try {

        const { proyecto } = req.query;

        // Si la tarea existe o no
        let tarea = await Tarea.findById(req.params.id);

        if (!tarea) {
            return res.status(404).json({msg: 'Tarea no encontrada'});
        }
        
        // extraer el proyecto
        const proyectoExistente = await Proyecto.findById(proyecto);

        // Revisar si el proyecto actual pertenece al usuario actrual
        if (proyectoExistente.creador.toString() !== req.usuario.id) {
            return res.status(401).json({msg: 'No Autorizado'});
        }

        // Eliminar
        await Tarea.findOneAndRemove({_id: req.params.id});
        res.json({msg: 'Tarea Eliminada'});
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }
}