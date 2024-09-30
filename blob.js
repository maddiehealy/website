let blobs = [];
let labels = ['about', 'contact', 'cv', 'projects', 'art'];
let colors = ['#FF6347', '#4682B4', '#32CD32', '#FFD700', '#FF69B4'];  // Array of colors for each blob

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight); // Full screen canvas
    canvas.parent('interactive-area');  // Attach the canvas to the div

    // Blob positions more oriented toward the center-right
    let positions = [
        { x: width / 2 + 100, y: height / 2 - 100 },
        { x: width / 2 + 200, y: height / 2 - 200 },
        { x: width / 2 + 300, y: height / 2 },
        { x: width / 2 + 250, y: height / 3 + 150 },
        { x: width / 2 + 150, y: height / 2 + 250 }
    ];

    // Create 5 blobs with different positions, colors, and organic shapes
    for (let i = 0; i < 5; i++) {
        blobs.push(new Blob(positions[i].x, positions[i].y, random(80, 120), labels[i], `#${labels[i]}`, colors[i]));  // Adding unique colors for each blob
    }
}

function draw() {
    clear();  // Clear the canvas each frame
    background(255, 255, 255, 0);  // Transparent background

    // Loop through each blob and apply behaviors
    for (let blob of blobs) {
        blob.avoidOverlap(blobs);  // Ensure the blobs don't overlap (crown shyness effect)
        blob.subtleShiftWithMouse();  // Shift slightly in response to the mouse's position
        blob.update();  // Update the blob's position
        blob.show();  // Draw the organic, bean-like blob
    }
}

// Ensure click detection works properly
function mousePressed() {
    // Check if any blob is clicked and redirect to its associated link
    for (let blob of blobs) {
        blob.checkClick();
    }
}

class Blob {
    constructor(x, y, r, label, link, color) {
        this.position = createVector(x, y);  // Blob's position
        this.velocity = createVector(0, 0);  // Movement speed (initially stationary)
        this.r = r;  // Radius (size) of the blob
        this.label = label;  // Text label inside the blob
        this.link = link;  // URL to navigate to when the blob is clicked
        this.noiseOffset = random(1000);  // Random offset for Perlin noise to give each blob a unique shape
        this.color = color;  // Assign a unique color to each blob
        this.isHovered = false;  // Track whether the blob is being hovered
    }

    // Check if the blob is clicked, and if so, navigate to the associated link
    checkClick() {
        let distance = dist(mouseX, mouseY, this.position.x, this.position.y);
        if (distance < this.r) {
            // Redirect to the associated section (about, contact, etc.) when clicked
            window.location.href = this.link;  
        }
    }

    // Avoid overlapping with other blobs (crown shyness effect)
    avoidOverlap(otherBlobs) {
        for (let other of otherBlobs) {
            if (other !== this) {  // Avoid checking against itself
                let distance = p5.Vector.dist(this.position, other.position);  // Calculate distance to other blob
                let minDistance = this.r + other.r + 20;  // Set the minimum allowed distance between blobs

                if (distance < minDistance) {
                    // If blobs are too close, calculate repulsion force to push them apart
                    let repulsion = p5.Vector.sub(this.position, other.position);  
                    repulsion.setMag((minDistance - distance) * 0.1);  // Stronger repulsion as they get closer
                    this.velocity.add(repulsion);  // Apply the repulsion force to the blob's velocity
                }
            }
        }
    }

    // Method to make the blob slightly respond to mouse movements without following it completely
    subtleShiftWithMouse() {
        let mousePos = createVector(mouseX, mouseY);  // Get the current mouse position
        let distanceToMouse = p5.Vector.dist(this.position, mousePos);  // Calculate distance from blob to mouse
        
        // Only apply the shift if the mouse is within a certain range (say 300 pixels)
        if (distanceToMouse < 300) {
            // Calculate a small force to nudge the blob slightly towards the mouse
            let force = p5.Vector.sub(mousePos, this.position);
            force.setMag(0.01);  // Very subtle shift
            this.velocity.add(force);  // Add the force to the blob's velocity
        }

        // Check if the mouse is hovering over the blob
        this.isHovered = (distanceToMouse < this.r);
    }

    // Update the blob's position based on velocity (also applying friction to slow it down)
    update() {
        this.position.add(this.velocity);  // Add velocity to position for movement
        this.velocity.mult(0.9);  // Apply friction to slowly reduce velocity over time
    }

    // Draw the organic, bean-like blob shape with Perlin noise and display its label
    show() {
        noStroke();  // No border for the blobs
        fill(this.color);  // Set the color for the blob

        beginShape();  // Begin creating the shape
        let noiseScale = 0.1;  // Controls the smoothness of the noise
        for (let angle = 0; angle < TWO_PI; angle += radians(3)) {  // Use a small step for a smooth shape
            let offsetR = this.r + noise(this.noiseOffset + angle * noiseScale) * 40;  // Randomize radius using Perlin noise
            let xoff = cos(angle) * offsetR;  // Calculate x offset
            let yoff = sin(angle) * offsetR;  // Calculate y offset
            vertex(this.position.x + xoff, this.position.y + yoff);  // Create vertex for the blob's outline
        }
        endShape(CLOSE);  // Finish creating the shape

        // If the blob is hovered, display the label curved along the bottom inside the blob
        if (this.isHovered) {
            fill(0);  // Black text for the label
            textAlign(CENTER);  // Center the text along the curve
            textSize(20);  // Adjust text size to fit inside blobs
            
            // Curved text: Draw the label along the bottom of the blob
            let angleOffset = PI / 6;  // Closer letter spacing (you can adjust this for tighter curves)
            for (let i = 0; i < this.label.length; i++) {
                let char = this.label[i];
                let angle = map(i, 0, this.label.length, PI - angleOffset, angleOffset);  // Adjust angle for closer letters
                let charX = this.position.x + cos(angle) * (this.r - 15);  // Slight margin inside the blob
                let charY = this.position.y + sin(angle) * (this.r - 15);  // Slight margin inside the blob
                text(char, charX, charY);  // Draw each character at a different point on the curve
            }
        }
    }
}