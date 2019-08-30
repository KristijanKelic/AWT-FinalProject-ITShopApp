const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  surname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  cart: {
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: { type: Number, required: true }
      }
    ]
  }
});

userSchema.plugin(uniqueValidator);

userSchema.methods.addToCart = function(product) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const newCartItems = [...this.cart.items];
  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    newCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    newCartItems.push({
      productId: product._id,
      quantity: newQuantity
    });
  }
  this.cart = {
    items: newCartItems
  };
  return this.save();
};

userSchema.methods.removeFromCart = function(productId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return item.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.changeCartProductQuantity = function(productId, change) {
  const productToChangeQuantity = this.cart.items.find(product => {
    return product.productId.toStirng() === productId.toString();
  });
  const productToChangeQuantityIndex = this.cart.items.findIndex(product => {
    return product.productId.toStirng() === productId.toString();
  });
  if (change === 'plus') {
    productToChangeQuantity.quantity += 1;
  } else {
    productToChangeQuantity.quantity -= 1;
  }
  this.cart.items[productToChangeQuantityIndex] = productToChangeQuantity;
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
