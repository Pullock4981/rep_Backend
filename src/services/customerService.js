const BaseService = require('./baseService');
const customerRepository = require('../repositories/customerRepository');
const NotFoundError = require('../exceptions/NotFoundError');
const AppError = require('../exceptions/AppError');
const { generateRandomString } = require('../utils/helpers');
const { formatPhoneNumber, formatEmail } = require('../utils/formatters');

class CustomerService extends BaseService {
  constructor() {
    super(customerRepository);
  }

  /**
   * Create customer with auto code generation
   */
  async create(customerData, userId, companyId) {
    // Auto-generate code if not provided
    if (!customerData.code) {
      let code;
      let exists = true;
      let attempts = 0;

      while (exists && attempts < 10) {
        code = `CUST-${generateRandomString(6).toUpperCase()}`;
        exists = await customerRepository.findByCode(code, companyId);
        attempts++;
      }

      if (exists) {
        throw new AppError('Unable to generate unique customer code. Please provide one manually.', 400);
      }

      customerData.code = code;
    } else {
      // Check if code already exists
      const existing = await customerRepository.findByCode(customerData.code, companyId);
      if (existing) {
        throw new AppError('Customer code already exists', 400);
      }
      customerData.code = customerData.code.toUpperCase();
    }

    // Check email uniqueness if provided
    if (customerData.email) {
      const existing = await customerRepository.findByEmail(customerData.email, companyId);
      if (existing) {
        throw new AppError('Email already exists', 400);
      }
      customerData.email = formatEmail(customerData.email);
    }

    // Format phone
    if (customerData.phone) {
      customerData.phone = formatPhoneNumber(customerData.phone);
      // Check phone uniqueness
      const existing = await customerRepository.findByPhone(customerData.phone, companyId);
      if (existing) {
        throw new AppError('Phone number already exists', 400);
      }
    }

    customerData.companyId = companyId;
    customerData.createdBy = userId;

    return await customerRepository.create(customerData);
  }

  /**
   * Update customer
   */
  async update(id, customerData, userId, companyId) {
    const customer = await customerRepository.findById(id);

    if (!customer) {
      throw new NotFoundError('Customer');
    }

    if (customer.companyId.toString() !== companyId.toString()) {
      throw new AppError('Not authorized to update this customer', 403);
    }

    // Check code uniqueness if being updated
    if (customerData.code && customerData.code !== customer.code) {
      const existing = await customerRepository.findByCode(customerData.code, companyId);
      if (existing) {
        throw new AppError('Customer code already exists', 400);
      }
      customerData.code = customerData.code.toUpperCase();
    }

    // Check email uniqueness if being updated
    if (customerData.email && customerData.email !== customer.email) {
      const existing = await customerRepository.findByEmail(customerData.email, companyId);
      if (existing) {
        throw new AppError('Email already exists', 400);
      }
      customerData.email = formatEmail(customerData.email);
    }

    // Check phone uniqueness if being updated
    if (customerData.phone && customerData.phone !== customer.phone) {
      customerData.phone = formatPhoneNumber(customerData.phone);
      const existing = await customerRepository.findByPhone(customerData.phone, companyId);
      if (existing) {
        throw new AppError('Phone number already exists', 400);
      }
    }

    customerData.updatedBy = userId;
    return await customerRepository.updateById(id, customerData);
  }

  /**
   * Get customer by ID
   */
  async getById(id, companyId) {
    const customer = await customerRepository.findById(id);

    if (!customer) {
      throw new NotFoundError('Customer');
    }

    if (customer.companyId.toString() !== companyId.toString()) {
      throw new AppError('Not authorized to access this customer', 403);
    }

    return customer;
  }

  /**
   * Get all customers with filters
   */
  async getAll(queryParams, companyId) {
    const query = { companyId };

    // Filter by type
    if (queryParams.type) {
      query.type = queryParams.type;
    }

    // Filter by status
    if (queryParams.status) {
      query.status = queryParams.status;
    }

    // Filter by active status
    if (queryParams.isActive !== undefined) {
      query.isActive = queryParams.isActive === 'true';
    }

    // Search by name, email, or phone
    if (queryParams.search) {
      query.$or = [
        { name: { $regex: queryParams.search, $options: 'i' } },
        { email: { $regex: queryParams.search, $options: 'i' } },
        { phone: { $regex: queryParams.search, $options: 'i' } },
        { code: { $regex: queryParams.search, $options: 'i' } },
      ];
    }

    const options = {
      sort: queryParams.sort || { name: 1 },
    };

    return await customerRepository.findAll(query, options);
  }

  /**
   * Search customers
   */
  async search(searchTerm, companyId, options = {}) {
    return await customerRepository.search(searchTerm, companyId, options);
  }

  /**
   * Get active customers
   */
  async getActiveCustomers(companyId, options = {}) {
    return await customerRepository.findActiveCustomers(companyId, options);
  }
}

module.exports = new CustomerService();

