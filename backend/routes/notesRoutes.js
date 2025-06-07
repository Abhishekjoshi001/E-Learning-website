// In your routes file
import express from 'express';
import notesController from '../controllers/notesController.js';

const router = express.Router();

router.post('/add', notesController.addNote);
router.get('/', notesController.getAllNotes);
router.get('/:id', notesController.getNoteById);
router.get('/:id/download', notesController.downloadNote);
router.delete('/:id', notesController.deleteNote);

export default router;