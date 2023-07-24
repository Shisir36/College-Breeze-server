const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// middleware 
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://CollegeBreeze:E8ZYRs2QUhczjcgr@cluster0.nbenc92.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        const CollegeCollections = client.db("College-breeze").collection('college');
        const CollegeName = client.db("College-breeze").collection('Admission-College');
        // await client.connect();
        // Send a ping to confirm a successful connection
        app.get("/college", async (req, res) => {
            const cursor = CollegeCollections.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/details/:id', async (req, res) => {
            const collegeId = req.params.id;
            const query = { _id: new ObjectId(collegeId) };
            const result = await CollegeCollections.findOne(query);
            res.send(result);
        });
        app.get("/admission", async (req, res) => {
            const result = await CollegeName.find().toArray();
            res.send(result)
        })
        // ... Other imports and setup code ...

        // Add the POST route for handling admission details
        app.post("/admissionDetails/:id", async (req, res) => {
            const collegeId = req.params.id;
            const admissionDetails = req.body; // The admission details sent from the frontend

            // Here, you can perform the necessary logic to save the admission details to the database.
            try {
                const query = { _id: new ObjectId(collegeId) };
                const college = await CollegeName.findOne(query);

                if (!college) {
                    // College not found, return an error response
                    return res.status(404).json({ message: "College not found" });
                }

                // Update the college's admission details
                college.admissionDetails = admissionDetails;

                // Save the updated college document back to the database
                await CollegeName.updateOne(query, { $set: college });

                // Send a success response to the frontend
                res.json({ message: "Admission details added successfully!" });
            } catch (error) {
                // Handle any errors that occur during the update process
                console.error("Error adding admission details:", error);
                res.status(500).json({ message: "An error occurred while adding admission details" });
            }
        });
        app.get("/mycollage", async (req, res) => {
            try {
                const { email } = req.query;

                // Check if the email query parameter is provided
                if (!email) {
                    return res.status(400).json({ message: "Email parameter is missing" });
                }

                // Query for the email inside the admissionDetails field
                const query = { "admissionDetails.email": email };
                const result = await CollegeName.find(query).toArray();
                res.json(result);
            } catch (error) {
                console.error("Error fetching admission details:", error);
                res.status(500).json({ message: "An error occurred while fetching admission details" });
            }
        });
        app.post("/addReview/:collegeId", async (req, res) => {
            const collegeId = req.params.collegeId;
            const { rating, comment } = req.body;

            // Check if all required fields are provided
            if (!rating || !comment) {
                return res.status(400).json({ message: "Please provide a rating and a comment" });
            }

            try {
                // Find the college by its ID
                const college = await CollegeName.findOne({ _id: new ObjectId(collegeId) });

                // Check if the college exists
                if (!college) {
                    return res.status(404).json({ message: "College not found" });
                }

                // Create the review object
                const review = {
                    rating,
                    comment,
                    date: new Date(), // You can set the date to the current date or use a timestamp
                };

                // Add the review to the college's reviews array using $push
                await CollegeName.updateOne({ _id: new ObjectId(collegeId) }, { $push: { reviews: review } });

                res.json({ message: "Review added successfully!" });
            } catch (error) {
                console.error("Error adding review:", error);
                res.status(500).json({ message: "An error occurred while adding the review" });
            }
        });
        app.get("/collegereview", async (req, res) => {
            const cursor = CollegeName.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        // ... Rest of the code ...

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("data is running")
})

app.listen(port, () => {
    console.log(`data is running on port${port} `);
})