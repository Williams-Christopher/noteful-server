const NotesService = {
    getNotes(knex) {
        return knex
            .select('*')
            .from('noteful_notes');
    },

    getNoteById(knex, id) {
        return knex
            .select('*')
            .from('noteful_notes')
            .where('id', id)
            .first();
    },

    insertNote(knex, newNote) {
        return knex
            .insert(newNote)
            .into('noteful_notes')
            .returning('*')
            .then(rows => {
                return rows[0];
            });
    },

    updateNote(knex, id, newFolder) {
        return knex('noteful_notes')
            .where({ id })
            .update(newFolder);
    },

    deleteNote(knex, id) {
        return knex('noteful_notes')
            .where({ id })
            .delete();
    },
};

module.exports = NotesService;
