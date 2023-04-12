const express = require("express");
const app = express();
const cors = require("cors");
const {Pool} = require("pg");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {check, validationResult} = require("express-validator");
const secret = "secret";

app.use(cors());
app.use(express.json());
pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "commerce",
    password: "ender",
    port: 5432,
});

// register user
app.post(
    "/register",
    [
        check("email", "Please include a valid email").isEmail(),
        check(
            "password",
            "Please enter a password with 6 or more characters"
        ).isLength({min: 6}),
        check("name", "Please enter a name").isLength({min: 1}),
        check("address", "Please enter an address").isLength({min: 1}),
        check("phone", "Please enter a phone number").isLength({min: 1}),
        check("is_admin", "Please enter a boolean value").isBoolean(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const {email, password, name, address, phone, is_admin} = req.body;

        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const {rows} = await pool.query(
                "INSERT INTO users (email, password, name, address, phone, is_admin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
                [email, hashedPassword, name, address, phone, is_admin]
            );
            const token = jwt.sign(
                {
                    user: {
                        id: rows[0].id,
                        email: rows[0].email,
                        name: rows[0].name,
                        address: rows[0].address,
                        phone: rows[0].phone,
                        is_admin: rows[0].is_admin,
                    },
                },
                secret,
                {expiresIn: "1h"}
            );
            res.status(201).json({
                status: "success",
                message: "User created",
                data: {
                    token,
                    id: rows[0].id,
                    name: rows[0].name,
                    email: rows[0].email,
                    address: rows[0].address,
                    phone: rows[0].phone,
                    is_admin: rows[0].is_admin
                },
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);

// login user
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
                        name: rows[0].name,
                        address: rows[0].address,
                        phone: rows[0].phone,
                        is_admin: rows[0].is_admin,
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
                    is_admin: rows[0].is_admin,
                },
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);
//only admin can get all users
//10 users per page
let page = 1;
app.get("/users", async (req, res) => {
    jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
            if (error) {
                res.status(401).json({error: "Unauthorized"});
            } else {
                if (!decoded.user.is_admin) {
                    res.status(401).json({error: "Unauthorized"});

                    return;
                }
                console.log(decoded.user)
                const searchTerm = req.query.search;
                let query = "SELECT * FROM users";

                if (searchTerm) {
                    const escapedSearchTerm = `%${searchTerm}%`;
                    query += " WHERE name ILIKE $1 OR email ILIKE $1";
                    const {rows} = await pool.query(query, [escapedSearchTerm]);
                   if(rows.length === 0) {
                       res.status(404).json({
                           status: "fail",
                           message: "No users found"
                       })
                   } else {
                       res.status(200).json({
                           status: "success",
                           message: `Users matching search term: ${searchTerm}`,
                           data: rows,
                       });
                   }
                } else {
                    query += " LIMIT 10 OFFSET $1";
                    const {rows} = await pool.query(query, [(page - 1) * 10]);
                    res.status(200).json({
                        status: "success",
                        message: "All users",
                        data: rows,
                        page: page,
                        total: rows.length,
                    });
                }
            }
        }
    )
});

//only admin can get a user
app.get("/users/:id", async (req, res) => {
    jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
        if (error) {
            res.status(401).json({error: "Unauthorized"});
        } else {
            if (!decoded.user.is_admin) {
                res.status(401).json({error: "Unauthorized"});
                return;
            }
            const {rows} = await pool.query(
                "SELECT * FROM users WHERE id = $1",
                [req.params.id]
            );
            if (rows.length === 0) {
                res.status(404).json({
                    status: "error",
                    message: "User not found",
                });
            } else {
                res.status(200).json({
                    status: "success",
                    message: "User found",
                    data: rows[0],
                });
            }
        }
    });
});

//only admin can update a user
app.put("/users/:id", async (req, res) => {
    jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
            if (error) {
                res.status(401).json({error: "Unauthorized"});
            } else {
                if (!decoded.user.is_admin) {
                    res.status(401).json({error: "Unauthorized"});
                    return;
                }
                const {email, password, name, address, phone, is_admin} = req.body;
                const {rows} = await pool.query(
                    "SELECT * FROM users WHERE id = $1",
                    [req.params.id]
                );
                if (rows.length === 0) {
                    res.status(404).json({
                        status: "error",
                        message: "User not found",
                    });
                }
                if (email) {
                    const {rows} = await pool.query(
                        "SELECT * FROM users WHERE email = $1",
                        [email]
                    );
                    if (rows.length > 0) {
                        res.status(400).json({
                            status: "error",
                            message: "Email already exists",
                        });
                        return;
                    }
                }
                if (password) {
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(password, salt);
                    await pool.query(
                        "UPDATE users SET password = $1 WHERE id = $2",
                        [hashedPassword, req.params.id]
                    );
                }
                if (name) {
                    await pool.query(
                        "UPDATE users SET name = $1 WHERE id = $2",
                        [name, req.params.id]
                    );
                }
                if (address) {
                    await pool.query(
                        "UPDATE users SET address = $1 WHERE id = $2",
                        [address, req.params.id]
                    );
                }
                if (phone) {
                    await pool.query(
                        "UPDATE users SET phone = $1 WHERE id = $2",
                        [phone, req.params.id]
                    );
                }
                if (is_admin) {
                    await pool.query(
                        "UPDATE users SET is_admin = $1 WHERE id = $2",
                        [is_admin, req.params.id]
                    );
                }
                res.status(200).json({
                    status: "success",
                    message: "User updated",
                });

            }
        }
    );
});

