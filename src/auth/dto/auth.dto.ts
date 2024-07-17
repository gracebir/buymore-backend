import { Role } from "@prisma/client"
import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator"

export class AuthDto {

    @IsString()
    @IsNotEmpty()
    username: string

    @IsNotEmpty()
    @IsEmail()
    email: string

    @IsNotEmpty()
    @IsString()
    password: string

    @IsNotEmpty()
    @IsEnum(Role)
    role: Role
}
