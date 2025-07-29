import 'dotenv/config';
import * as joi from 'joi';


interface EnvVars{
    PORT : number;
    //DATABASE_URL : string;
    DB_PORT : number;
    DB_USER : string;
    DB_PASS : string;
    DB_NAME : string;
    DB_HOST : string;

}
// son los datos de entorno que vammos a validar y que se tienen que definir
// si no se definen lanzamos un error
const envschema = joi.object({
    PORT: joi.number().required() , 
    DB_PORT: joi.number().required(),
    DB_USER: joi.string().required(),
    DB_PASS: joi.string().required(),
    DB_NAME: joi.string().required(),
    DB_HOST: joi.string().required(),
}).unknown(true);

const {error , value  } = envschema.validate(process.env);

if (error) {
    throw new Error(`configuracion de validacion de entorno: ${error.message}`);
}

const envVars : EnvVars = value;


export const envs ={
    port : envVars.PORT,
    //databaseUrl : envVars.DATABASE_URL,
    dbPort : envVars.DB_PORT,
    dbUser : envVars.DB_USER,
    dbPass : envVars.DB_PASS,
    dbName : envVars.DB_NAME,
    dbHost : envVars.DB_HOST,
    
}