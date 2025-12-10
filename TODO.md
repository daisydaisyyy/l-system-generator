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
- [X] input checks!!! example: remove duplicate vars, in modal: avoid adding special chars, not permitted
- [X] fix rules input, you can insert only one character at a time :( -> fixed using blur instead of input event
- [X] rename folders, css/html/js/php
- [X] empty rule -> object appears :( -> make empty string as default
- [X] when adding a var manually and later writing it into axiom, rule is cancelled
- [X] !! remove var on axiom change -> no, otherwise any manually added var would be cancelled right after adding it because it's not present in axiominput
- [X] input checks!


UI:
- [X] show/hide menu ui
- [X] rule must be beside the movement choice in the variables section
- [X] rename css classes (config etc)
- [X] padding, background per for vars list
- [X] fix font size
- [X] fix bottom btns layout
- [?] separated menu sections: l-system setup, drawing settings

- [X] !! manuale utente (20/30 righe), da aggiungere un link alla pagina con il manuale in index.html
- [X] improve css
- [X] validate html + css
- [X] create separated files, organized in folders
- [X] remove .innerHTML, use createElement
- [X] refactor in model, controller, view

- [X] improve alert on saved drawing
- [X] lower upper bound for instructions number

backend:
- [X] php backend (save/restore drawings, user auth, session)
- [ ] review backend code
- [X] FIX SESSION HANDLING + cookies misuse
- [X] insert default presets/examples into the db
- [X] separate owner drawings from public ones, make 2 tabs in load modal
- [X] when deleting a drawing, delete its entries in rule table