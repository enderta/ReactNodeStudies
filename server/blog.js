const express = require("express");
const app = express();
const cors = require("cors");
const {Pool} = require("pg");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {check, validationResult} = require("express-validator");
const {query} = require("express");
const secret = "secret";

app.use(cors());
app.use(express.json());

//try to connect to the database and use try catch to catch any errors
const pool =
    new Pool({
        user: "cyf_ocs1_user",
        host: "dpg-cg51abceoogtrlvfttrg-a",
        database: "cyf_ocs1",
        password: "5BMhOkdU7J0MlP6RbRhsTW9cwqcICTx9",
        port: 5432,
    });



const roles = {
    admin: ['create', 'read', 'update', 'delete'],
    user: ['read', 'create'],
};

// Middleware to check for user authentication and authorization
function authMiddleware(req, res, next) {
    // Get JWT token from header
    const token = req.header('Authorization')
    console.log(token)

    // Verify JWT token
    try {
        const decoded = jwt.verify(token, secret)
        req.user = decoded.user
        next()
    } catch (err) {
        res.status(401).json({ errors: [{ msg: 'Unauthorized' }] })

    }

}

// Example endpoint that requires admin role
app.get('/admin', authMiddleware, (req, res) => {
    res.send(`Hello, ${req.user.email}. You have admin access.`);
});

// Example endpoint that requires user role
app.get('/user', authMiddleware, (req, res) => {
    res.send(`Hello, ${req.user.email}. You have user access.`);

});


//user registration endpoint with default role of user
app.post(
    "/register",
    [
        check("email", "Please include a valid email").isEmail(),
        check(
            "password",
            "Please enter a password with 6 or more characters"
        ).isLength({min: 6}),
        check("username", "Please enter a name").isLength({min: 1}),
check("role", "Please enter a role").isLength({min: 1}),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        const {email, password, username, role} = req.body;
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const result = await pool.query("SELECT * FROM users WHERE email = $1", [
                email,
            ]);
            if (result.rows.length > 0) {
                return res
                    .status(400)
                    .json({errors: [{msg: "User already exists"}]});
            }
            const query = "INSERT INTO users (email, password, username, role) VALUES ($1, $2, $3, $4) RETURNING *";
            const values = [email, hashedPassword, username, role];
            await pool.query(query, values);
            res.status(201).json({
                message: "User created",
                data: {
                    email,
                    password,
                    username,
                    role,
                },
            });
        } catch (err) {
            //eslint-disable-next-line
            console.error(err);
            res.status(500).json({errors: [{msg: "Server error"}]});
        }
    }
);

