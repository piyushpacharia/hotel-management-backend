// import {IS_DEPLOYE} from '../config';
import custumErrorHandler from '../services/custumErrorHandler.js';
import joi from 'joi'
const ValidationError = joi.ValidationError
const errorHandler = (err,req,res,next)=>{
    let statusCode = 500;
    let data ={
        messages:"Internal Server Error",
        ...(process.env.IS_DEPLOYE === 'true' && {originalError:err.message})
    }

    //Joi Validation Error
    if (err instanceof ValidationError ){
        statusCode = 422;
         data ={
            message: err.message
        }
    }
    //constum Error Handler
    if (err instanceof custumErrorHandler){
        statusCode = err.status;
          data = {
            message: err.message
        }
       
    }
    return  res.status(statusCode).json(data);
}

export default errorHandler