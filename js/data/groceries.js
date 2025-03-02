const questions = [
    'Выберите продукты: ', 
    'Выберите все кроме: ',
    'Выберите все из категорий: ',
    'Выберите все кроме категорий: '
];

class Grocery {
    constructor(id, name, image) {
        this.id = id;
        this.name = name;
        this.image = image;
    }
}

class Category {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.groceries = [];
    }

    addGrocery(grocery) {
        this.groceries.push(grocery);
        grocery.type = this.name;
    }

    getGroceries() {
        return this.groceries;
    }
}

class ProductDatabase {
    constructor() {
        this.categories = [];
    }

    addCategory(category) {
        this.categories.push(category);
    }

    getCategories() {
        return this.categories;
    }

    getRandomProduct(catId = null, exceptIds = [], exceptCatIds = []) {
        return this.categories
            .filter(cat => !exceptCatIds.includes(cat.id))
            .filter(cat => !catId || cat.id === catId)
            .flatMap(cat => cat.groceries)
            .filter(g => !exceptIds.includes(g.id))
            .randomElement();
    }
}

const productDatabase = new ProductDatabase();

const fruits = new Category(1, "Фрукты");
fruits.addGrocery(new Grocery(1, "Яблоко", "media/groceryImgs/apples.jpg"));
fruits.addGrocery(new Grocery(2, "Банан", "media/groceryImgs/banan.jpg"));
fruits.addGrocery(new Grocery(3, "Апельсин", "media/groceryImgs/orange.jpg"));
fruits.addGrocery(new Grocery(4, "Груша", "media/groceryImgs/grusha.jpg"));
fruits.addGrocery(new Grocery(5, "Абрикос", "media/groceryImgs/abrikos.jpg"));

const vegetables = new Category(2, "Овощи");
vegetables.addGrocery(new Grocery(6, "Морковь", "media/groceryImgs/morkov.jpg"));
vegetables.addGrocery(new Grocery(7, "Помидор", "media/groceryImgs/tomato.jpg"));
vegetables.addGrocery(new Grocery(8, "Огурец", "media/groceryImgs/cucumber.jpg"));
vegetables.addGrocery(new Grocery(9, "Картофель", "media/groceryImgs/potato.jpg"));
vegetables.addGrocery(new Grocery(10, "Лук", "media/groceryImgs/luk.jpg"));

const dairy = new Category(3, "Молочное");
dairy.addGrocery(new Grocery(11, "Масло", "media/groceryImgs/butter.jpg"));
dairy.addGrocery(new Grocery(12, "Сыр", "media/groceryImgs/cheese.jpg"));
dairy.addGrocery(new Grocery(13, "Йогурт", "media/groceryImgs/yogurt.png"));
dairy.addGrocery(new Grocery(14, "Сметана", "media/groceryImgs/sourcream.jpg"));
dairy.addGrocery(new Grocery(15, "Творог", "media/groceryImgs/tvorog.jpg"));

const sweets = new Category(4, "Сладости");
sweets.addGrocery(new Grocery(16, "Шоколад", "media/groceryImgs/chocolate.jpg"));
sweets.addGrocery(new Grocery(17, "Леденец", "media/groceryImgs/ledenec.jpg"));
sweets.addGrocery(new Grocery(18, "Конфеты", "media/groceryImgs/sweets.jpg"));
sweets.addGrocery(new Grocery(19, "Зефир", "media/groceryImgs/zefir.png"));

const drinks = new Category(5, "Напитки");
drinks.addGrocery(new Grocery(20, "Вода", "media/groceryImgs/water.png"));
drinks.addGrocery(new Grocery(21, "Сок", "media/groceryImgs/juice.jpg"));
drinks.addGrocery(new Grocery(22, "Квас", "media/groceryImgs/kvas.jpg"));
drinks.addGrocery(new Grocery(23, "Чай", "media/groceryImgs/tea.jpg"));
drinks.addGrocery(new Grocery(24, "Вино", "media/groceryImgs/vine.jpg"));

