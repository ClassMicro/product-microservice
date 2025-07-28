import 'dotenv/config';
import * as joi from 'joi';


interface EnvVars{
    PORT : number;
    DATABASE_URL : string;
}
// son los datos de entorno que vammos a validar y que se tienen que definir
// si no se definen lanzamos un error
const envschema = joi.object({
    PORT: joi.number().required() , 
    DATABASE_URL : joi.string().required(),
}).unknown(true);

const {error , value  } = envschema.validate(process.env);

if (error) {
    throw new Error(`configuracion de validacion de entorno: ${error.message}`);
}

const envVars : EnvVars = value;


export const envs ={
    port : envVars.PORT,
    databaseUrl : envVars.DATABASE_URL,
}