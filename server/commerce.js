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
                    if (rows.length === 0) {
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
const PAGE_SIZE = 6;
app.get("/users/:id/orders", async (req, res) => {
    //user can see their own orders by item and total
    const {page} = req.query;
    const search = req.query.search || "";
    const sort = req.query.sort || "order_date";
    const order = req.query.order || "desc";
    jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
            //both admin and user can see their own orders
            if (error) {
                res.status(401).json({error: "Unauthorized"});
            } else {
                if (decoded.user.is_admin || decoded.user.id === parseInt(req.params.id)) {
                    const {rows} = await pool.query(
                        `
                            SELECT o.total,
                                   o.order_date,
                                   o.id          as "order_id",
                                   u.name        as "user_name",
                                   u.address     as "user_address",
                                   u.phone       as "user_phone",
                                   u.id          as "user_id",
                                   i.id          as "item_id",
                                   i.product_id  as "product_id",
                                   i.quantity    as "item_quantity",
                                   i.price       as "item_price",
                                   p.name        as "product_name",
                                   p.description as "product_description",
                                   p.image_url   as "product_image"
                            FROM orders o
                                     JOIN users u ON o.user_id = u.id
                                     JOIN order_items i ON o.id = i.order_id
                                     JOIN products p ON i.product_id = p.id
                            WHERE u.id = $1
                              AND (p.name ILIKE $2 OR p.description ILIKE $3)
                        `,
                        [
                            req.params.id,
                            `%${search}%`,
                            `%${search}%`,
                        ]
                    );
                    res.status(200).json({
                        status: "success",
                        message: "Orders found",
                        data: rows,
                        pagination: {
                            page: page,
                            total: rows.length,
                        },
                    });
                } else {
                    res.status(401).json({error: "Unauthorized"});
                }
            }
        }
    );
});

app.get("/users/:id/orders/:order_id", async (req, res) => {
    jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
        if (error) {
            res.status(401).json({error: "Unauthorized"});
        } else {
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

app.post("/users/:id/orders", async (req, res) => {
    const {total, order_date, user_id, order_items} = req.body;
    jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
        if (error) {
            res.status(401).json({error: "Unauthorized"});
        } else {
            if (decoded.user.id === parseInt(req.params.id)) {
                const {rows} = await pool.query(
                    "INSERT INTO orders (total,order_date,user_id) VALUES ($1,$2,$3) RETURNING *",
                    [total, order_date, user_id]
                );
                const order_id = rows[0].id;
                order_items.forEach(async (order_item) => {
                    await pool.query(
                        "INSERT INTO order_items (order_id,product_id,quantity,price) VALUES ($1,$2,$3,$4)",
                        [order_id, order_item.product_id, order_item.quantity, order_item.price]
                    );
                });
                res.status(200).json({
                    status: "success",
                    message: "order created",
                    data: rows,
                });
            } else {
                res.status(401).json({error: "Unauthorized"});
            }
        }
    });
});

app.put("/users/:id/orders/:order_id", async (req, res) => {
    const {total, order_date, user_id, order_items} = req.body;
    jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
        if (error) {
            res.status(401).json({error: "Unauthorized"});
        } else {
            if (decoded.user.id === parseInt(req.params.id)) {
                const {rows} = await pool.query(
                    "UPDATE orders SET total=$1,order_date=$2,user_id=$3 WHERE id=$4 RETURNING *",
                    [total, order_date, user_id, req.params.order_id]
                );
                await pool.query("DELETE FROM order_items WHERE order_id=$1", [req.params.order_id]);
                order_items.forEach(async (order_item) => {
                    await pool.query(
                        "INSERT INTO order_items (order_id,product_id,quantity,price) VALUES ($1,$2,$3,$4)",
                        [req.params.order_id, order_item.product_id, order_item.quantity, order_item.price]
                    );
                });
                res.status(200).json({
                    status: "success",
                    message: "order updated",
                    data: rows,
                });
            } else {
                res.status(401).json({error: "Unauthorized"});
            }
        }
    });
});

app.delete("/users/:id/orders/:order_id", async (req, res) => {
    jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
        if (error) {
            res.status(401).json({error: "Unauthorized"});
        } else {
            if (decoded.user.id === parseInt(req.params.id)) {
                await pool.query("DELETE FROM order_items WHERE order_id=$1", [req.params.order_id]);
                await pool.query("DELETE FROM orders WHERE id=$1", [req.params.order_id]);
                res.status(200).json({
                    status: "success",
                    message: "order deleted",
                });
            } else {
                res.status(401).json({error: "Unauthorized"});
            }
        }
    });
});

app.get("/products", async (req, res) => {
    const search= req.query.search||"";
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const offset = (page - 1) * limit;
    const {rows} = await pool.query(
        "SELECT * FROM products WHERE name ILIKE $1 OR description ILIKE $2 LIMIT $3 OFFSET $4",
        [`%${search}%`, `%${search}%`, limit, offset]
    );
    res.status(200).json({
        status: "success",
        message: `${rows.length} products found`,
        data: rows,
        pagination: {
            page: page,
            total: rows.length,
        }

    });
});

app.get("/products/:id", async (req, res) => {
    const {rows} = await pool.query("SELECT * FROM products WHERE id=$1", [req.params.id]);
    if (rows.length === 0) {
        res.status(404).json({
            status: "error",
            message: "product not found",
        });
    } else {
        res.status(200).json({
            status: "success",
            message: "product found",
            data: rows,
        });
    }

});

