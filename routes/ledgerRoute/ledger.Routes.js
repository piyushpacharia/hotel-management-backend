import express from 'express';
import { addLedger,getAllLedgers,getLedger,getLedgerDetails,closeLedger } from '../../controllers/ledgers/ledgers.js'
import { authMiddleware } from "../../middleware/authMiddleware.js";


const router = express.Router();

router.post('/add-ledger', authMiddleware, addLedger);

// Get all ledgers
router.get('/get-all-ledger', authMiddleware, getAllLedgers);

// Get a specific ledger by its ID
router.post('/get-ledger', authMiddleware, getLedger);

// Get ledger details by its ID
router.post('/get-details', authMiddleware, getLedgerDetails);

// Close a ledger by its ID
router.post('/close-ledger', authMiddleware, closeLedger);


export default router;
