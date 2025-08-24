
const db = require('../models');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class MembershipsDBApi {

    static async create(data, options) {
        const currentUser = (options && options.currentUser) || { id: null };
        const transaction = (options && options.transaction) || undefined;

        const memberships = await db.memberships.create(
            {
                id: data.id || undefined,

        name: data.name
        ||
        null
            ,

        role: data.role
        ||
        null
            ,

        active: data.active
        ||
        false

            ,

        membership_start_date: data.membership_start_date
        ||
        null
            ,

        membership_end_date: data.membership_end_date
        ||
        null
            ,

            importHash: data.importHash || null,
            createdById: currentUser.id,
            updatedById: currentUser.id,
    },
        { transaction },
    );

        return memberships;
    }

    static async bulkImport(data, options) {
        const currentUser = (options && options.currentUser) || { id: null };
        const transaction = (options && options.transaction) || undefined;

        // Prepare data - wrapping individual data transformations in a map() method
        const membershipsData = data.map((item, index) => ({
                id: item.id || undefined,

                name: item.name
            ||
            null
            ,

                role: item.role
            ||
            null
            ,

                active: item.active
            ||
            false

            ,

                membership_start_date: item.membership_start_date
            ||
            null
            ,

                membership_end_date: item.membership_end_date
            ||
            null
            ,

            importHash: item.importHash || null,
            createdById: currentUser.id,
            updatedById: currentUser.id,
            createdAt: new Date(Date.now() + index * 1000),
    }));

        // Bulk create items
        const memberships = await db.memberships.bulkCreate(membershipsData, { transaction });

        return memberships;
    }

    static async update(id, data, options) {
        const currentUser = (options && options.currentUser) || {id: null};
        const transaction = (options && options.transaction) || undefined;

        const memberships = await db.memberships.findByPk(id, {}, {transaction});

        const updatePayload = {};

        if (data.name !== undefined) updatePayload.name = data.name;

        if (data.role !== undefined) updatePayload.role = data.role;

        if (data.active !== undefined) updatePayload.active = data.active;

        if (data.membership_start_date !== undefined) updatePayload.membership_start_date = data.membership_start_date;

        if (data.membership_end_date !== undefined) updatePayload.membership_end_date = data.membership_end_date;

        updatePayload.updatedById = currentUser.id;

        await memberships.update(updatePayload, {transaction});

        return memberships;
    }

    static async deleteByIds(ids, options) {
        const currentUser = (options && options.currentUser) || { id: null };
        const transaction = (options && options.transaction) || undefined;

        const memberships = await db.memberships.findAll({
            where: {
                id: {
                    [Op.in]: ids,
                },
            },
            transaction,
        });

        await db.sequelize.transaction(async (transaction) => {
            for (const record of memberships) {
                await record.update(
                    {deletedBy: currentUser.id},
                    {transaction}
                );
            }
            for (const record of memberships) {
                await record.destroy({transaction});
            }
        });

        return memberships;
    }

    static async remove(id, options) {
        const currentUser = (options && options.currentUser) || {id: null};
        const transaction = (options && options.transaction) || undefined;

        const memberships = await db.memberships.findByPk(id, options);

        await memberships.update({
            deletedBy: currentUser.id
        }, {
            transaction,
        });

        await memberships.destroy({
            transaction
        });

        return memberships;
    }

    static async findBy(where, options) {
        const transaction = (options && options.transaction) || undefined;

        const memberships = await db.memberships.findOne(
            { where },
            { transaction },
        );

        if (!memberships) {
            return memberships;
        }

        const output = memberships.get({plain: true});

        return output;
    }

    static async findAll(filter, options) {
        const limit = filter.limit || 0;
        let offset = 0;
        let where = {};
        const currentPage = +filter.page;

        const user = (options && options.currentUser) || null;

        offset = currentPage * limit;

        const orderBy = null;

        const transaction = (options && options.transaction) || undefined;

        let include = [];

        if (filter) {
            if (filter.id) {
                where = {
                    ...where,
                    ['id']: Utils.uuid(filter.id),
                };
            }

                if (filter.name) {
                    where = {
                        ...where,
                        [Op.and]: Utils.ilike(
                            'memberships',
                            'name',
                            filter.name,
                        ),
                    };
                }

            if (filter.membership_start_dateRange) {
                const [start, end] = filter.membership_start_dateRange;

                if (start !== undefined && start !== null && start !== '') {
                    where = {
                        ...where,
                    membership_start_date: {
                    ...where.membership_start_date,
                            [Op.gte]: start,
                    },
                };
                }

                if (end !== undefined && end !== null && end !== '') {
                    where = {
                        ...where,
                    membership_start_date: {
                    ...where.membership_start_date,
                            [Op.lte]: end,
                    },
                };
                }
            }

            if (filter.membership_end_dateRange) {
                const [start, end] = filter.membership_end_dateRange;

                if (start !== undefined && start !== null && start !== '') {
                    where = {
                        ...where,
                    membership_end_date: {
                    ...where.membership_end_date,
                            [Op.gte]: start,
                    },
                };
                }

                if (end !== undefined && end !== null && end !== '') {
                    where = {
                        ...where,
                    membership_end_date: {
                    ...where.membership_end_date,
                            [Op.lte]: end,
                    },
                };
                }
            }

            if (filter.active !== undefined) {
                where = {
                    ...where,
                    active: filter.active === true || filter.active === 'true'
                };
            }

            if (filter.role) {
                where = {
                    ...where,
                role: filter.role,
            };
            }

            if (filter.active) {
                where = {
                    ...where,
                active: filter.active,
            };
            }

            if (filter.createdAtRange) {
                const [start, end] = filter.createdAtRange;

                if (start !== undefined && start !== null && start !== '') {
                    where = {
                        ...where,
                        ['createdAt']: {
                            ...where.createdAt,
                            [Op.gte]: start,
                        },
                    };
                }

                if (end !== undefined && end !== null && end !== '') {
                    where = {
                        ...where,
                        ['createdAt']: {
                            ...where.createdAt,
                            [Op.lte]: end,
                        },
                    };
                }
            }
        }

        const queryOptions = {
            where,
            include,
            distinct: true,
            order: filter.field && filter.sort
                ? [[filter.field, filter.sort]]
                : [['createdAt', 'desc']],
            transaction: options?.transaction,
            logging: console.log
        };

        if (!options?.countOnly) {
            queryOptions.limit = limit ? Number(limit) : undefined;
            queryOptions.offset = offset ? Number(offset) : undefined;
        }

        try {
            const { rows, count } = await db.memberships.findAndCountAll(queryOptions);

            return {
                rows: options?.countOnly ? [] : rows,
                count: count
            };
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;
        }
    }

    static async findAllAutocomplete(query, limit, offset) {
        let where = {};

        if (query) {
            where = {
                [Op.or]: [
                    { ['id']: Utils.uuid(query) },
                    Utils.ilike(
                        'memberships',
                        'name',
                        query,
                    ),
                ],
            };
        }

        const records = await db.memberships.findAll({
            attributes: [ 'id', 'name' ],
            where,
            limit: limit ? Number(limit) : undefined,
            offset: offset ? Number(offset) : undefined,
            orderBy: [['name', 'ASC']],
        });

        return records.map((record) => ({
            id: record.id,
            label: record.name,
        }));
    }

};

