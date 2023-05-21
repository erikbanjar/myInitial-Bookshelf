/* eslint-disable linebreak-style */
/* eslint-disable import/no-unresolved */
// eslint-disable-next-line import/no-extraneous-dependencies
const { nanoid } = require('nanoid');
const books = require('./books');

const addBookHandler = (request, h) => {
    const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading
    } = request.payload;

    /**
        Client does not attach any name property to the request body.
    */

    if (!name) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. Mohon isi nama buku'
        });

        response.code(400);
        return response;
    }

    /**
        Client attaches a readPage property value that is greater than the pageCount property value.
    */

    if (readPage > pageCount) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount'
        });

        response.code(400);
        return response;
    }

    const id = nanoid(16);
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;
    const finished = pageCount === readPage;

    const newBook = {
        id,
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished,
        reading,
        insertedAt,
        updatedAt
    };

    books.push(newBook);
    const isSuccess = books.filter((book) => book.id === id).length > 0;

    /**
        Book is successfully loaded.
    */

    if (isSuccess) {
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil ditambahkan',
            data: {
                bookId: id
            }
        });

        response.code(201);
        return response;
    }

    /**
        Server failed to load book for a common reason (generic error).
    */

    const response = h.response({
        status: 'fail',
        message: 'Buku gagal ditambahkan'
    });

    response.code(500);
    return response;
};

const getAllBooksHandler = (request, h) => {
    const {
        name,
        reading,
        finished
    } = request.query;

    let filteredBooks = books;

    if (name) {
        filteredBooks = books.filter((bn) => bn.name.toLowerCase().includes(name.toLowerCase()));
    }

    if (reading) {
        filteredBooks = books.filter((book) => Number(book.reading) === Number(reading));
    }

    if (finished) {
        filteredBooks = books.filter((book) => Number(book.finished) === Number(finished));
    }

    const response = h.response({
        status: 'success',
        data: {
            books: filteredBooks.map((book) => ({
                id: book.id,
                name: book.name,
                publisher: book.publisher
            }))
        }
    });

    response.code(200);
    return response;
};

const getBookByIdHandler = (request, h) => {
    const {
        id
    } = request.params;

    const book = books.filter((b) => b.id === id)[0];

    /**
        Book with an attached id is found
    */

    if (book !== undefined) {
        return {
            status: 'success',
            data: {
                book
            }
        };
    }

    /**
        Book with the id attached by client is not found.
    */

    const response = h.response({
        status: 'fail',
        message: 'Buku tidak ditemukan'
    });

    response.code(404);
    return response;
};

const editBookByIdHandler = (request, h) => {
    const { id } = request.params;

    const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading
    } = request.payload;

    const updatedAt = new Date().toISOString();
    const index = books.findIndex((book) => book.id === id);

    /**
        Client does not attach any name property to the request body.
    */

    if (!name) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Mohon isi nama buku'
        });
        response.code(400);

        return response;
    }

    /**
        Client attaches a readPage property value that is greater than the pageCount property value.
    */

    if (readPage > pageCount) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount'
        });
        response.code(400);

        return response;
    }

    if (index !== -1) {
        const finished = pageCount === readPage;

        books[index] = {
            ...books[index],
            name,
            year,
            author,
            summary,
            publisher,
            pageCount,
            readPage,
            finished,
            reading,
            updatedAt
        };

        /**
            Book updated successfully.
        */

        const response = h.response({
            status: 'success',
            message: 'Buku berhasil diperbarui'
        });

        response.code(200);
        return response;
    }

    /**
        Book failed to update because Id was not found.
    */

    const response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Id tidak ditemukan'
    });

    response.code(404);
    return response;
};

const deleteBookByIdHandler = (request, h) => {
    const {
        id
    } = request.params;

    const index = books.findIndex((note) => note.id === id);

    /**
        The id belongs to one of the books.
    */

    if (index !== -1) {
        books.splice(index, 1);
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil dihapus'
        });

        response.code(200);
        return response;
    }

    /**
        The id attached is not owned by any book.
    */

    const response = h.response({
        status: 'fail',
        message: 'Buku gagal dihapus. Id tidak ditemukan'
    });

    response.code(404);
    return response;
};

module.exports = {
    addBookHandler,
    getAllBooksHandler,
    getBookByIdHandler,
    editBookByIdHandler,
    deleteBookByIdHandler
};
