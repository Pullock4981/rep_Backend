const BaseRepository = require('./baseRepository');
const Unit = require('../models/Unit');

class UnitRepository extends BaseRepository {
  constructor() {
    super(Unit);
  }
}

module.exports = new UnitRepository();

