# web_l-system
A web application for procedurally generating and visualizing plant growth using L‑Systems.

1. l-system genome generation
a l-system is defined by:
- axiom (initial string)
- production rules (mappings that rewrite each symbol)
- depth
- angle

2. graphic renderer
The user can customize the scale (zoom), line width, and starting rotation, and can pause the animation or disable it entirely.

Symbols:
The user can choose custom movement commands to assign to other variables.
Variables must be one-character long and can be any character that is not a special command (as defined below), regex: /[^\[\]+\-=;]/

fixed drawing commands:
```
+: turn right by θ degrees
-: turn left by θ degrees
[: push current position & angle onto stack
]: pop position & angle from stack
```

#### Structure:
Login / Signup: users register or log in, PHP creates a session.

Configuration: users enter their axiom, rules, depth, and angle, then click Start

Generate + Draw: animate the plant growth, auto-centering the drawing is done by default.

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