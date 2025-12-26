const BaseRepository = require('./baseRepository');
const Customer = require('../models/Customer');

class CustomerRepository extends BaseRepository {
  constructor() {
    super(Customer);
  }

  /**
   * Find customer by code
   */
  async findByCode(code, companyId) {
    return await this.model.findOne({ code: code.toUpperCase(), companyId });
  }

  /**
   * Find customer by email
   */
  async findByEmail(email, companyId) {
    return await this.model.findOne({ email: email.toLowerCase(), companyId });
  }

  /**
   * Find customer by phone
   */
  async findByPhone(phone, companyId) {
    return await this.model.findOne({ phone, companyId });
  }

  /**
   * Search customers
   */
  async search(searchTerm, companyId, options = {}) {
    const {
      populate = [],
      select = '',
      sort = { createdAt: -1 },
      skip = 0,
      limit = 10,
    } = options;

    const query = {
      companyId,
      $text: { $search: searchTerm },
    };

    let dbQuery = this.model.find(query);

    if (populate.length > 0) {
      populate.forEach((pop) => {
        dbQuery = dbQuery.populate(pop);
      });
    }

    if (select) {
      dbQuery = dbQuery.select(select);
    }

    dbQuery = dbQuery.sort(sort).skip(skip).limit(limit);

    const [data, total] = await Promise.all([
      dbQuery,
      this.model.countDocuments(query),
    ]);

    return { data, total };
  }

  /**
   * Get active customers
   */
  async findActiveCustomers(companyId, options = {}) {
    const query = {
      companyId,
      isActive: true,
      status: 'active',
    };

    return await this.findAll(query, {
      sort: { name: 1 },
      ...options,
    });
  }
}

module.exports = new CustomerRepository();

