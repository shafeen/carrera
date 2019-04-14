const assert = require('chai').assert;
const sinon = require('sinon');

describe('ProtectedRouteController', function () {
    const settingsMock = {};
    const UserRouteControllerMock = sinon.stub();
    const expressMock = { Router: sinon.stub() };
    const routeToMiddlewareMap = new Map();
    const routerMock = {
        get: function (route, effectiveMiddleware) {
            routeToMiddlewareMap.set(route, effectiveMiddleware);
        },
        use: sinon.stub()
    };
    const routerGetSpy = sinon.spy(routerMock, 'get');
    expressMock.Router.returns(routerMock);

    before(function () {
        const ProtectedRouteController = require('../../../../../server/src/Express/Routes/api/ProtectedRouteController.js').service(
            settingsMock, expressMock, UserRouteControllerMock
        );
    });

    it('should set a simple GET /test route handler', function () {
        const routeName = '/test';
        assert.isTrue(routerMock.get.calledWith(routeName));
        const routeMiddleware = routeToMiddlewareMap.get(routeName);
        const reqMock = {}, resMock = {json: sinon.stub()};
        routeMiddleware(reqMock, resMock);
        assert.isTrue(resMock.json.calledOnce);
    });

    it('should set a simple GET /ping route handler', function () {
        const routeName = '/ping';
        assert.isTrue(routerMock.get.calledWith(routeName));
        const routeMiddleware = routeToMiddlewareMap.get(routeName);
        const reqMock = {}, resMock = {status: sinon.stub(), send: sinon.stub()};
        resMock.status.returns(resMock);
        routeMiddleware(reqMock, resMock);
        assert.isTrue(resMock.status.calledOnce);
        assert.isTrue(resMock.send.calledOnce);
    });

    it('should set UserRouteController to handle /user subroutes', function () {
        assert.isTrue(routerMock.use.calledOnce);
        assert.isTrue(routerMock.use.calledWith('/user', UserRouteControllerMock));
    });
});
