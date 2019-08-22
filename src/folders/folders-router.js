const express = require('express');
const path = require('path');
const xss = require('xss');
const FoldersService = require('./folders-service');
const jsonParser = express.json();
const foldersRouter = express.Router();
const logger = require('../logger');

const serializeFolder = folder => ({
    id: folder.id,
    folder_name: xss(folder.folder_name),
});

foldersRouter.route('/')
    .get((req, res, next) => {
        FoldersService.getAllFolders(req.app.get('db'))
            .then(folders => {
                return res.json(folders.map(serializeFolder));
            })
            .catch(next);
    })
    .post(jsonParser, (req, res, next) => {
        const { folder_name } = req.body;
        const newFolder = { folder_name };

        if(newFolder.folder_name == null) {
            logger.error(`POST ${req.originalUrl} : Missing key 'folder_name' in request body`);
            return res.status(400).json({error: {message: `Missing key 'folder_name' in request body`}});
        };

        FoldersService.insertFolder(req.app.get('db'), newFolder)
            .then(folder => {
                return res
                    .status(201)
                    .location(path.posix.join(req.originalUrl + `/${folder.id}`))
                    .json(serializeFolder(folder));
            })
            .catch(next);
    });

foldersRouter.route('/:id')
    .all((req, res, next) => {
        FoldersService.getFolderByID(req.app.get('db'), req.params.id)
            .then(folder => {
                if(!folder) {
                    logger.error(`ALL ${req.originalUrl} : Folder with id ${req.params.id} not found`);
                    return res.status(404).json({error: {message: `Folder does not exist`}});
                };
                res.folder = folder;
                next();
            })
            .catch(next);
    })
    .get((req, res, next) => {
        return res.json(serializeFolder(res.folder));
    })
    .delete((req, res, next) => {
        FoldersService.deleteFolder(req.app.get('db'), req.params.id)
            .then(() => {
                return res.status(204).end();
            })
            .catch(next);
    })
    .patch(jsonParser, (req, res, next) => {
        const { folder_name } = req.body;
        const updatedFolder = { folder_name };

        if(updatedFolder.folder_name == null ) {
            logger.error(`PATCH ${req.originalUrl} : Missing key in request body`);
            return res.status(400).json({error: {message: `Missing key 'folder_name' in request body`}});
        };

        FoldersService.updateFolder(req.app.get('db'), req.params.id, serializeFolder(updatedFolder))
            .then(() => {
                return res.status(204).end();
            })
            .catch(next);
    });

module.exports = foldersRouter;
