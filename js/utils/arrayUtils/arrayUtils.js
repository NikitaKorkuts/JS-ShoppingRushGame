Array.prototype.randomElement = function() {
    return this.length > 0 ? this[Math.floor(Math.random() * this.length)] : null;
}