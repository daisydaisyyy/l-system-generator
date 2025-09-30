# web_l-system
A web application for procedurally generating and visualizing plant growth using L‑Systems.

1. l-system generation
a l-system is defined by:
- axiom (initial string)
- production rules (mappings that rewrite each symbol)
- depth
- angle

2. graphic renderer
the user can customize:
- variables rules, movement and stroke color
- depth
- line width
- starting rotation
- background color


other features:
- show/hide animation
- can pause the animation or disable it entirely
- fullscreen mode
- auto-centering and auto-scaling the drawing is done by default

Symbols:
The user can choose custom movement commands to assign to variables.
Variables must be one alphanumeric character long and can be any character that is not a special command (as defined below)

fixed drawing commands:
```
+: turn right by θ degrees
-: turn left by θ degrees
[: push current position & angle onto stack
]: pop position & angle from stack
```

#### Structure:
```
web_l-system/
├── index.html
├── style.css
├── script.js
└── utils/
    ├── l-system.js
    └── Movement.js
```

This is the front-end version; the backend is still in development and will include additional features.


references:
```
https://it.wikipedia.org/wiki/Sistema_di_Lindenmayer
https://en.wikipedia.org/wiki/L-system
https://github.com/fura2/L-system
https://fedimser.github.io/l-systems.html
```