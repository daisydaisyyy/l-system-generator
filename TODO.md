frontend:
- [X] fix auto-center drawing
- [X] add custom rules for each var selectable from a select element if nedeed (example: chars always continue drawing, but in some drawings x and y do nothing).
    - should recognize the vars present in "axioms" and dynamically add rules with a slidebar.
    - implementation: superclass "movement" and every type of it (drawLine, drawDot, MoveTo...) inherits from it
- [X] optimize animateDrawing
- [X] fix responsive canvas when resizing
- [X] auto centering by default
- [X] line width dependant on scale
- [X] checkbox to show animation
- [X] auto zoom
- [X] fix rules adding and input change events
- [X] manually add variables using the + button
- [ ] input checks!!! example: remove duplicate vars
- [X] fix rules input, you can insert only one character at a time :( -> fixed using blur instead of input event
- [X] rename folders, css/html/js/php
- [ ] validate html + css
- [X] empty rule -> object appears :( -> make empty string as default
- [X] when adding a var manually and later writing it into axiom, rule is cancelled

UI:
- [X] show/hide menu ui
- [ ] divide menu sections: l-system setup, drawing settings
- [X] rule must be beside the movement choice in the variables section
- [X] rename css classes (config etc)
- [X] padding, background per for vars list
- [X] fix font size
- [X] fix bottom btns layout
- [ ] improve alert??



backend:
- [ ] php backend (save/restore drawings, user auth, session)
- [ ] fix compression/decompression drawing params (-> base64)
- [ ] make an examples list, the user clicks on it and it automatically sets drawing parameters (fetched from db? or pre-stored in an examples folder?)