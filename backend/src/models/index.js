const User = require('./User');
const Product = require('./Product');
const Rental = require('./Rental');
const MaintenanceRequest = require('./MaintenanceRequest');
const ServiceArea = require('./ServiceArea');

// A user can have many rentals; a rental belongs to one user
User.hasMany(Rental, { foreignKey: 'userId', as: 'rentals' });
Rental.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// A product can be rented many times; a rental references one product
Product.hasMany(Rental, { foreignKey: 'productId', as: 'rentals' });
Rental.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// A rental can have many maintenance requests
Rental.hasMany(MaintenanceRequest, { foreignKey: 'rentalId', as: 'maintenanceRequests' });
MaintenanceRequest.belongsTo(Rental, { foreignKey: 'rentalId', as: 'rental' });

// A user (requester) can raise many maintenance requests
User.hasMany(MaintenanceRequest, { foreignKey: 'userId', as: 'maintenanceRequests' });
MaintenanceRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  User,
  Product,
  Rental,
  MaintenanceRequest,
  ServiceArea,
};
