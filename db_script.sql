
CREATE TABLE user (
    username VARCHAR(64) PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    is_admin TINYINT(1) DEFAULT 0
);

CREATE TABLE drawing (
    name VARCHAR(128) NOT NULL,
    owner VARCHAR(64) NOT NULL,
    axiom VARCHAR(255) NOT NULL,
    depth INT NOT NULL,
    angle DOUBLE NOT NULL,
    starting_rot DOUBLE DEFAULT 0,
    line_width DOUBLE DEFAULT 1,
    scale DOUBLE DEFAULT 1,
    is_public TINYINT(1) DEFAULT 0,
    FOREIGN KEY (owner) REFERENCES user(username) ON DELETE CASCADE,
    PRIMARY KEY(name, owner)
);


CREATE TABLE rule (
    id INT AUTO_INCREMENT PRIMARY KEY,
    variable VARCHAR(8) NOT NULL,
    drawing_name VARCHAR(128) NOT NULL,
    replacement TEXT NOT NULL,
    movement_type VARCHAR(20) NOT NULL DEFAULT 'drawLine',
    color VARCHAR(7) NOT NULL DEFAULT '#000000' AFTER movement_type
);

CREATE TABLE drawing_rule (
    drawing_name VARCHAR(128) NOT NULL,
    owner VARCHAR(64) NOT NULL,
    rule INT NOT NULL,
    FOREIGN KEY (drawing_name, owner) REFERENCES drawing(name, owner) ON DELETE CASCADE,
    FOREIGN KEY (rule) REFERENCES rule(id) ON DELETE CASCADE,
    PRIMARY KEY(drawing_name, owner, rule)
);


