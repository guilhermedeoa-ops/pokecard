import { Transform } from "class-transformer";
import { IsEmail, IsString, Length, Matches, MaxLength } from "class-validator";
const trim = ({ value }: { value: unknown }) => typeof value === "string" ? value.trim() : value;

export class RegisterDto {
  @Transform(trim) @IsString() @Matches(/^[A-Za-z0-9_]{3,32}$/)
  username!: string;
  @Transform(trim) @IsEmail() @MaxLength(254)
  email!: string;
  @IsString() @Length(12, 128)
  password!: string;
  @Transform(trim) @IsString() @Length(2, 32)
  displayName!: string;
}
export class LoginDto {
  @Transform(trim) @IsString() @Length(3, 254)
  identifier!: string;
  @IsString() @Length(1, 128)
  password!: string;
}
export class EmailDto {
  @Transform(trim) @IsEmail() @MaxLength(254)
  email!: string;
}
export class TokenDto {
  @IsString() @Matches(/^[a-f0-9]{64}$/)
  token!: string;
}
export class ResetDto extends TokenDto {
  @IsString() @Length(12, 128)
  password!: string;
}
export class TrainerDto {
  @Transform(trim) @IsString() @Length(2, 32)
  displayName!: string;
}