const cereals = new Category(6, "Крупы");
cereals.addGrocery(new Grocery(25, "Рис", "media/groceryImgs/rice.jpg"));
cereals.addGrocery(new Grocery(26, "Перловка", "media/groceryImgs/perlovka.jpg"));
cereals.addGrocery(new Grocery(27, "Гречка", "media/groceryImgs/grechka.jpg"));
cereals.addGrocery(new Grocery(28, "Овсянка", "media/groceryImgs/porridge.png"));
cereals.addGrocery(new Grocery(29, "Киноа", "media/groceryImgs/kinoa.jpg"));

const nuts = new Category(7, "Орехи");
nuts.addGrocery(new Grocery(30, "Фундук", "media/groceryImgs/funduk.jpg"));
nuts.addGrocery(new Grocery(31, "Миндаль", "media/groceryImgs/mindal.jpg"));
nuts.addGrocery(new Grocery(32, "Кешью", "media/groceryImgs/keshu.jpg"));
nuts.addGrocery(new Grocery(33, "Грецкий орех", "media/groceryImgs/gretski.jpg"));
nuts.addGrocery(new Grocery(34, "Фисташки", "media/groceryImgs/fistashki.jpg"));

const meat = new Category(8, "Мясо");
meat.addGrocery(new Grocery(35, "Курица", "media/groceryImgs/chicken.jpg"));
meat.addGrocery(new Grocery(36, "Говядина", "media/groceryImgs/beef.jpg"));
meat.addGrocery(new Grocery(37, "Сосиски", "media/groceryImgs/sausages.jpg"));
meat.addGrocery(new Grocery(38, "Колбаса", "media/groceryImgs/kolbasa.jpg"));
meat.addGrocery(new Grocery(39, "Фарш", "media/groceryImgs/farsh.jpg"));

const berries = new Category(9, "Ягоды");
berries.addGrocery(new Grocery(40, "Клубника", "media/groceryImgs/strawbery.jpg"));
berries.addGrocery(new Grocery(41, "Черешня", "media/groceryImgs/chereshnya.jpg"));
berries.addGrocery(new Grocery(42, "Черника", "media/groceryImgs/chernika.jpg"));
berries.addGrocery(new Grocery(43, "Малина", "media/groceryImgs/raspberry.jpg"));

const sauces = new Category(10, "Соусы");
sauces.addGrocery(new Grocery(44, "Соевый соус", "media/groceryImgs/soysaus.jpg"));
sauces.addGrocery(new Grocery(45, "Кетчуп", "media/groceryImgs/ketchupp.jpg"));
sauces.addGrocery(new Grocery(46, "Майонез", "media/groceryImgs/mayonez.jpg"));
sauces.addGrocery(new Grocery(47, "Песто", "media/groceryImgs/pesto.jpg"));
sauces.addGrocery(new Grocery(48, "Горчица", "media/groceryImgs/gorchitsa.jpg"));

const seafood = new Category(11, "Морепродукты");
seafood.addGrocery(new Grocery(49, "Лобстер", "media/groceryImgs/lobster.jpg"));
seafood.addGrocery(new Grocery(50, "Лосось", "media/groceryImgs/losos.jpg"));
seafood.addGrocery(new Grocery(51, "Креветки", "media/groceryImgs/krevetki.jpg"));
seafood.addGrocery(new Grocery(52, "Устрицы", "media/groceryImgs/ustricy.jpg"));
seafood.addGrocery(new Grocery(53, "Селедка", "media/groceryImgs/seledka.jpg"));

const spices = new Category(12, "Приправы");
spices.addGrocery(new Grocery(54, "Корица", "media/groceryImgs/korica.jpg"));
spices.addGrocery(new Grocery(55, "Имбирь", "media/groceryImgs/imbir.jpg"));
spices.addGrocery(new Grocery(56, "Базилик", "media/groceryImgs/basilik.jpg"));
spices.addGrocery(new Grocery(57, "Черный перец", "media/groceryImgs/chernperez.jpg"));
spices.addGrocery(new Grocery(58, "Соль", "media/groceryImgs/salt.jpg"));

const flourProducts = new Category(13, "Мучное");
flourProducts.addGrocery(new Grocery(59, "Хлеб", "media/groceryImgs/bread.jpg"));
flourProducts.addGrocery(new Grocery(60, "Лаваш", "media/groceryImgs/lavash.jpg"));
flourProducts.addGrocery(new Grocery(61, "Макароны", "media/groceryImgs/macaroni.jpg"));
flourProducts.addGrocery(new Grocery(62, "Тесто", "media/groceryImgs/testo.jpg"));

