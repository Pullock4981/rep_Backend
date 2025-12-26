const BaseRepository = require('./baseRepository');
const Brand = require('../models/Brand');

class BrandRepository extends BaseRepository {
  constructor() {
    super(Brand);
  }
}

module.exports = new BrandRepository();

