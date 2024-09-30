let blobs = [];
let labels = ['about', 'contact', 'cv', 'projects', 'art'];
let links = ['about.html', 'contact.html', 'cv.html', 'projects.html', 'art.html'];  // Links to the pages
let colors = ['#FF6347', '#4682B4', '#32CD32', '#FFD700', '#FF69B4'];  // Array of colors for each blob
let clicked = false;  // Track if a blob has been clicked to trigger the ripple effect

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight); // Full screen canvas
    canvas.parent('interactive-area');  // Attach the canvas to the div

    // Manually set blob positions and sizes
    let blobData = [
        { x: width / 2 + 150, y: height / 2 - 100, size: 100, noiseSeedOffset: 1000 },  // Red Blob for 'about'
        { x: width / 2 + 230, y: height / 2 - 130, size: 90, noiseSeedOffset: 2000 },   // Green Blob for 'contact'
        { x: width / 2 + 300, y: height / 2 - 20, size: 120, noiseSeedOffset: 3000 },   // Blue Blob for 'cv'
        { x: width / 2 + 220, y: height / 3 + 120, size: 80, noiseSeedOffset: 4000 },   // Yellow Blob for 'projects'
        { x: width / 2 + 170, y: height / 2 + 130, size: 95, noiseSeedOffset: 5000 }    // Pink Blob for 'art'
    ];

    // Create 5 blobs with specific positions, sizes, colors, and labels
    for (let i = 0; i < blobData.length; i++) {
        blobs.push(new Blob(blobData[i].x, blobData[i].y, blobData[i].size, labels[i], links[i], colors[i], blobData[i].noiseSeedOffset));
    }
}

function draw() {
    clear();  // Clear the canvas each frame
    background(255, 255, 255, 0);  // Transparent background

    let mouseIsOverBlob = false;
    
    for (let blob of blobs) {
        blob.avoidOverlap(blobs);  // Ensure the blobs don't overlap (crown shyness effect)

        // Check if the mouse is hovering over the blob
        if (!mouseIsOverBlob && blob.checkHover()) {
            mouseIsOverBlob = true;  // Mark that a blob is being hovered over
        }

        blob.update();  // Update the blob's position
        blob.show();  // Draw the organic, bean-like blob
    }

    // Ripple effect after a blob is clicked
    if (clicked) {
        for (let blob of blobs) {
            blob.rippleEffect();  // Make the blobs jiggle once after clicking
        }
        clicked = false;  // Reset the clicked state after the ripple happens
    }
}

// Ensure click detection works properly
function mousePressed() {
    for (let blob of blobs) {
        if (blob.checkClick()) {
            clicked = true;  // Trigger ripple effect on click
        }
    }
}

class Blob {
    constructor(x, y, r, label, link, color, noiseSeedOffset) {
        this.position = createVector(x, y);  // Blob's position
        this.velocity = createVector(0, 0);  // Movement speed (initially stationary)
        this.r = r;  // Radius (size) of the blob
        this.label = label;  // Text label inside the blob
        this.link = link;  // URL to navigate to when the blob is clicked
        this.color = color;  // Assign a unique color to each blob
        this.noiseSeedOffset = noiseSeedOffset;  // Assign a unique noise seed for each blob for consistent shapes
        this.isHovered = false;  // Track whether the blob is being hovered
    }

    // Check if the blob is clicked, and if so, navigate to the associated link
    checkClick() {
        let distance = dist(mouseX, mouseY, this.position.x, this.position.y);
        if (distance < this.r) {
            // Redirect to the associated section (about, contact, etc.)
            window.open(this.link, "_self");  // Open link in the same window/tab
            return true;  // Blob is clicked, return true
        }
        return false;  // Blob wasn't clicked
    }

    // Check if the blob is hovered by the mouse
    checkHover() {
        let distance = dist(mouseX, mouseY, this.position.x, this.position.y);
        this.isHovered = distance < this.r;
        return this.isHovered;
    }

    // Avoid overlapping with other blobs (crown shyness effect)
    avoidOverlap(otherBlobs) {
        for (let other of otherBlobs) {
            if (other !== this) {  // Avoid checking against itself
                let distance = p5.Vector.dist(this.position, other.position);  // Calculate distance to other blob
                let minDistance = this.r + other.r + 10;  // Set the minimum allowed distance between blobs

                if (distance < minDistance) {
                    // Calculate repulsion force to push blobs apart
                    let repulsion = p5.Vector.sub(this.position, other.position);  
                    repulsion.setMag((minDistance - distance) * 0.5);  // Increase repulsion force
                    this.velocity.add(repulsion);  // Apply the repulsion force to the blob's velocity
                }
            }
        }
    }

    // Move slightly toward a hovered blob (clustering effect)
    subtleClusterWithHover(otherBlobs) {
        for (let other of otherBlobs) {
            if (other !== this && other.isHovered) {  // Check if another blob is hovered
                let attraction = p5.Vector.sub(other.position, this.position);  // Attraction vector towards the hovered blob
                attraction.setMag(0.1);  // Make the attraction subtle
                this.velocity.add(attraction);  // Apply the attraction to the velocity
            }
        }
    }

    // Ripple effect after clicking a blob (quick jiggle)
    rippleEffect() {
        let rippleForce = p5.Vector.random2D().mult(5);  // Random small force
        this.velocity.add(rippleForce);  // Apply ripple force to the blob's velocity
    }

    // Update the blob's position based on velocity (also applying friction to slow it down)
    update() {
        this.position.add(this.velocity);  // Add velocity to position for movement
        this.velocity.mult(0.85);  // Apply more friction to reduce jittering over time
    }

    // Draw the organic, bean-like blob shape and display its label or link tooltip
    show() {
        noStroke();  // No border for the blobs
        fill(this.color);  // Set the color for the blob

        // Use the fixed noiseSeedOffset to create the same shape every time
        noiseSeed(this.noiseSeedOffset);  // Set a consistent seed for Perlin noise
        beginShape();  // Start creating the blob shape
        let noiseScale = 0.05;  // Adjust the noise scale for smoother blob shapes
        for (let angle = 0; angle < TWO_PI; angle += radians(3)) {
            let offsetR = this.r + noise(angle * noiseScale) * 20;  // Adjust blob shape to be more uniform and smooth
            let xoff = cos(angle) * offsetR;
            let yoff = sin(angle) * offsetR;
            vertex(this.position.x + xoff, this.position.y + yoff);
        }
        endShape(CLOSE);

        // Show the page link as a tooltip when hovered
        if (this.isHovered) {
            fill(0);  // Black text for the tooltip
            textAlign(CENTER, CENTER);  // Center the text inside the tooltip
            textSize(18);  // Adjust text size to fit
            text(this.label, this.position.x, this.position.y - this.r - 20);  // Display label as tooltip above the blob
        }
    }
}