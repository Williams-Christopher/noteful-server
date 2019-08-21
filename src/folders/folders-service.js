const FoldersService = {
    getAllFolders(knex) {
        return knex
            .select('*')
            .from('noteful_folders');
    },

    getFolderByID(knex, id) {
        return knex
            .select('*')
            .from('noteful_folders')
            .where('id', id)
            .first();

    },

    insertFolder(knex, newFolder) {
        return knex
            .insert(newFolder)
            .into('noteful_folders')
            .returning('*')
            .then(rows => {
                return rows[0];
            });
    },

    updateFolder(knex, id, newFolder) {
        return knex('noteful_folders')
            .where({ id })
            .update(newFolder);
    },

    deleteFolder(knex, id) {
        return knex('noteful_folders')
            .where({ id })
            .delete();
    },
};

module.exports = FoldersService;