productDatabase.addCategory(fruits);
productDatabase.addCategory(vegetables);
productDatabase.addCategory(dairy);
productDatabase.addCategory(sweets);
productDatabase.addCategory(drinks);
productDatabase.addCategory(cereals);
productDatabase.addCategory(nuts);
productDatabase.addCategory(meat);
productDatabase.addCategory(berries);
productDatabase.addCategory(sauces);
productDatabase.addCategory(seafood);
productDatabase.addCategory(spices);
productDatabase.addCategory(flourProducts);

class GroceriesGenerator {
    static generateProducts(params) {
        const { level, shoppingListCount = 3, groceriesCount = 6, chance = 0.25 } = params;
        
        switch(level) {
            case 1:
            case 2:
                return this.#generateBasicLevel({shoppingListCount, groceriesCount, chance});
            case 3:
            case 4:
                return this.#generateCategoryLevel({shoppingListCount, groceriesCount, chance});
            default:
                throw new Error('Invalid level');
        }
    }

    /* 
    chance=0 - один продкут гарантировано из списка, остальные на рандом, не повторяются
    chance=100 - один продукт на рандом, остальные из списка, не повторяются, если из списка все использованы, то берется на рандом
    */
    static #generateBasicLevel({shoppingListCount, groceriesCount, chance}) {
        const shoppingList = this.#getUniqueProducts(shoppingListCount);
        const used = [];
        const groceries = [];
        const productsIds = [...shoppingList.map(item => item.id)];

        let product = shoppingList.randomElement();
        if (product) {
            groceries.push(product);
            productsIds.push(product.id);
            used.push(product.id)
        }   

        while (groceries.length < groceriesCount) {
            if (Math.random() < chance || (used.length >= shoppingList.length && chance === 0)) {
                product = productDatabase.getRandomProduct(null, productsIds);
                groceries.push(product);
                productsIds.push(product.id);
            } else {
                product = shoppingList.randomElement();
                if (!used.some(g => g === product.id)) {
                    groceries.push(product);
                    productsIds.push(product.id);
                    used.push(product.id)
                }
            }
        }
        
        product = productDatabase.getRandomProduct(null, productsIds);
        if (product) {
            groceries.push();    
        }    

        return [shoppingList, this.#shuffleArray(groceries)];
    }

    /*
    chance=0 - один продкут гарантировано c категорией из selectedCategories, остальные на рандом, не повторяются
    chance=100 - один продукт на рандом, остальные c категорией из selectedCategories, не повторяются
    */
    static #generateCategoryLevel({shoppingListCount, groceriesCount, chance}) {
        const selectedCategories = this.#selectRandomCategories(shoppingListCount);
        const groceries = [];
        const groceriesIds = [];

        let product;
        while (groceries.length < groceriesCount - 2) {
            if (Math.random() < chance)
                product = productDatabase.getRandomProduct(null, groceriesIds, selectedCategories);
            else
                product = productDatabase.getRandomProduct(selectedCategories.randomElement(), groceriesIds);

            if (product) {
                groceries.push(product);
                groceriesIds.push(product.id);
            }
        }

        product = productDatabase.getRandomProduct(selectedCategories.randomElement(), groceriesIds);
        if (product) {
            groceries.push(product)
            groceriesIds.push(product.id);
        }

        product = productDatabase.getRandomProduct(null, groceriesIds, selectedCategories);
        if (product) groceries.push(product);
        
        return [selectedCategories.map(id => productDatabase.getCategories()[id-1]), this.#shuffleArray(groceries)];
    }

    // Вспомогательные методы

    static #getUniqueProducts(count, exceptIds = []) {
        const products = [];
        const localExceptIds = [...exceptIds];
        while (products.length < count) {
            const product = productDatabase.getRandomProduct(null, localExceptIds);
            products.push(product);
            localExceptIds.push(product.id);
        }
        return products;
    }

    static #selectRandomCategories(count) {
        const allCategories = productDatabase.getCategories();
        const selected = [];
        
        while (selected.length < count && selected.length < allCategories.length) {
            const category = allCategories.randomElement();
            if (!selected.some(c => c === category.id)) {
                selected.push(category.id);
            }
        }
        return selected;
    }

    static  #shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}