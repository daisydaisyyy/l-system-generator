- [X] fix auto-center drawing
- [ ] add a variables system + custom rules if nedeed (example: chars always continue drawing, but in some drawings x and y do nothing)
- [ ] implement auto-zoom in auto-center function so that the drawing won't be outside the canvas
- [ ] optimize animateDrawing
- [X] fix responsive canvas when resizing
- [ ] fix compression/decompression drawing params (-> base64)
- [ ] php backend (save/restore drawings, user auth, session)
- [ ] make an examples list, the user clicks on it and it automatically sets drawing parameters (imported from db? or pre-stored in an examples folder?)
- [X] check selection feature, current mode: before starting, restores coords to previous custom value if "no centering" is selected (after their change being on centering); and when animation ends with centering selected, it keeps centered coords.
- [ ] make better UI/UX (experience!)
- [X] line width dependant on scale
- [ ] slider for zoom param, fixed values
- [X] checkbox to show animation

when pausing, config params are disabled and re-enabled when resuming (it results in re-enabling when the animation is finished -> that was the intended behaviour, nice!)