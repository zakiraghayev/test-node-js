const express = require('express');
const db = require('./database');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); 

const escpos = require('escpos');
escpos.USB = require('escpos-usb');

// API endpoints
// Get all items
app.get('/items', (req, res) => {
    db.all("SELECT * FROM items", [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Create a new item
app.post('/items', (req, res) => {
    const { name } = req.body;
    db.run(`INSERT INTO items (name) VALUES (?)`, [name], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "success", "id": this.lastID });
    });
});



app.post('/print', (req, res) => {
    const { text } = req.body; // Get text from the POST request body

    try {
        // Assuming your Xprinter is connected via USB
        const device = new escpos.USB();  
        device.open((error) => {
            if (error) {
                console.error('Error opening device:', error);
                res.status(500).json({ error: "Failed to access printer" });
                return;
            }
    
            const printer = new escpos.Printer(device);
            
            printer
                .font('a')
                .align('ct')
                .style('bu')
                .size(1, 1)
                .text(text)
                .cut()
                .close(() => {
                    res.json({ message: "Printed successfully" });
                });
        }); 
    } catch (error) {
        console.error("Can not find printer", { error })
    }

    
});

// Default response for any other request
app.use((req, res) => {
    res.status(404);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
