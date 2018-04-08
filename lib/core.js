let _ = require('lodash');

let Const = require('./const');
let Log = require('./log');
let Util = require('./util');
let UserService = require('../service/UserService');

let Core = {

    initContext: (req, res, next) => {
		let Context = {
            request: req,
            response: res,
            params: _.merge(req.query, req.body),
            next: next,
            user: undefined,

            update: function ()
            {
                Context.params = _.merge(Context.request.query, Context.request.params, Context.request.body);
                return Context;
            },

            checkParams: function (keys)
            {
                for (let i = 0; i < keys.length; i++)
                {
					let key = keys[i];
                    if (!Core.params.hasOwnProperty(key))
                    {
                        Core.errorFinish(Core.Const.ERROR.ERROR_PARAM_NOT_SET, `${key} not set`);
                        return false;
                    }
                }

                return true;
            },

            errorFinish: function (code, message)
            {
                Context.response.json({
                    code: code,
                    message: message
                }).end();
            },

            finish: function (data)
            {
                Context.response.json({
                    code: 0,
                    data: data
                }).end();
            },

            processError: function (error)
            {
                if (error.hasOwnProperty('code') && error.hasOwnProperty('message'))
                {
                    return Context.errorFinish(error.code, error.message);
                }

                Context.errorFinish(-1, '' + error);
            },

            canGuestAccess: function (route)
            {
                var action =  Core.getAction(route);
                return action && action.canGuestAccess;
            },
        };

        return Context;
    },

    auth: (context) => {
		let request = context.request;

        request.header('Access-Control-Allow-Origin', '*');

        if (context.canGuestAccess(request.path))
        {
            return Promise.resolve();
        }
        if (request.body.token == undefined)
        {
            context.errorFinish(Const.ERROR.ERROR_NOT_AUTHORIZED, 'not authorized');
            return Promise.reject();
        }

		let token = request.body.token;
        return UserService.getUserByToken(token).then((user) =>
        {
            context.user = user;
        });
    },

    installAction: (router, actionMap) => {
		let ACTION = {};
        for (let route in actionMap)
        {
            if (actionMap.hasOwnProperty(route))
            {
				let canGuestAccess = _.startsWith(route, '~');
				let action = actionMap[route];
				let func = action[0];
				let arg = action.slice(1);

				let argList = [];
                for (let i = 0; i < arg.length; i++)
                {
                    argList.push(Util.parseApiKey(arg[i]));
                }

                route = _.trim(route, '~');

                ACTION[route] = {
                    func: func,
                    argList:  argList,
                    canGuestAccess: canGuestAccess
                };

                router.get(route, Core.runAction);
                router.post(route, Core.runAction);
            }
        }
        Core.ACTION = ACTION;
    },

    hasAction: (route) => {
        return Core.ACTION.hasOwnProperty(route);
    },

    getAction: (route) => {
        return Core.ACTION[route];
    },

    runAction: (req, res, next) => {
		let path = req.route.path;
        path = _.trimEnd(path, '/');

        if (Core.hasAction(path))
        {
            var context = Core.initContext(req, res, next);
            context = context.update();
            Core.auth(context).then(() =>
            {
				let {func, argList} = Core.getAction(path);
				let params = [context];
                for (let i = 0; i < argList.length; i++)
                {
					let {key, defaultValue} = argList[i];
					let value = undefined;
                    if (context.params.hasOwnProperty(key))
                    {
                        value = context.params[key];
                    }
                    else
                    {
                        if (defaultValue === undefined)
                        {
                            return context.errorFinish(Const.ERROR.ERROR_PARAM_NOT_SET, `param ${key} not set`);
                        }

                        value = defaultValue;
                    }

                    params.push(value);
                }

                func.apply(null, params);
            });
        }
        else
        {
            next();
        }
    },

    errorHandler: (err, req, res, next) => {
        console.log(err);
        res.status(500).json({
            code: -2,
            message: 'an internal error occurred'
        }).end();
    },

    notFoundHandler: (req, res) => {
        res.status(404).json({
            code: -1,
            message: 'not found'
        }).end();
    }
};

Core.Const = Const;
Core.Log = Log;
Core.Util = Util;

module.exports = Core;
