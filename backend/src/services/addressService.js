const db = require("../config/db");
const Address = require("../models/addressModel");

class AddressService {
  static async getAddressesByUserId(userId) {
    return Address.getAddressesByUserId(userId);
  }

  static async addAddress(userId, data) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      if (data.is_default) {
        await Address.clearDefaultByUserId(connection, userId);
      }

      const addressId = await Address.create(connection, {
        user_id: userId,
        full_name: data.full_name,
        phone: data.phone,
        line1: data.line1,
        ward: data.ward || null,
        district: data.district || null,
        city: data.city || null,
        is_default: data.is_default ? 1 : 0,
      });

      await connection.commit();

      return addressId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async updateDefault(userId, addressId) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      await Address.clearDefaultByUserId(connection, userId);

      const result = await Address.setDefault(connection, userId, addressId);

      await connection.commit();

      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async deleteAddress(userId, addressId) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const address = await Address.getAddressById(
        connection,
        userId,
        addressId,
      );

      await Address.delete(connection, userId, addressId);

      if (address?.is_default) {
        await Address.setLatestAddressAsDefault(connection, userId);
      }

      await connection.commit();

      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = AddressService;
