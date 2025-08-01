# web_l-system
A  web application for procedurally generating and visualizing plant growth using L‑Systems.

1. l-system genome generation
a l-system is defined by:
- axiom (initial string)
- production rules (mappings that rewrite each symbol)
- depth

2. graphic renderer

drawing commands:
```
F: draw forward one segment
+: turn right by θ degrees
-: turn left by θ degrees
[: push current position & angle onto stack
]: pop position & angle from stack
```
3. genome compression and persistence: save and reload plant configurations 

#### Structure:
Login / Signup: users register or log in, PHP creates a session.

Configuration: users enter their axiom, rules, depth, and angle, then click Start

Generate & Draw: animate the plant growth

Save: sends the compressed genome to /api/save.php, where PHP stores it in the plants table using prepared statements.

Load: on page load (or when opening the save panel), JS fetches /api/load.php, PHP returns all saved genomes for that user, and JS can decode and render small previews or provide “Load” buttons.

Delete: issues a DELETE request to /api/delete.php?id=…, removing that record.


```
project/
├── index.html
├── style.css
├── l-system.js
├── compressor.js
├── script.js
├── db/
│   ├── connection.php
│   └── schema.sql
├── api/
│   ├── signup.php
│   ├── login.php
│   ├── save.php
│   ├── load.php
│   ├── delete.php
│   └── random.php
└── utils/
    ├── session.php
    └── validate.php
```

references:
```
https://it.wikipedia.org/wiki/Sistema_di_Lindenmayer
https://en.wikipedia.org/wiki/L-system
https://github.com/fura2/L-system
https://fedimser.github.io/l-systems.html
```