const BaseService = require('./baseService');
const supplierRepository = require('../repositories/supplierRepository');
const NotFoundError = require('../exceptions/NotFoundError');
const AppError = require('../exceptions/AppError');
const { generateRandomString } = require('../utils/helpers');
const { formatPhoneNumber, formatEmail } = require('../utils/formatters');

class SupplierService extends BaseService {
  constructor() {
    super(supplierRepository);
  }

  /**
   * Create supplier with auto code generation
   */
  async create(supplierData, userId, companyId) {
    // Auto-generate code if not provided
    if (!supplierData.code) {
      let code;
      let exists = true;
      let attempts = 0;

      while (exists && attempts < 10) {
        code = `SUPP-${generateRandomString(6).toUpperCase()}`;
        exists = await supplierRepository.findByCode(code, companyId);
        attempts++;
      }

      if (exists) {
        throw new AppError('Unable to generate unique supplier code. Please provide one manually.', 400);
      }

      supplierData.code = code;
    } else {
      // Check if code already exists
      const existing = await supplierRepository.findByCode(supplierData.code, companyId);
      if (existing) {
        throw new AppError('Supplier code already exists', 400);
      }
      supplierData.code = supplierData.code.toUpperCase();
    }

    // Check email uniqueness if provided
    if (supplierData.email) {
      const existing = await supplierRepository.findByEmail(supplierData.email, companyId);
      if (existing) {
        throw new AppError('Email already exists', 400);
      }
      supplierData.email = formatEmail(supplierData.email);
    }

    // Format phone
    if (supplierData.phone) {
      supplierData.phone = formatPhoneNumber(supplierData.phone);
      // Check phone uniqueness
      const existing = await supplierRepository.findByPhone(supplierData.phone, companyId);
      if (existing) {
        throw new AppError('Phone number already exists', 400);
      }
    }

    supplierData.companyId = companyId;
    supplierData.createdBy = userId;

    return await supplierRepository.create(supplierData);
  }

  /**
   * Update supplier
   */
  async update(id, supplierData, userId, companyId) {
    const supplier = await supplierRepository.findById(id);

    if (!supplier) {
      throw new NotFoundError('Supplier');
    }

    if (supplier.companyId.toString() !== companyId.toString()) {
      throw new AppError('Not authorized to update this supplier', 403);
    }

    // Check code uniqueness if being updated
    if (supplierData.code && supplierData.code !== supplier.code) {
      const existing = await supplierRepository.findByCode(supplierData.code, companyId);
      if (existing) {
        throw new AppError('Supplier code already exists', 400);
      }
      supplierData.code = supplierData.code.toUpperCase();
    }

    // Check email uniqueness if being updated
    if (supplierData.email && supplierData.email !== supplier.email) {
      const existing = await supplierRepository.findByEmail(supplierData.email, companyId);
      if (existing) {
        throw new AppError('Email already exists', 400);
      }
      supplierData.email = formatEmail(supplierData.email);
    }

    // Check phone uniqueness if being updated
    if (supplierData.phone && supplierData.phone !== supplier.phone) {
      supplierData.phone = formatPhoneNumber(supplierData.phone);
      const existing = await supplierRepository.findByPhone(supplierData.phone, companyId);
      if (existing) {
        throw new AppError('Phone number already exists', 400);
      }
    }

    supplierData.updatedBy = userId;
    return await supplierRepository.updateById(id, supplierData);
  }

  /**
   * Get supplier by ID
   */
  async getById(id, companyId) {
    const supplier = await supplierRepository.findById(id);

    if (!supplier) {
      throw new NotFoundError('Supplier');
    }

    if (supplier.companyId.toString() !== companyId.toString()) {
      throw new AppError('Not authorized to access this supplier', 403);
    }

    return supplier;
  }

  /**
   * Get all suppliers with filters
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

    return await supplierRepository.findAll(query, options);
  }

  /**
   * Search suppliers
   */
  async search(searchTerm, companyId, options = {}) {
    return await supplierRepository.search(searchTerm, companyId, options);
  }

  /**
   * Get active suppliers
   */
  async getActiveSuppliers(companyId, options = {}) {
    return await supplierRepository.findActiveSuppliers(companyId, options);
  }
}

module.exports = new SupplierService();

