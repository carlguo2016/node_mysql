let db = require('../lib/db');
let Util = require('../lib/util');
let Sequelize = require('sequelize');
let sequelize = db.getSequelize();

let User = function(){
    return sequelize.define('user', {
        id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
        username: { type: Sequelize.STRING, defaultValue: '' },
        password: { type: Sequelize.STRING, defaultValue: '' },
        create_time: { type: Sequelize.BIGINT, defaultValue: 0 },
        update_time: { type: Sequelize.BIGINT, defaultValue: 0 }
    }, {
        timestamps: false,
        underscored: true,
        freezeTableName: true
    });
};

User.basicAttributes = ['username'];
User.detailAttributes = ['id', 'username', 'password', 'create_time', 'update_time'];

User.processModel = (model, keys) => {
    model = Util.formatModel(model, keys);
    if (model)
    {

    }
    return model;
};

function findById(id)
{
    return User().findOne({
        where: {
            id: id
        }
    });
}

module.exports.findById = findById;
module.exports = User;
