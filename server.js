const express = require("express");
require('dotenv').config()
const cors = require("cors");


const app = express();
const port = process.env.PORT || 5000


const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
}

// middleware
app.use(cors(corsOptions))
app.use(express.json());


app.get('/', (req, res) => {
    res.send("running")
})

app.listen(port, () => {
    console.log(`running on localhost:${port}`)
})



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_user_name}:${process.env.DB_user_Pass}@cluster0.oaba4ei.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // await client.connect();

        const candidateCollecion = client.db("ayykoriTask").collection("Candidates")
        const jobsCollecion = client.db("ayykoriTask").collection("Jobs")

        app.get("/candidates", async (req, res) => {
            const result = await candidateCollecion.find().sort({ timestamp: -1 }).toArray();
            res.send(result)
        })

        // Edit Candidate API
        app.put("/candidates/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const updatedCandidate = req.body;

                const query = { _id: new ObjectId(id) };
                const updatedResult = await candidateCollecion.updateOne(query, { $set: updatedCandidate });

                if (updatedResult.modifiedCount === 0) {
                    return res.status(404).json({ message: "Candidate not found" });
                }

                res.json(updatedCandidate);
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });

        // Delete Candidate API
        app.delete("/candidates/:id", async (req, res) => {
            try {
                const id = req.params.id;

                const query = { _id: new ObjectId(id) };
                const deleteResult = await candidateCollecion.deleteOne(query);

                if (deleteResult.deletedCount === 0) {
                    return res.status(404).json({ message: "Candidate not found" });
                }

                res.json({ message: "Candidate deleted successfully" });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });

        // Single Candidate API
        app.get("/candidates/:id", async (req, res) => {
            try {
                const id = req.params.id;

                const query = { _id: new ObjectId(id) };
                const candidate = await candidateCollecion.findOne(query);

                if (!candidate) {
                    return res.status(404).json({ message: "Candidate not found" });
                }

                res.json(candidate);
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });


        app.post("/candidate", async (req, res) => {
            const candidate = req.body;
            candidate.timestamp = new Date();
            const result = await candidateCollecion.insertOne(candidate)
            res.send(result)
        })

        // const totalCandidates = await candidatesCollection.countDocuments();
        app.get("/total-candidates", async (req, res) => {
            const result = await candidateCollecion.countDocuments();
            res.send({ totalCandidates: result });
        })



        app.get("/sortlisted-candidates", async (req, res) => {
            const shortlistedCandidates = await candidateCollecion.find({ status: "progress" }).sort({ timestamp: -1 }).toArray();
            const totalSortlistedCandidates = await candidateCollecion.countDocuments({ status: "progress" });
            res.json({
                totalSortlistedCandidates,
                shortlistedCandidates
            });
        })


        app.get("/rejected-candidates", async (req, res) => {
            const shortlistedCandidates = await candidateCollecion.find({ status: "rejected" }).sort({ timestamp: -1 }).toArray();
            const totalSortlistedCandidates = await candidateCollecion.countDocuments({ status: "rejected" });
            res.json({
                totalSortlistedCandidates,
                shortlistedCandidates
            });
        })

        app.get("/gender-filterd-candidates/:gender", async (req, res) => {
            const gender = req.params.gender
            const query = { gender: gender };

            // const gender = req.body({ gender: gender })
            const genderFilteredCandidates = await candidateCollecion.find(query).toArray();
            const totalGenderFilteredCandidates = await candidateCollecion.countDocuments(query);
            res.json({
                totalGenderFilteredCandidates,
                genderFilteredCandidates
            });
        })

        app.post("/job", async (req, res) => {
            const job = req.body;
            job.timestamp = new Date();
            const result = await jobsCollecion.insertOne(job)
            res.send(result)
        })

        app.get("/job/details/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) }
                const result = await jobsCollecion.findOne(query);

                if (!result) {
                    return res.status(404).json({ message: "Job not found" });
                }

                res.json(result);
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
        })

        app.get("/jobs/most-recent", async (req, res) => {
            try {
                const mostRecentJobs = await jobsCollecion.find().sort({ timestamp: -1 }).limit(6).toArray();

                res.json(mostRecentJobs);
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);