app.post("/products", async (req, res) => {
    //only admin can create product
    jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
        if (error) {
            res.status(401).json({error: "Unauthorized"});
        } else {
            if (decoded.user.role === "admin") {
                const {name, description, price, image_url} = req.body;
                const {rows} = await pool.query(
                    "INSERT INTO products (name,description,price,image_url) VALUES ($1,$2,$3,$4) RETURNING *",
                    [name, description, price, image_url]
                );
                res.status(200).json({
                    status: "success",
                    message: "product created",
                    data: rows,
                });
            } else {
                res.status(401).json({error: "Unauthorized"});
            }
        }
    });
});

app.put("/products/:id", async (req, res) => {
    //only admin can update product
    jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
        if (error) {
            res.status(401).json({error: "Unauthorized"});
        } else {
            if (decoded.user.role === "admin") {
                const {name, description, price, image_url} = req.body;
                const {rows} = await pool.query(
                    "UPDATE products SET name=$1,description=$2,price=$3,image_url=$4 WHERE id=$5 RETURNING *",
                    [name, description, price, image_url, req.params.id]
                );
                res.status(200).json({
                    status: "success",
                    message: "product updated",
                    data: rows,
                });
            } else {
                res.status(401).json({error: "Unauthorized"});
            }
        }
    });
});

app.delete("/products/:id", async (req, res) => {
    //only admin can delete product
    jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
        if (error) {
            res.status(401).json({error: "Unauthorized"});
        } else {
            if (decoded.user.role === "admin") {
                await pool.query("DELETE FROM products WHERE id=$1", [req.params.id]);
                res.status(200).json({
                    status: "success",
                    message: "product deleted",
                });
            } else {
                res.status(401).json({error: "Unauthorized"});
            }
        }
    });
});

app.get("/categories", async (req, res) => {
    const {rows} = await pool.query("SELECT * FROM categories");
    res.status(200).json({
        status: "success",
        message: `${rows.length} categories found`,
        data: rows,
    });
});

app.get("/categories/:id", async (req, res) => {
    const {rows} = await pool.query("SELECT * FROM categories WHERE id=$1", [req.params.id]);
    if (rows.length === 0) {
        res.status(404).json({
            status: "error",
            message: "category not found",
        });
    } else {
        res.status(200).json({
            status: "success",
            message: "category found",
            data: rows,
        });
    }
});

app.post("/categories", async (req, res) => {
    //only admin can create category
    jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
        if (error) {
            res.status(401).json({error: "Unauthorized"});
        } else {
            if (decoded.user.role === "admin") {
                const {name} = req.body;
                const {rows} = await pool.query(
                    "INSERT INTO categories (name) VALUES ($1) RETURNING *",
                    [name]
                );
                res.status(200).json({
                    status: "success",
                    message: "category created",
                    data: rows,
                });
            } else {
                res.status(401).json({error: "Unauthorized"});
            }
        }
    });
});

app.put("/categories/:id", async (req, res) => {
    //only admin can update category
    jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
        if (error) {
            res.status(401).json({error: "Unauthorized"});
        } else {
            if (decoded.user.role === "admin") {
                const {name} = req.body;
                const {rows} = await pool.query(
                    "UPDATE categories SET name=$1 WHERE id=$2 RETURNING *",
                    [name, req.params.id]
                );
                res.status(200).json({
                    status: "success",
                    message: "category updated",
                    data: rows,
                });
            } else {
                res.status(401).json({error: "Unauthorized"});
            }
        }
    });
});

app.delete("/categories/:id", async (req, res) => {
    //only admin can delete category
    jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
        if (error) {
            res.status(401).json({error: "Unauthorized"});
        } else {
            if (decoded.user.role === "admin") {
                await pool.query("DELETE FROM categories WHERE id=$1", [req.params.id]);
                res.status(200).json({
                    status: "success",
                    message: "category deleted",
                });
            } else {
                res.status(401).json({error: "Unauthorized"});
            }
        }
    });
});

app.get("/orders", async (req, res) => {
    //only admin can get all orders
    jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
        if (error) {
            res.status(401).json({error: "Unauthorized"});
        } else {
            if (decoded.user.role === "admin") {
                const {rows} = await pool.query("SELECT * FROM orders");
                res.status(200).json({
                    status: "success",
                    message: `${rows.length} orders found`,
                    data: rows,
                });
            } else {
                res.status(401).json({error: "Unauthorized"});
            }
        }
    });
});

app.put("/orders/:id", async (req, res) => {
    //admin and user can update order
    jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
        if (error) {
            res.status(401).json({error: "Unauthorized"});
        } else {
            if (decoded.user.role === "admin" || decoded.user.id === req.params.id) {
                const {status} = req.body;
                const {rows} = await pool.query(
                    "UPDATE orders SET status=$1 WHERE id=$2 RETURNING *",
                    [status, req.params.id]
                );
                res.status(200).json({
                    status: "success",
                    message: "order updated",
                    data: rows,
                });
            } else {
                res.status(401).json({error: "Unauthorized"});
            }
        }
    });
});

app.delete("/orders/:id", async (req, res) => {
    //only admin can delete order
    jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
        if (error) {
            res.status(401).json({error: "Unauthorized"});
        } else {
            if (decoded.user.role === "admin") {
                await pool.query("DELETE FROM orders WHERE id=$1", [req.params.id]);
                res.status(200).json({
                    status: "success",
                    message: "order deleted",
                });
            } else {
                res.status(401).json({error: "Unauthorized"});
            }
        }
    });
});

app.listen(3001, () => {
        console.log("Server is listening on port 3001");
    }
);