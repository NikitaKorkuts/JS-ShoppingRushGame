class ProductCard {
    static create(name, image) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <style>
                .product-card {
                    width: 100px; 
                    transition: all 0.1s ease;
                } 
                .product-card_img {
                    height: 100px; 
                    overflow: hidden;
                }
                .product-card img {
                    width: 100%; 
                    height: 100%; 
                    object-fit: cover;
                    object-position: center; 
                }
        
                .product-card p {
                    margin-top: -2px;
                    text-align: center;
                }
            </style>
            <div class="product-card_img" >
                <img draggable="false" oncontextmenu="return false;" src="${image}" alt="${name}">
            </div>
            <p>${name}</p>
            `;
        return card;
    }
}