# L-System Generator webapp
A web application for procedurally generating and visualizing plant growth using L‑Systems.


#### Some examples!
<p align="center">
<img src="https://github.com/user-attachments/assets/03957cd9-a305-46a3-9277-dac4ee5f253a" height="180" alt="img4" />
<img src="https://github.com/user-attachments/assets/ba1c7c9c-727d-4ad8-8b3f-dcf9056f12a3" height="180" alt="img3" />
<img src="https://github.com/user-attachments/assets/e3b640de-a015-43db-b047-bbef80f3ac07" height="180" alt="img2" />
<img height="180" alt="Screenshot 2026-02-19 at 22-28-50 L-system generator" src="https://github.com/user-attachments/assets/ef9c3c1d-f188-466f-958e-c72132fc855b" />
<img src="https://github.com/user-attachments/assets/9762fa3d-ea26-47ae-b06b-af4d394a3ee1" height="180" alt="img1" />
<img height="180" alt="img6" src="https://github.com/user-attachments/assets/ef63844a-fd7c-49ea-a32d-4d12e826dd8c" />
<img height="180" alt="img7" src="https://github.com/user-attachments/assets/8d0dba89-547d-4ecc-baeb-85e7d56ebcc7" />
</p>


#### 1. how to generate a drawing
l-systems are defined by 4 parameters:
- axiom (initial string)
- rules (transformation logic for symbols)
- depth (recursion level)
- angle (rotation between two consecutive lines)


#### 2. rules and commands
fixed drawing commands:
```
+: turn left by θ degrees
-: turn right by θ degrees 
[: save current position and angle (start branch) 
]: restore position and angle (close branch)
```

##### custom variables:
any other alphanumeric character (e.g., F, X, A, f) is a customizable variable.
you can assign specific movements to each variable:
- draw line
- move to (move without drawing)
- draw dot
- do nothing

#### 3. graphic settings
you can customize the drawing appearance:
- stroke color and width
- starting rotation
- canvas background color

#### 4. visualization features
- auto-centering and auto-scaling
- animation (show/hide and pause/restore)
- fullscreen mode (press 'f')

#### 5. saving and loading
- saving: save drawings as
  - private (visible only to you)
  - public (visible to all users)
- loading: load private saved drawings or public ones from the database

*(note: admin accounts can view all drawings, including private ones owned by other users)*


#### Structure:
```
l-system-generator/
├── db_script.sql
├── er_diagram.png
├── README.md
├── css/
│   ├── style_docs.css
│   └── style_main.css
├── html/
│   ├── docs.html
│   └── index.html
├── js/
│   ├── api.js
│   ├── main.js
│   ├── utils.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── canvasController.js
│   │   ├── configController.js
│   │   ├── state.js
│   │   └── storageController.js
│   ├── models/
│   │   ├── l-system.js
│   │   └── Variable.js
│   └── views/
│       ├── canvas.js
│       ├── dom.js
│       └── ui.js
└── php/
    ├── check_session.php
    ├── db.php
    ├── delete_drawing.php
    ├── list_drawings.php
    ├── load_drawing.php
    ├── login.php
    ├── logout.php
    ├── register.php
    └── save_drawing.php
```

#### References:
big kudos to:
```
https://github.com/fura2/L-system
https://fedimser.github.io/l-systems.html
https://en.wikipedia.org/wiki/L-system
https://it.wikipedia.org/wiki/Sistema_di_Lindenmayer
```
