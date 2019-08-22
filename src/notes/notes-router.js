const express = require('express');
const path = require('path');
const xss = require('xss');
const NotesService = require('./notes-service');
const jsonParser = express.json();
const notesRouter = express.Router();
const logger = require('../logger');

const serializeNote = note => ({
    id: note.id,
    note_name: xss(note.note_name),
    content: xss(note.content),
    modified_date: note.modified_date,
    folder_id: note.folder_id
});

notesRouter.route('/')
    .get((req, res, next) => {
        NotesService.getNotes(req.app.get('db'))
            .then(notes => {
                return res.json(notes.map(serializeNote));
            })
            .catch(next);

    })
    .post(jsonParser, (req, res, next) => {
        const { note_name, content, modified_date, folder_id } = req.body;
        const newNote = { note_name, folder_id };

        for (const [key, value] of Object.entries(newNote)) {
            if(value == null) {
                logger.error(`POST ${req.originalUrl} : Missing key ${key} in request body`);
                return res.status(400).json({error: {message: `Missing key '${key}' in request body`}});
            };
        };

        newNote.modified_date = modified_date;
        newNote.content = content;

        NotesService.insertNote(req.app.get('db'), serializeNote(newNote))
            .then(note => {
                return res
                    .status(201)
                    .location(path.posix.join(req.originalUrl + `/${note.id}`))
                    .json(note);
            })
            .catch(next);
    });

notesRouter.route('/:id')
    .all((req, res, next) => {
        NotesService.getNoteById(req.app.get('db'), req.params.id)
            .then(note => {
                if(!note) {
                    logger.error(`ALL ${req.originalUrl} : Note with id ${req.params.id} does not exist`);
                    return res.status(404).json({error: {message: `Note does not exist`}});
                };

                res.note = note;
                next();
            })
            .catch(next);
    })
    .get((req, res, next) => {
        return res.json(serializeNote(res.note));
    })
    .delete((req, res, next) => {
        NotesService.deleteNote(req.app.get('db'), req.params.id)
            .then(() => {
                return res.status(204).end();
            })
            .catch(next);
    })
    .patch(jsonParser, (req, res, next) => {
        const { note_name, content, modified_date, folder_id } = req.body;
        const updatedNote = { note_name, folder_id };

        const numberOfValues = Object.values(updatedNote).filter(Boolean).length;
        if(numberOfValues === 0) {
            logger.error(`PATCH ${req.originalUrl} : Missing key in request body`);
            return res.status(400).json({error: {message: `Missing key 'note_name' or 'folder_id' from request body`}});
        };

        updatedNote.content = content;
        updatedNote.modified_date = modified_date;

        NotesService.updateNote(req.app.get('db'), req.params.id, serializeNote(updatedNote))
            .then(() => {
                return res.status(204).end();
            })
            .catch(next);
    });

module.exports = notesRouter;
