import CartModel from "../models/cart.model.js";
import ProductManager from "./ProductManager.js";
import mongoDB from "../config/mongoose.config.js";

const PRODUCT = new ProductManager();

export default class CartManager {
    #itemModel;

    // Constructor
    constructor() {
        this.#itemModel = CartModel;
    }

    // Funciones privadas
    #readItems = async () => {
        try {
            const items = await this.#itemModel.find().lean();
            return items;
        } catch (error) {
            console.log(error.message);
        }
    };

    #escribirArchivo = async (datos) => {
        try {
            return await datos.save();
        } catch (error) {
            console.log(error.message);
        }    
    };

    #identifyId = async (id) => {
        const itemId = await this.#itemModel.findById(id);
        return itemId;
    };

    // Funciones públicas
    addCart = async () => {
        try {
            const cart = new this.#itemModel({ products: [] });
            await this.#escribirArchivo(cart)
            return "Carrito Agregado";
        } catch (error) {
            console.log(error.message);
        }
    };

    getCartById = async (id) => {
        if (!mongoDB.isValidId(id)) {
            return "ID no válido";
        }
        const respuesta = await this.#identifyId(id);
        if(!respuesta){
            return "Not found";
        } else {
            return respuesta;
        }
    };

    addProductToCart = async (cartId, productId) => {
        if (!mongoDB.isValidId(cartId) || !mongoDB.isValidId(productId)) {
            return "ID no válido";
        }
        try {
            const cart = await this.#identifyId(cartId);
            const product = await PRODUCT.getProductById(productId);

            if (!cart) {
                return "Carrito no encontrado";
            }
            if (!product) {
                return "Producto no encontrado";
            }

            const productInCart = cart.products.find(p => p.id.toString() === productId.toString());
            console.log("Producto en carrito:", productInCart);

            if (productInCart) {
                productInCart.quantity++;
            } else {
                cart.products.push({ id: productId, quantity: 1 });
            }

            await this.#escribirArchivo(cart);
            return productInCart ? "Cantidad Incrementada" : "Producto Agregado";

        } catch (error) {
            console.log(error.message);
            return "Error al agregar el producto al carrito";
        }
    };

    deleteProductFromCart = async (cartId, productId) => {
        if (!mongoDB.isValidId(cartId) || !mongoDB.isValidId(productId)) {
            return "ID no válido";
        }
    
        try {
            const cart = await this.#identifyId(cartId);
    
            if (!cart) {
                return "Carrito no encontrado";
            }
    
            const productIndex = cart.products.findIndex(p => p.id.toString() === productId.toString());
    
            if (productIndex !== -1) {
                cart.products.splice(productIndex, 1);
                await this.#escribirArchivo(cart);
                return "Producto Eliminado";
            } else {
                return "Producto no encontrado en el carrito";
            }
    
        } catch (error) {
            console.log(error.message);
            return "Error al eliminar el producto del carrito";
        }
    };

    updateCartQuantity = async (cartId, productId, quantity) => {
        if (!mongoDB.isValidId(cartId) || !mongoDB.isValidId(productId)) {
            return "ID no válido";
        }
    
        try {
            const cart = await this.#identifyId(cartId);
    
            if (!cart) {
                return "Carrito no encontrado";
            }
    
            const productIndex = cart.products.findIndex(p => p.id.toString() === productId.toString());
    
            if (productIndex !== -1) {
                cart.products[productIndex].quantity = quantity;
                console.log(quantity);
                await this.#escribirArchivo(cart);
                return "Cantidad de producto modificada";
            } else {
                return "Producto no encontrado en el carrito";
            }
    
        } catch (error) {
            console.log(error.message);
            return "Error al modificar la cantidad del producto en el carrito";
        }
    };

    cleanCart = async (id) => {
        if (!mongoDB.isValidId(id)) {
            return "ID no válido";
        }
    
        try {
            const cart = await this.#identifyId(id);
    
            if (!cart) {
                return "Carrito no encontrado";
            }
    
            cart.products = []; // Vaciar la lista de productos
            await this.#escribirArchivo(cart); // Guardar los cambios
            return "Todos los productos han sido eliminados del carrito";
        } catch (error) {
            console.log(error.message);
            return "Error al eliminar los productos del carrito";
        }
    };

    updateCart = async (id, updateData) => {
        if (!mongoDB.isValidId(id)) {
            return null;
        }
        try {
            const updatedCart = await this.#itemModel.findByIdAndUpdate(id, updateData, { new: true });
            if (updatedCart) {
                return updatedCart;  // Devuelve el carrito actualizado en lugar de un mensaje de texto
            } else {
                return null;  // Devuelve null si no se encontró el carrito
            }
        } catch (error) {
            console.log(error.message);
            return "Error al actualizar el carrito";  // Lanza un error si algo sale mal
        }
    };

    getCarts = async () => {
        try {
            return await this.#readItems();
        } catch (error) {
            console.log(error.message);
        }
    };
}