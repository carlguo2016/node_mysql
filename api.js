let UserController = require('./controller/UserController');

/**
 * ~ 开头表示无需验证token
 */

let ApiList = {

    /*============================================================
     User相关Api
     ============================================================*/
    '~/v1/user/login':                           [UserController.login, 'username', 'password'],
    '~/v1/user/register':                        [UserController.register, 'username', 'password'],
    '/v1/user/detail':                           [UserController.detail],
    '/v1/user/list':                             [UserController.userList],
};

module.exports = ApiList;