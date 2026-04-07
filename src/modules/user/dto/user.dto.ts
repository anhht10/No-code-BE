import { Expose, Transform } from "class-transformer";

export class UserResponseDto {
    @Expose()
    @Transform(({ value, obj }) => {
        return value?.toString() || obj.id?.toString() || obj._id?.toString();
    })
    id: string;

    @Expose()
    username: string;

    @Expose()
    name: string;

    @Expose()
    email: string;

    @Expose()
    avatar?: string;

    @Expose()
    gender?: string;

    @Expose()
    role: string;

    @Expose()
    createdAt: Date;

}