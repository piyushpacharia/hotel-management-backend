class customErrorHandler extends Error {
    constructor(status, msg) {
        super();
        this.status = status;
        this.message = msg
    }

    static alreadyExist(message) {
        return new customErrorHandler(409, message)
    }
    static alreadyExistEmail(message) {
        return new customErrorHandler(409, message)
    }
    static notExist(message = 'User not exist with this id'){
        return new customErrorHandler(404, message)
    }

    static wrongCredentails(message = 'Email and password is wrong!') {
        return new customErrorHandler(404, message)
    }
    static unAuthorized(message = 'unAuthorized') {
        return new customErrorHandler(401, message)
    }

    static notFound(message = 'user Not Found') {
        return new customErrorHandler(404, message)
    }
    static ServerError (message = 'Internal server Error') {
        return new customErrorHandler(500, message)
    }
    static Empty (message = "Opps there is no Data in DataBase"){
        return new customErrorHandler(404, message)
    }
    static InvalidExt (message = "Invalid extension. Accept png and jpeg files"){
        return new customErrorHandler(422, message)
    }
    static verify (message = 'You are not verified'){
        return new customErrorHandler(401, message)
    }
    static isSubscribed (message = 'Please subscribe to our plan'){
        return new customErrorHandler(402, message)
    }
}
export default customErrorHandler