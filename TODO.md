frontend:
- [X] fix auto-center drawing
- [X] add custom rules for each var selectable from a select element if nedeed (example: chars always continue drawing, but in some drawings x and y do nothing).
    - should recognize the vars present in "axioms" and dynamically add rules with a slidebar.
    - implementation: superclass "movement" and every type of it (drawLine, drawDot, MoveTo...) inherits from it
- [X] optimize animateDrawing
- [X] fix responsive canvas when resizing
- [X] check selection feature, current mode: before starting, restores coords to previous custom value if "no centering" is selected (after their change being on centering); and when animation ends with centering selected, it keeps centered coords.
- [ ] make better UI/UX (experience!)
- [X] line width dependant on scale
- [ ] slider for zoom param with fixed values
- [X] checkbox to show animation

backend:
- [ ] php backend (save/restore drawings, user auth, session)
- [ ] fix compression/decompression drawing params (-> base64)
- [ ] make an examples list, the user clicks on it and it automatically sets drawing parameters (fetched from db? or pre-stored in an examples folder?)