//only admin can delete a user
app.delete("/users/:id", async (req, res) => {
        jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
            if (error) {
                res.status(401).json({error: "Unauthorized"});
            } else {
                if (!decoded.user.is_admin) {
                    res.status(401).json({error: "Unauthorized"});
                    return;
                }
                const {rows} = await pool.query(
                    "SELECT * FROM users WHERE id = $1",
                    [req.params.id]
                );
                if (rows.length === 0) {
                    res.status(404).json({
                        status: "error",
                        message: "User not found",
                    });
                } else {
                    await pool.query("DELETE FROM users WHERE id = $1", [
                        req.params.id,
                    ]);
                    res.status(200).json({
                        status: "success",
                        message: "User deleted",
                    });
                }
            }
        });
    }
);

app.get("/users/:id/orders", async (req, res) => {
    jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
        if (error) {
            res.status(401).json({error: "Unauthorized"});
        } else {
            if (!decoded.user.is_admin) {
                res.status(401).json({error: "Unauthorized"});
                return;
            }
            const {rows} = await pool.query(
                //select o.total,o.order_date,u.name as "user_name",u.*,i.*,p.*,i.* from orders o join users u on o.user_id=u.id join order_items i on i.order_id=o.id join products p on i.product_id=p.id where u.id=1;
                "SELECT o.total,o.order_date,u.name as \"user_name\",u.*,i.id as \"item_id\",i.product_id,i.quantity,i.price,p.*,u.id as \"user_id\" FROM orders o JOIN users u ON o.user_id=u.id JOIN order_items i ON i.order_id=o.id JOIN products p ON i.product_id=p.id WHERE u.id=$1",
                [req.params.id]
            );
            if (rows.length === 0) {
                res.status(404).json({
                    status: "error",
                    message: "orders not found",
                });
            } else {
                res.status(200).json({
                    status: "success",
                    message: "orders found",
                    data: rows,
                });
            }
        }
    });
});

app.get("/users/:id/orders/:order_id", async (req, res) => {
    jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
        if (error) {
            res.status(401).json({error: "Unauthorized"});
        } else {
            if (!decoded.user.is_admin) {
                res.status(401).json({error: "Unauthorized"});
                return;
            }
            const {rows} = await pool.query(
                "SELECT o.total,o.order_date,o.id as \"order_id\",u.name as \"user_name\",u.*,i.id as \"item_id\",i.product_id,i.quantity,i.price,p.*,u.id as \"user_id\" FROM orders o JOIN users u ON o.user_id=u.id JOIN order_items i ON i.order_id=o.id JOIN products p ON i.product_id=p.id WHERE u.id=$1 AND o.id=$2",
                [req.params.id, req.params.order_id]
            );
            if (rows.length === 0) {
                res.status(404).json({
                    status: "error",
                    message: "order not found",
                });
            } else {
                res.status(200).json({
                    status: "success",
                    message: "order found",
                    data: rows,
                });
            }
        }   
    });
});

//only admin can delete a user
app.delete("/users/:id", async (req, res) => {
    jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
        if (error) {
            res.status(401).json({error: "Unauthorized"});
        } else {
            if (!decoded.user.is_admin) {
                res.status(401).json({error: "Unauthorized"});
                return;
            }
            const {rows} = await pool.query(
                "SELECT * FROM users WHERE id = $1",
                [req.params.id]
            );
            if (rows.length === 0) {
                res.status(404).json({
                    status: "error",
                    message: "User not found",
                });
            } else {
                await pool.query("DELETE FROM users WHERE id = $1", [
                    req.params.id,
                ]);
                res.status(200).json({
                    status: "success",
                    message: "User deleted",
                });
            }
        }
    });
});



app.listen(3001, () => {
        console.log("Server is listening on port 3001");
    }
);