//login endpoint
app.post(
    "/login",
    [
        check("email", "Please include a valid email").isEmail(),
        check("password", "Password is required").exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        const {email, password} = req.body;

        try {
            const {rows} = await pool.query(
                "SELECT * FROM users WHERE email = $1",
                [email]
            );
            if (rows.length === 0) {
                return res.status(400).json({
                    errors: [{msg: "Invalid credentials"}],
                });
            }
            const isMatch = await bcrypt.compare(password, rows[0].password);
            if (!isMatch) {
                return res.status(400).json({
                    errors: [{msg: "Invalid credentials"}],
                });
            }
            const token = jwt.sign(
                {
                    user: {
                        id: rows[0].id,
                        email: rows[0].email,
                        username: rows[0].username,
                        role: rows[0].role,
                    },
                },
                secret,
                {expiresIn: "1h"}
            );
            res.status(200).json({
                status: "success",
                message: "User logged in",
                data: {
                    token,
                    role: rows[0].role,
                },
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);

//get all users endpoint only for admin
app.get("/users", authMiddleware, async (req, res) => {
   //only admin can access this endpoint
    if (req.user.role !== "admin") {
        return res.status(403).send("Forbidden");
    }
    try {
        const {rows} = await pool.query("SELECT * FROM users");
        res.status(200).json({
            status: "success",
            message: `${rows.length} users retrieved`,
            data: {
                users: rows,
            },
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

//get a single user endpoint only for admin
app.get("/users/:id", authMiddleware, async (req, res) => {
    //only admin can access this endpoint
    if (req.user.role !== "admin") {
        return res.status(403).send("Forbidden");
    }
    try {
        const {id} = req.params;
        const {rows} = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
        res.status(200).json({
            status: "success",
            message: "User retrieved",
            data: {
                user: rows[0],
            },
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

//update a user endpoint only for admin
app.put("/users/:id", authMiddleware, async (req, res) => {
    //only admin can access this endpoint
    if (req.user.role !== "admin") {
        return res.status(403).send("Forbidden");
    }
    try {
        const {id} = req.params;
        const {email, username, role} = req.body;
        const {rows} = await pool.query(
            "UPDATE users SET email = $1, username = $2, role = $3 WHERE id = $4 RETURNING *",
            [email, username, role, id]
        );
        res.status(200).json({
            status: "success",
            message: "User updated",
            data: {
                user: rows[0],
            },
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

//delete a user endpoint only for admin
app.delete("/users/:id", authMiddleware, async (req, res) => {
    //only admin can access this endpoint
    if (req.user.role !== "admin") {
        return res.status(403).send("Forbidden");
    }
    try {
        const {id} = req.params;
        await pool.query("DELETE FROM users WHERE id = $1", [id]);
        res.status(200).json({
            status: "success",
            message: "User deleted",
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// create a blog post
app.post(
    "/blog",
    [
        check("title", "Please enter a title").isLength({min: 1}),
        check("content", "Please enter some content").isLength({min: 1}),
        check("author", "Please enter an author").isLength({min: 1}),
    ],
    authMiddleware,
    async (req, res) => {
        //only admin can access this endpoint
        if (req.user.role !== "admin") {
            return res.status(403).send("Forbidden");
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        const {title, content, author, image_url} = req.body;
        try {
            const {rows} = await pool.query(
                "insert into blog_posts (title,content,author,image_url) values ($1,$2,$3,$4) RETURNING *",
                [title, content, author, image_url]
            );
            res.status(201).json({
                status: "success",
                message: "Blog post created",
                data: {
                    id: rows[0].id,
                    title: rows[0].title,
                    content: rows[0].content,
                    image_url: rows[0].image_url,
                    created_at: rows[0].created_at,
                }
            });
        } catch (err) {
            console.error(err.message)
            res.status(500).send("Server error");

        }
    }
);

//get all blog posts
app.get("/blog", async (req, res) => {
    const search = req.query.search || "";
    try {
        if (search) {
            const {rows} = await pool.query(
                //search by title, content, author
                "SELECT * FROM blog_posts WHERE title ILIKE $1 OR content ILIKE $2 OR author ILIKE $3 ORDER BY created_at DESC",
                [`%${search}%`, `%${search}%`, `%${search}%`]
            );
            res.status(200).json({
                status: "success",
                message: `${rows.length} blog posts found for search term: ${search}`,
                data: {
                    rows
                }
            });
        } else {
            const {rows} = await pool.query(
                "SELECT * FROM blog_posts ORDER BY created_at DESC"
            );
            res.status(200).json({
                status: "success",
                message: `${rows.length} blog posts`,
                data: {
                    rows
                }
            });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

//get a single blog post
app.get("/blog/:id", async (req, res) => {
    try {
        const {rows} = await pool.query(
            "SELECT * FROM blog_posts WHERE id = $1",
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "Blog post not found",
            });
        }
        res.status(200).json({
            status: "success",
            message: "Blog post",
            data: {
                rows
            }

        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

//update a blog post
app.put("/blog/:id", authMiddleware, async (req, res) => {
    //only admin can access this endpoint
    if (req.user.role !== "admin") {
        return res.status(403).send("Forbidden");
    }
    try {
        const {id} = req.params;
        const {title, content, author, image_url} = req.body;
        const {rows} = await pool.query(
            "UPDATE blog_posts SET title = $1, content = $2, author = $3, image_url = $4 WHERE id = $5 RETURNING *",
            [title, content, author, image_url, id]
        );
        if (rows.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "Blog post not found",
            });
        }
        res.status(200).json({
            status: "success",
            message: "Blog post updated",
            data: {
                rows
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }

});

//delete a blog post
app.delete("/blog/:id", authMiddleware, async (req, res) => {
    //only admin can access this endpoint
    if (req.user.role !== "admin") {
        return res.status(403).send("Forbidden");
    }
    try {
        const {rows} = await pool.query(
            "DELETE FROM blog_posts WHERE id = $1 RETURNING *",
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "Blog post not found",
            });
        }
        res.status(200).json({
            status: "success",
            message: "Blog post deleted",
            data: rows[0],
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

app.listen(5000, () => {
    console.log("Server is listening on port 5000");
});
