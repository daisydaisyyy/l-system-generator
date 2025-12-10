# L-System Generator webapp - frontend version
A web application for procedurally generating and visualizing plant growth using L‑Systems.
This is the frontend version!

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
[: save current position and angle
]: restore position and angle
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
└── js/
    ├── main.js
    ├── utils.js
    ├── controllers/
    │   ├── canvasController.js
    │   ├── configController.js
    │   └── state.js
    ├── models/
    │   ├── l-system.js
    │   └── Variable.js
    └── views/
        ├── canvas.js
        ├── dom.js
        └── ui.js

```

#### references:
big kudos to:
```
https://github.com/fura2/L-system
https://fedimser.github.io/l-systems.html
https://en.wikipedia.org/wiki/L-system
https://it.wikipedia.org/wiki/Sistema_di_Lindenmayer
```
